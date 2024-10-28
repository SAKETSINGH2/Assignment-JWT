const jwt = require('jsonwebtoken');
const dotenv = require("dotenv")

dotenv.config();


const generateToken = (user) => {

    try {

        const payload = {
            userId: user._id,
            name: user.name,
            email: user.email
        }
        const token = jwt.sign(payload, process.env.JWT_SECRET || "", { expiresIn: "8h" });

        return token;
    } catch (error) {
        throw new Error("Failed to generate a token")
    }
}

module.exports = generateToken;