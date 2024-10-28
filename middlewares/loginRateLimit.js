const rateLimit = require("express-rate-limit")


const loginRateLimit = rateLimit({
    windowMs: 1 * 60 * 1000,
    max: 5,
    message: {
        result: false,
        message: "Too many login attempts , please try again after sometime"
    }
})

module.exports = loginRateLimit