const {getConvoChunk, makeConvo, addMessage } = require("./messageControllers")
const Message = require("../models/messageModel")
const User = require("../models/userModel")
const Gym = require("../models/gymModel")
const jwt = require("jsonwebtoken")
const { editUserConvoSeen }  = require("./userControllers")

const makeSocket = (server) => {
    const io = require('socket.io')(server, {
        cors: {
            origin: "http://localhost:5000"
        }
    });


    io.on("connection", (socket) => {

        socket.on("usersRoom", (userId) => {
            console.log("USER ID RECEIVED: ", userId);
            socket.join(userId)
        })



        socket.on("joinConversation", async (info) => {
            const {conversationId} = info
            if (!conversationId ) 
            {console.log("MISSING REQUIREMENTS: conversationId "); return}
            const conversation = await Message.findOne({conversationId})
            if (!conversation) {return}
            const participants = conversation.participants
            const decoded = jwt.verify(info.token, process.env.JWT_TOKEN)
            for (let i = 0; i < participants.length; i++) {
                if (participants[i]._id === decoded.id) {
                    socket.join(conversationId)
                    break;
                } 
            }
        })

        socket.on("requestMessage", async (info) => {
            const {token, conversationId, chunk} = info
            console.log("RECEIVED DATA: ", token, conversationId, chunk, (!token || !conversationId || chunk === undefined ));

            if (!token || !conversationId || chunk === undefined ) {console.log("MISSING REQUIREMENTS: !token || !conversationId || !chunk"); return}
            const res = await getConvoChunk(conversationId, chunk)
            const participants = res.participants
            const decoded = jwt.verify(token, process.env.JWT_TOKEN)
            for (let i = 0; i < participants.length; i++) {
                if (participants[i]._id === decoded.id) {
                    console.log("EMITTING MESSAGE CONTENTS: ", res.messages);
                    socket.emit("messageContents", {conversationId, messageContent: res.messages})
                    break;
                } 
            }

        })

        socket.on("addMessage", async (msgData) => {
            console.log("MSG RECEIVED");
            const {token, conversationId, message, chunk } = msgData
            const decoded = jwt.verify(token, process.env.JWT_TOKEN)
            const convoChunk = await getConvoChunk(conversationId, chunk)
            
            const participants = convoChunk.participants
            for (let i = 0; i < participants.length; i++) {
                if (participants[i]._id === decoded.id) {
                    const receiverId = i === 0 ? participants[1] : participants[0]
                    const res = await addMessage(conversationId, message, decoded.id, receiverId)
                    io.to(conversationId).emit("newMessage", {conversationId, message: message, senderId: decoded.id})
                    break;
                } 
            }            
        })

        socket.on("newConvo", async (convoData) => {
            console.log("IN NEW CONVO");
            const {token, participantOne, participantOneId, participantTwo, participantTwoId} = convoData
            if (!token || !participantOne || !participantOneId || !participantTwo || !participantTwoId) {return}
            try {
                const decoded = jwt.verify(token, process.env.JWT_TOKEN)
                const user =  await User.findById(decoded.id)
                if (user) { 
                    const res = await makeConvo(participantOne, participantOneId, participantTwo, participantTwoId)
                    const newUserOneChat = res.newUserMessages.userOneMessages
                    console.log("EMITTING NEW CHAT 1");
                    socket.emit("newChat", newUserOneChat);
                    const newUserTwoChat = res.newUserMessages.userTwoMessages
                    socket.to(participantTwoId).emit("requestJoinRoom", ({conversationId: res.conversationId, newChat: newUserTwoChat}));
                } else {
                    console.log("FINDING GYM USER WITH ID: ", decoded.id);
                    const  gymUser = await Gym.findById(decoded.id)
                    console.log("GYM USER: ", gymUser);
                    if (gymUser) {
                        const res = await makeConvo(participantOne, participantOneId, participantTwo, participantTwoId)
                        const newUserOneChat = res.newUserMessages.userOneMessages
                        socket.emit("newChat", newUserOneChat);
                    console.log("EMITTING NEW CHAT 2");
                    const newUserTwoChat = res.newUserMessages.userTwoMessages
                        socket.to(participantTwoId).emit("requestJoinRoom", ({conversationId: res.conversationId, newChat: newUserTwoChat}));
                    }
                }
                
            } catch (err) {
                console.log(err);
            }
        }) 

        

        socket.on("toggleSeen", async (chatData) => {
            const {token, chatId, isSeen} = chatData

            const decoded = jwt.verify(token, process.env.JWT_TOKEN)
            const user =  await User.findById(decoded.id)
            if (user) {
            editUserConvoSeen({senderId: chatId, receiverId: decoded.id}, true)
        } 
        })

    })




}

module.exports = {makeSocket}


