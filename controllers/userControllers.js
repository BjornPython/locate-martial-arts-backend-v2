const asyncHandler = require("express-async-handler")
const User = require("../models/userModel")
const Gym = require("../models/gymModel")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")



// REGISTER USER // REGISTER USER // REGISTER USER // REGISTER USER // REGISTER USER 

const registerUser = asyncHandler(async (req, res) => {
    const {
        name,
        email,
        password 
    } = req.body

    if (!name || !email || !password) {
        res.status(400).json({message: "Please include all fields."})
    }

    const salt = await bcrypt.genSalt(10)
    const hashedPass = await bcrypt.hash(password, salt)


    const user = await User.create({
        name, email, password: hashedPass
    })
    console.log(user);
    if (user) {
        const token = generateToken(user.id)
        res.status(200).json(token)

    } else {
        res.status(400).json({error: "Failed to create User."})

    }

})


// LOGIN USER // LOGIN USER // LOGIN USER // LOGIN USER // LOGIN USER // LOGIN USER 

const loginUser = asyncHandler(async (req, res) => {
    console.log("IN LOG IN");
    const {email, password} = req.body
    console.log(email, password);
    const user = await User.findOne({email})
    if (user) {
        if (!bcrypt.compare(password, user.password)) {
            return res.status(400).json({message: "Wrong email or password"})
        }
        const token = generateToken(user.id)
        res.status(200).json({type: "user", token}) 

    } else {
        console.log("NO USER, FINDING GYM...");
        const gym = await Gym.findOne({email})
        if (gym) {
            if (!bcrypt.compare(password, gym.password)) {
                console.log("WRONG PASS...");
                return res.status(400).json({message: "Wrong email or password"})
            }
            console.log("GENERATING TOKEN...");
            const token = generateToken(gym.id)
            res.status(200).json({type: "gym", token})  
        } else {
            res.status(400).json({message: "Wrong Email or Password."})
        }

    }
})

// Generate token for Users
const generateToken = (id) => {
    return jwt.sign({id}, process.env.JWT_TOKEN, {expiresIn: "7d"})
}




// GETTING USER DATA // GETTING USER DATA // GETTING USER DATA // GETTING USER DATA 

const getSparringUsers = asyncHandler(async (req, res) => {
    console.log("IN GET SPARRING USERS");
    let { marts } = req.body
    let { lat, long } = req.body.location
    if (marts === "[]") {marts = null}
    // If location is not sent,
    if (!lat || !long || lat === null || long === null) {
        // If martial arts are sent, get users with lfspar = true and has one of the martial arts.
        if (marts) {
            console.log("IN SPAR 1");
            const jsonMarts = JSON.parse(marts)
            const searchMarts = jsonMarts.map((art) => {
                return {[`lfSparArts.${art}`]: {$exists: true}}
            })
            let query = {lfSpar: true, $or: []}
            query.$or = query.$or.concat(searchMarts.map(val => val)) 
            console.log("query: ", query);
            const user = await User.find(query).select('-password -email');
            console.log("USER: ", user);
            if (user) {res.status(200).json(user)}
            else {res.status(401).json({message: "Failed to get data from user database."})}
            
        // if martial arts are not sent, get users with lfspar = true
        } else {
            console.log("IN SPAR 2");

            const user = await User.find({lfspar: true}).select('-password -email');
            console.log("USER: ", user);

            if (user) {res.status(200).json(user)}
            else {res.status(401).json({message: "Failed to get data from user database."})}
        }
    
        // if location is sent,
    } else {

        // if martial arts are sent, get users with lfspar = true, near the location, and has one of the martial arts.
        if (marts) {
            console.log("IN SPAR 3");

            const jsonMarts = JSON.parse(marts)
            const searchMarts = jsonMarts.map((art) => {
                return {[`lfSparArts.${art}`]: {$exists: true}}
            })
            let query = {lfSpar: true, "location.lat": {$lt: 0.3 + parseFloat(lat), $gt: parseFloat(lat) - 0.3}, "location.long": {$lt: 0.3 + parseFloat(long), $gt: parseFloat(long) - 0.3}, $or: []}
            query.$or = query.$or.concat(searchMarts.map(val => val)) 
            console.log("QUERY: ", query);
            const user = await User.find(query).select('-password -email');
            console.log("USER: ", user);

            if (user) {res.status(200).json(user)}
            else {res.status(401).json({message: "Failed to get data from user database."})}
            // if martial arts are not sent, return users with lfspar = true and near the location.
        } else {
            console.log("IN SPAR 4");

            const query = {lfSpar: true, "location.lat": {$lt: 0.3 + parseFloat(lat), $gt: parseFloat(lat) - 0.3 }, "location.long": {$lt: 0.3 + parseFloat(long), $gt:parseFloat(long) -0.3}}

            const user = await User.find(query).select('-password -email');
            console.log("USER: ", user);

            if (user) {res.status(200).json(user)}
            else {res.status(401).json({message: "Failed to get data from user database."})}
        }
    }
}
)

const getCoachUsers = asyncHandler(async (req, res) => {
    console.log("IN GET COACHES");
    let { marts } = req.body
    let { lat, long } = req.body.location
    if (marts === "[]") {marts = null}
    // if location is not sent, 
    if (!lat || !long || lat === null || long === null) {
        // if martial arts are given, get users with coach = true, and has one of the martial arts.
        if (marts) {
            console.log("IN COACH 1");
            const jsonMarts = JSON.parse(marts)
            const searchMarts = jsonMarts.map((art) => {
                return {[`teaches.${art}`]: {$exists: true}}
            })

            let query = {coach: true, $or: []}
            query.$or = query.$or.concat(searchMarts.map(val => val)) 

            const user = await User.find(query).select('-password -email');

            if (user) {res.status(200).json(user)}
            else {res.status(401).json({message: "Failed to get data from user database."})}
            // if martial arts are not given, get users with coach = true.
        } else {
            console.log("IN COACH 2");
            const user = await User.find({coach: true}).select('-password -email');
            if (user) {res.status(200).json(user)}
            else {res.status(401).json({message: "Failed to get data from user database."})}
        }
        // if location is given, 
    } else {
        // if martial arts are given, get users with coach = true, near the location, and has one of the martial arts.
        if (marts) {
            console.log("IN COACH 3");
            const jsonMarts = JSON.parse(marts)
            
            const searchMarts = jsonMarts.map((art) => {
                return {[`teaches.${art}`]: {$exists: true}}
            })

            let query = {coach: true, "location.lat": {$lt: 0.3 + parseFloat(lat), $gt: parseFloat(lat) - 0.3 }, "location.long": {$lt: 0.3 + parseFloat(long), $gt:parseFloat(long) -0.3}, $or: []}
            console.log("QUERY1: ", query );
            query.$or = query.$or.concat(searchMarts.map(val => val)) 
            console.log("QUERY2: ", query);
                // searchMarts.map((val) => query = {...query, ...val})
            const user = await User.find(query).select('-password -email');
                
            console.log("USER: ", user);
            if (user) {res.status(200).json(user)}
            else {res.status(401).json({message: "Failed to get data from user database."})}
            // if martial arts is not given, get users with coach = true, and near the location.
        } else {
            console.log("IN COACH 4");

            const query = {coach: true, "location.lat": {$lt: 0.3 + parseFloat(lat), $gt: parseFloat(lat) - 0.3 }, "location.long": {$lt: 0.3 + parseFloat(long), $gt:parseFloat(long) -0.3}}
            const user = await User.find(query).select('-password -email');
            console.log("USER ", user);
            if (user) {res.status(200).json(user)}
            else {res.status(401).json({message: "Failed to get data from user database."})}
        }
    }
}
)

const getUserInfo = asyncHandler(async (req, res) => {
    console.log("GETTING USER INFO...");
    let token = req.headers.authorization.split(" ")[1]
    if (!token) {res.status(401).json({message: "No token received"})} 
    else { 
        const decoded = jwt.verify(token, process.env.JWT_TOKEN)
        const userInfo = await User.findById(decoded.id).select("-password")
        if (userInfo) {
            res.status(200).json(userInfo)
        } else {
            res.status(400).json({message: "Failed to get User Info from database."})
        }
    }

})

const updateUserInfo = asyncHandler(async (req, res) => {
    let token = req.headers.authorization.split(" ")[1]
    console.log(token);
    const decoded = jwt.verify(token, process.env.JWT_TOKEN);
    toUpdate = {...req.body.newUserInfo}
    const response = await User.findByIdAndUpdate({_id: `${decoded.id}`}, {$set: toUpdate}).select("-password")

    if (response) {res.status(200).json(response)} 
    else {res.status(400).json({message: "Failed to Update Database"})}

})

const editUsersMessageChunk = asyncHandler(async (userIds, newChunk) => {
    try {
      const user1 = await User.findByIdAndUpdate(userIds[0], { [`messages.${userIds[1]}.highestChunk`]: newChunk });
      const user2 = await User.findByIdAndUpdate(userIds[1], { [`messages.${userIds[0]}.highestChunk`]: newChunk });
  
      console.log(user1, user2);
    } catch (err) {
      console.error(err);
    }
  });

const editUserConvoSeen = asyncHandler(async (userIds, isSeen) => {
    const {senderId, receiverId} = userIds
    console.log(`CHANGING ......  messages.${senderId}.seen`);
    try {
        const user = await User.findByIdAndUpdate(receiverId, {[`messages.${senderId}.seen`]: isSeen})
    } catch(err) {
        console.log(err);
    }
})

const addUserMessage = asyncHandler(async (userIds, userNames, conversationId, chunkNumber) => {
    console.log("USERIDS: ", userIds);
    console.log("USER NAMES: ", userNames);
    try {
        console.log("FINDING USER ONE  WITH ID: ",userIds[0] );
        let userOne = await User.findByIdAndUpdate(userIds[0], 
            {   
                [`messages.${userIds[1]}.name`]: userNames[1],  
                [`messages.${userIds[1]}.conversationId`]: conversationId ,
                [`messages.${userIds[1]}.highestChunk`]: chunkNumber,
                [`messages.${userIds[1]}.seen`]: true
            }, {new: true}
        );
        console.log("FINDING USER TWO  WITH ID: ",userIds[1] );
        let userTwo = await User.findByIdAndUpdate(userIds[1], 
            { 
                [`messages.${userIds[0]}.name`]: userNames[0],
                [`messages.${userIds[0]}.conversationId`]: conversationId  ,
                [`messages.${userIds[0]}.highestChunk`]: chunkNumber  ,
                [`messages.${userIds[0]}.seen`]: true  
            }, {new: true}
        );

        console.log("USER TWO RES: ", userTwo);
        if (!userOne) {
            console.log("FINDING GYM USER ONE WITH ID: ", userIds[0]);
            userOne = await Gym.findByIdAndUpdate(userIds[0], 
                {   
                    [`messages.${userIds[1]}.name`]: userNames[1],  
                    [`messages.${userIds[1]}.conversationId`]: conversationId ,
                    [`messages.${userIds[1]}.highestChunk`]: chunkNumber,
                    [`messages.${userIds[1]}.seen`]: true
                }, {new: true}
            );

        }

        if (!userTwo) {
            console.log("FINDING GYM USER TWO WITH ID: ", userIds[1]);
            userTwo = await Gym.findByIdAndUpdate(userIds[1], 
                { 
                    [`messages.${userIds[0]}.name`]: userNames[0],
                    [`messages.${userIds[0]}.conversationId`]: conversationId  ,
                    [`messages.${userIds[0]}.highestChunk`]: chunkNumber  ,
                    [`messages.${userIds[0]}.seen`]: true  
                }, {new: true}
            );
        }

        console.log("USERONE: ", userOne);
        console.log("USERTWO: ", userTwo);

        return {userOneMessages: userOne.messages, userTwoMessages: userTwo.messages}
    } catch (err) {
        console.error(err);
        throw(err)
      }
})



module.exports = {
    registerUser, loginUser, getSparringUsers, getCoachUsers, getUserInfo, 
    updateUserInfo, editUsersMessageChunk, addUserMessage, editUserConvoSeen
}
