const { body } = require("express-validator");

const loginApiValidator = [
    body("mobileNo").isInt().withMessage("mobileNo is required"),
    body("password").isString().withMessage("password is required"),
];

module.exports = loginApiValidator