const mongoose = require("mongoose")

mongoose.set('strictQuery', false);


const gymSchema = mongoose.Schema({
    name: {
        type: String,
        required: [true, "Please include a name."]
    },
    email: {
        type: String,
        required: [true, "Please include an email."]
    },
    password: {
        type: String,
        required: [true, "Please include a password."]
    },
    bio: {
        type: String,
        required: false,
        default: ""
    },
    awards: {
        type: [],
        required: false,
        default: []
    },  
    messages: {type: Object, required: false, default: {}},
    location: {type: Object, required: false, default: {lat: 0, long: 0}},
    marts: {type: Object, required: false, default: {"Muay Thai": true}}}

, {timestamps: true})

module.exports = mongoose.model("Gym", gymSchema)
