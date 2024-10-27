const { body } = require("express-validator");

const userRegistrationApiValidator = [
    body("name").isString().withMessage("name is required"),
    body("mobileNo").isInt().withMessage("mobileNo is required"),
    body("password").isString().withMessage("password is required"),
    body("email").isString().withMessage("email is required"),
];

module.exports = userRegistrationApiValidator