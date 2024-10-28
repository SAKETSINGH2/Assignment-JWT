const express = require("express")
const apiRouter = require("./routes/index")
const connectDb = require("./config/databaseConnection")
const morgan = require("morgan")
const cors = require("cors")

const app = express();

const PORT = process.env.PORT || 3000;

connectDb();

app.use(express.json())
app.use(cors())

// use this lib. for tracking all request
app.use(morgan("dev"))

app.use("/backend/api", apiRouter)


app.listen(PORT, (error) => {
    if (error) {
        console.log(`Error while listing the app with error-`,
            error.message)
    }
    console.log(`App is running at ${PORT}`)
})

module.exports = app;