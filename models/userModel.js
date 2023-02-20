const mongoose = require("mongoose")

mongoose.set('strictQuery', false);

const userSchema = mongoose.Schema({
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
    bio: {type: String, required: false, default: ""},
    location: {type: Object, required: false, default: {lat: 0, long: 0}}, // Users location
    lfSpar: {type: Boolean, required: false, default: false}, // if User is looking for a sparring partner
    lfSparArts: {type: Object, required: false, default: {}}, // User's martial arts
    coach: {type: Boolean, required: true, default: false}, // if User is a coach
    teaches: {type: Object, required: false, default: {}}, // what the user teaches.
    lfCoach: {type: Boolean, required: false, default: false}, // if user is looking for a coach.
    lfCoachArts: {type: Object, required: false, default: {}}, // Arts the user is searching for in a coach
    lfight: {type: Boolean, required: false, default: false}, // If user is looking for a fight.

    marts: {type: Object, required: false, default: false, default: {
        "Kickboxing": true,
        "Muay Thai": true,
    }}, 
    awards: {type: [], required: false, default: []},
    messages: {type: Object, required: false, default: {}}

}, {timestamps: true, minimize: false})

module.exports = mongoose.model("User", userSchema)