const asyncHandler = require("express-async-handler")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const Gym = require("../models/gymModel")


// GETGYMINFO  // GETGYMINFO  // GETGYMINFO  // GETGYMINFO  // GETGYMINFO  // GETGYMINFO  


const getGymInfo = asyncHandler(async (req, res) => {
    let token = req.headers.authorization.split(" ")[1]
    if (!token) {res.status(401).json({message: "No token received"})} 
    else {
        const decoded = jwt.verify(token, process.env.JWT_TOKEN)
        const gymInfo = await Gym.findOne({_id: `${decoded.id}`})
        if (gymInfo) {
            res.status(200).json(gymInfo)
        } else {
            res.status(400).json({message: "Failed to get Gym Info from database."})
        }
    }
    
})

// REGISTER GYM // REGISTER GYM // REGISTER GYM // REGISTER GYM // REGISTER GYM 

const registerGym = asyncHandler(async (req, res) => {
    console.log("IN REGISTER GYM");
    console.log(req.body);
    const {
        name,
        email,
        password
    } = req.body


    if (!name || !email || !password ) {
        res.status(400).json({message: "Please include all fields."})
    }

    const salt = await bcrypt.genSalt(10)
    const hashedPass = await bcrypt.hash(password, salt)


    
    const gym = await Gym.create({
        name, email, password: hashedPass
    })

    if (gym) {
        const token = generateToken(gym.id)
        res.status(200).json(token)

    } else {
        res.status(400).json({error: "Failed to create Gym user."})

    }

})


// LOGIN GYM // LOGIN GYM // LOGIN GYM // LOGIN GYM // LOGIN GYM // LOGIN GYM 

const loginGym = asyncHandler(async (req, res) => {

    const {email, password} = req.body

    const gym = await Gym.findOne({email})

    if (!gym) {
        res.status(400).json({message: "Wrong Email or Password."})
    }
    console.log(await bcrypt.compare(password, gym.password));
    if ( ! await bcrypt.compare(password, gym.password)) {
        res.status(400).json({message: "Wrong password"})
    }
    
    const token = generateToken(user.id)
    res.status(200).json(token) 
})


const getGyms = asyncHandler(async (req, res) => {
    console.log("IN GET GYMS");
    console.log("REQ.BODY: ", req.body);
    let { marts } = req.body
    let { lat, long } = req.body.location
    if (marts === "[]" || marts === [] || marts.length < 1) {marts = null}
    console.log("MARTS: ", marts);
    console.log("MARTS TYPE: ", typeof(marts));
    // If location is not sent, 
    if (!lat || !long || lat === null || long === null) {
        // if martial arts are given, get gyms that has one of the martial arts.
        if (marts) {
            console.log("HERE1");
            const jsonMarts = JSON.parse(marts)
            const searchMarts = jsonMarts.map((art) => {
                return {[`marts.${art}`]: {$exists: true}}
            })

            let query = {$or: []}
            query.$or = query.$or.concat(searchMarts.map(val => val)) 
            const gyms = await Gym.find({$or: searchMarts}).select('-password -email');
            if (gyms) {res.status(200).json(gyms)}
            else {res.status(401).json({message: "Failed to get data from gym database."})}
            // if martial arts are not given, get all gyms.
        } else {
            console.log("HERE2");
            const gyms = await Gym.find().select('-password -email');
            if (gyms) {res.status(200).json(gyms)}
            else {res.status(401).json({message: "Failed to get data from gym database."})}
        }
    // if location is sent, 
    } else {
        // if martial arts are given, get gyms near the location, and has one of the martial arts.
        if (marts) {
            console.log("HERE3");
            const jsonMarts = JSON.parse(marts)
            const searchMarts = jsonMarts.map((art) => {
                return {[`marts.${art}`]: {$exists: true}}
            })
            const gyms = await Gym.find(
                {$and: 
                    [
                    {"location.lat": {$lt: 0.3 + parseFloat(lat), $gt: parseFloat(lat) - 0.3 }}, 
                    {"location.long": {$lt: 0.3 + parseFloat(long), $gt:parseFloat(long) -0.3}}, 
                    {$or: searchMarts}
                    ]
                }
            ).select('-password -email');
            if (gyms) {res.status(200).json(gyms)}
            else {res.status(401).json({message: "Failed to get data from gym database."})}
            // if martial arts are not given, get gyms that are near the location.
        } else {
            console.log("HERE4");

            const gyms = await Gym.find(
                {$and: 
                    [
                        {"location.lat": {$lt: 0.3 + parseFloat(lat), $gt: parseFloat(lat) - 0.3 }}, 
                        {"location.long": {$lt: 0.3 + parseFloat(long), $gt:parseFloat(long) -0.3}}
                    ]
            }).select('-password -email');
            if (gyms) {res.status(200).json(gyms)}
            else {res.status(401).json({message: "Failed to get data from gym database."})}
        }
    }
})

const updateGymInfo = asyncHandler(async (req, res) => {
    let token = req.headers.authorization.split(" ")[1]
    console.log(token);
    const decoded = jwt.verify(token, process.env.JWT_TOKEN);
    toUpdate = {...req.body.profileGymInfo}
    console.log("TO UPDATE: ", toUpdate);
    const response = await Gym.findByIdAndUpdate({_id: `${decoded.id}`}, {$set: toUpdate}, {new: true}).select("-password")

    if (response) {res.status(200).json(response)} 
    else {res.status(400).json({message: "Failed to Update Database"})}
})


const generateToken = (id) => {
    return jwt.sign({id}, process.env.JWT_TOKEN, {expiresIn: "7d"})
}


module.exports = {registerGym, loginGym, getGyms, getGymInfo, updateGymInfo}
