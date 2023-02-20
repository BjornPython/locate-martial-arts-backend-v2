const asyncHandler = require("express-async-handler")
const jwt = require("jsonwebtoken")
const Message = require("../models/messageModel")
const { v4: uuidv4 } = require('uuid');
const { editUsersMessageChunk, addUserMessage, editUserConvoSeen } = require("./userControllers");


const getConvoChunk = asyncHandler(async (conversationId, convoChunk) => {
    const convo = await Message.findOne({conversationId, chunkNumber: convoChunk})
    return convo
})

const makeConvo = asyncHandler(async (participantOne, participantOneId, participantTwo, participantTwoId) => {
    console.log("IN CREATE CONVO");
    const conversationId = uuidv4()
    const participants = [
        {_id: participantOneId, name: participantOne}, 
        {_id: participantTwoId, name: participantTwo}
    ]
    console.log("PARTICIPANTS: ", participants);
    const chunkNumber = 0


    try {
    Message.create({
    conversationId, participants, chunkNumber
        })

    const userIds = [participantOneId, participantTwoId]
    const userNames = [participantOne, participantTwo]
    const newUserMessages = await addUserMessage(userIds, userNames, conversationId, chunkNumber)
    console.log("NEW USER MESSAGES: ", newUserMessages);
    return {newUserMessages, conversationId}



    } catch (err) {
        console.log("ERROR: ", err);
        throw(err)

    }
    
})


const createConvo = asyncHandler(async (req, res) => {

    const conversationId = uuidv4()
    const {participantOne, participantOneId, participantTwo, participantTwoId }= req.body
    const participants = [
        {_id: participantOneId, name: participantOne}, 
        {_id: participantTwoId, name: participantTwo}
    ]
    const chunkNumber = 0


    try {
    Message.create({
    conversationId, participants, chunkNumber
        })

    const userIds = [participantOneId, participantTwoId]
    const userNames = [participantOne, participantTwo]
    addUserMessage(userIds, userNames, conversationId, chunkNumber)

    res.status(200).json({message: "SUCCESS"})


    } catch (err) {
        console.log("ERROR: ", err);
        res.status(400).json({message: "FAILED"})

    }
    
})




const addMessage = asyncHandler(async (conversationId, newMessage, senderId, receiverId) => {

    const messageInfo = {senderId, message: newMessage}
    Message.findOne({ conversationId })
    .sort({ chunkNumber: -1 })
    .then(document => {
        if (document.messages.length < 5) {
            Message.findOneAndUpdate(
                { _id: document._id },
                { $push: { messages: messageInfo } },
                { new: true, useFindAndModify: false }
            )
                .then(result => {
                    console.log(result);
                    editUserConvoSeen({senderId, receiverId}, false)
                    console.log("ADDED MSG TO CONVO");
                })
                .catch(error => {
                    console.error(error);
                    console.log("FAILED TO AD DMSG TO CONVO");
                });
        } else {
            const nextChunkNumber = document.chunkNumber + 1;
            const userIds = [document.participants[0]._id, document.participants[1]._id]
            const newDocument = new Message({
                conversationId,
                participants: document.participants,
                messages: [messageInfo],
                chunkNumber: nextChunkNumber
            });
            newDocument.save()
                .then(result => {
                    console.log(result);
                    editUsersMessageChunk(userIds, nextChunkNumber)
                    editUserConvoSeen({senderId, receiverId}, false)
                    console.log("MADE NEW MSG DOC AND ADDED MSG");
                })
                .catch(error => {
                    console.error(error);
                    console.log("FAILED TO MAKE NEW MSG DOC AND ADDED MSG");
                });
        }
    })
    .catch(error => {
        console.error(error);
    });
})



module.exports = {getConvoChunk, createConvo, addMessage, makeConvo}