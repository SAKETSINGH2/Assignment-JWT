const mongoose = require("mongoose");

const deviceInfoModelSchema = new mongoose.Schema({
    browser: String,
    version: String,
    os: String,
});

const userSessionModelSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Types.ObjectId,
            required: true,
        },
        city: {
            type: String,
            required: true,
        },
        country: {
            type: String,
            required: true,
        },
        deviceInfo: {
            type: deviceInfoModelSchema,
        },
        isActive: {
            type: Boolean,
            default: true,
        },
    },
    {
        timestamps: true,
    }
);

const userSessionModelDbClient = mongoose.model(
    "userSession",
    userSessionModelSchema
);

module.exports = userSessionModelDbClient;
