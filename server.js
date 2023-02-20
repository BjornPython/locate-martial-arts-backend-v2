const express = require("express")
const { errorHandler } = require("./middlewares/errorMiddleware")

const connectDB = require("./config/database")
const PORT = process.env.PORT || 8000

const cors = require("cors")
const {makeSocket} = require("./controllers/socketControllers")

connectDB()
const app = express()
app.use(cors())

app.use(express.json())
app.use(express.urlencoded({extended: false}))

app.use("/api", require("./routes/Routes"))


app.use(errorHandler)


const server = app.listen(PORT, () => {
    console.log(`Server is running on PORT: ${PORT}`);
});

makeSocket(server)