const express = require("express")
const router = express.Router()

const { registerUser, loginUser, getSparringUsers, getCoachUsers, getUserInfo, updateUserInfo } = require("../controllers/userControllers")
const {registerGym, loginGym, getGyms, getGymInfo, updateGymInfo } = require("../controllers/gymControllers")
const {createConvo, addMessage} = require("../controllers/messageControllers")

router.get("/", (req, res) => {res.status(200).json({message: "Working..."})})
router.get("/users", getUserInfo)
router.post("/users/register", registerUser)
router.post("/users/login", loginUser)
router.post("/users/sparringusers", getSparringUsers)
router.post("/users/coachusers", getCoachUsers)
router.post("/users/update", updateUserInfo)


router.post("/gym/register", registerGym)
router.post("/gym/login", loginGym)
router.post("/gym/getgyms", getGyms)
router.get("/gym", getGymInfo)
router.post("/gym/update", updateGymInfo)

router.post("/messages/createconvo", createConvo)
router.post("/messages/addmsg", addMessage)

module.exports = router