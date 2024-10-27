const dbClient = require("./dbClient")


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

}

module.exports = userRepository