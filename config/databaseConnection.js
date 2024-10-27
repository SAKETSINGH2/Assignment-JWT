const mongoose = require("mongoose")
const dotenv = require("dotenv")


dotenv.config();

const connectDb = () => {

    mongoose.connect(process.env.MONGODB_BASE_URL || "")
        .then(() => {
            console.log("DataBase Connection Successfull")
        })
        .catch((error) => {
            console.log("Issue in DataBase Connection",
                error)
            process.exit(1);
        })

}

module.exports = connectDb;