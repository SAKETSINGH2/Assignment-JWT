const dbClient = require("./dbClient");
const TwoFactorAuth = require("./twoFactorAuth");


class userRepository {

    registerUser = async(userDetails) => {

        const result = await dbClient.create({
            name: userDetails.name,
            email: userDetails.email,
            mobileNo: userDetails.mobileNo,
            password: userDetails.password,
        })

        return result;

    }

    isUserResgistered = async(mobileNo) => {
        const result = await dbClient.findOne({
            mobileNo: mobileNo
        })
        if (!result) {
            return false
        }
        return result;
    }

    getUserProfile = async(userId) => {
        const result = await dbClient.findById(userId)
        if (!result) {
            return false
        }
        return result;
    }

    storeOtp = async(mobileNo, otp, expiresIn) => {
        const result = await dbClient.findOneAndUpdate({
            mobileNo: mobileNo,
        }, { $set: { "otpDetails.otp": otp, "otpDetails.expiresIn": expiresIn } })

        if (!result) {
            return false
        }
        return result;
    }

    verifyOtp = async(mobileNo, otp) => {
        const result = await dbClient.findOne({
            mobileNo: mobileNo,
            "otpDetails.otp": otp
        })

        if (!result) {
            return false
        }
        return result;
    }

    enableTwoFactorAuth = async(userId) => {
        const result = await dbClient.findByIdAndUpdate(
            userId, { $set: { twoFactorAuth: TwoFactorAuth.INABLED } })

        if (!result) {
            return false
        }
        return true;
    }

    disableTwoFactorAuth = async(userId) => {
        const result = await dbClient.findByIdAndUpdate(
            userId, { $set: { twoFactorAuth: TwoFactorAuth.DISABLED } })

        if (!result) {
            return false
        }
        return true;
    }

}

module.exports = userRepository