const dotenv = require("dotenv")
dotenv.config();
const jwt = require("jsonwebtoken")

const authenticatedUser = (req, res, next) => {

    try {

        const token = req.header("Authorization") && req.header("Authorization").split(" ")[1];

        if (!token) {
            return res.status(401).json({
                message: "Access denied"
            })
        }

        const decodedData = jwt.verify(token, process.env.JWT_SECRET || "");
        req.userId = decodedData.userId;
        next();

    } catch (error) {
        res.status(400).json({ message: "Invalid token" })
    }

}

module.exports = authenticatedUser;