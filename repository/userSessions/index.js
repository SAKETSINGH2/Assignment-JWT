const dbClient = require("./dbClient");

// const ObjectId =  mongoose.Types.ObjectId;
const ObjectId = require("mongoose").Types.ObjectId;

class userSessionRepository {
    createUserSessionInfo = async (userInfo, userId) => {
        const result = await dbClient.create({
            userId: userId,
            city: userInfo.city || "unkown",
            country: userInfo.countryName || "unknown",
            deviceInfo: userInfo.deviceInfo,
        });

        return result._id ?? null;
    };

    fetchAllSessionInfo = async (userId) => {
        const result = await dbClient.find({
            userId: new ObjectId(userId),
            isActive: true,
        });
        return result ?? null;
    };

    updateSessionStatus = async (userId, sessionId) => {
        const result = await dbClient.findOneAndUpdate(
            {
                _id: new ObjectId(sessionId),
                userId: new ObjectId(userId),
            },
            {
                isActive: false,
            }
        );
        return result ?? null;
    };
}

module.exports = userSessionRepository;
