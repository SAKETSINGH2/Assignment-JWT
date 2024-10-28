const { body } = require("express-validator");

const verifyOtpApiValidator = [
    body("otp").isInt().withMessage("otp is required"),
    body("mobileNo").isString().withMessage("mobileNo is required"),
];

module.exports = verifyOtpApiValidator