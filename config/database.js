const mongoose = require("mongoose")
require('dotenv').config()
mongoose.set("strictQuery", true)


const connectDB = async () => {
    try {
        console.log("URI: ", process.env.MONGO_URI);
        console.log("PORT: ", process.env.PORT);
        const connect = await mongoose.connect(process.env.MONGO_URI)
        console.log(`Mongo Connected: ${connect.connection.host.cyan.underline}`)
    } catch (error) {
        console.log(error);
        process.exit(1)
    }
}

module.exports = connectDB
