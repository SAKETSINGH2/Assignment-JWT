const mongoose = require("mongoose");



const userModelSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    mobileNo: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: true,
    }
}, { timestamps: true })

const userModelSechmaDbClient = mongoose.model("user", userModelSchema);

module.exports = userModelSechmaDbClient