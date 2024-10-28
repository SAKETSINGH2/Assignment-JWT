const crypto = require("crypto")

function generateOtp() {
    var otp = Math.floor(1000 + Math.random() * 9000).toString();
    const expiresIn = Date.now() + 5 * 60 * 1000;
    return { otp, expiresIn };
}

function sendOtp() {}

function verifyOtp() {

}

module.exports = {
    generateOtp,
    sendOtp,
    verifyOtp
}