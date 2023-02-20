const mongoose = require("mongoose")

mongoose.set('strictQuery', false);


const messageSchema = mongoose.Schema({
    conversationId: {
        type: String,
        required: [true, "Please include converSationId."]
    },
    participants: {type: [], required: true, default: []},

    messages: {type: [], required: false, default: []},
    chunkNumber: {type: Number, required: true, default: 0}
}

, {timestamps: true})

module.exports = mongoose.model("Message", messageSchema)
