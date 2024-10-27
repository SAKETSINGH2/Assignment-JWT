const express = require("express");
const UserRepository = require("../../repository/user/index");
const userRegistrationApiValidator = require("./validators/userRegistrationApiValidator");
const requestParamsValidator = require("../../utils/requestParamsValidator");
const bcrypt = require("bcrypt")
const dotenv = require("dotenv");
const generateToken = require("../../utils/generateToken");
const authenticatedUser = require("../../middlewares/authenticate")

dotenv.config();

const router = express.Router();

const userRepository = new(UserRepository)


router.post("/register", userRegistrationApiValidator, requestParamsValidator, async(req, res, next) => {

    const { name, email, password, mobileNo } = req.body;
    let responseDetails;

    try {

        isUserAlreadyRegistered = await userRepository.isUserResgistered(mobileNo)

        if (isUserAlreadyRegistered) {
            return res.status(400).json({ result: false, message: "user already registered" })
        }
        //  if user not registered then registration process...
        let hashedPassword = await bcrypt.hash(password, 10)

        responseDetails = await userRepository.registerUser({ name, email, password: hashedPassword, mobileNo })

        if (!responseDetails) {
            return res.send(400).json({
                result: false,
                message: "Issue is user registration"
            })
        }

        return res.status(200).json({
            result: true,
            message: "user registration successfull",
            name: responseDetails.name,
            email: responseDetails.email,
            mobileNo: responseDetails.mobileNo,
        })
    } catch (error) {
        return next(error)
    }
})

router.post("/login", async(req, res, next) => {

    const { mobileNo, password } = req.body;

    try {

        let isUserAlreadyRegistered = await userRepository.isUserResgistered(mobileNo)
        if (!isUserAlreadyRegistered) {
            return res.status(400).json({
                result: false,
                message: "user not found"

            })
        }
        // if user extis then login process...
        let validatePassword = await bcrypt.compare(password, isUserAlreadyRegistered.password)

        if (!validatePassword) {
            return res.status(400).json({ result: true, message: "Invalid password , please enter valid password" })
        }

        // generate token
        let token = await generateToken(isUserAlreadyRegistered);

        return res.status(200).json({
            result: true,
            message: "user successfully login",
            name: isUserAlreadyRegistered.name,
            email: isUserAlreadyRegistered.email,
            mobileNo: isUserAlreadyRegistered.mobileNo,
            token: token
        })
    } catch (error) {
        return next(error)
    }
})

router.get("/profile", authenticatedUser, async(req, res, next) => {

    let responseDetails;

    try {

        responseDetails = await userRepository.getUserProfile(req.userId)

        if (!responseDetails) {
            return res.status(400).json({
                result: false,
                message: "user profile not found"
            })
        }

        return res.status(200).json({
            result: true,
            data: {
                userId: responseDetails._id,
                name: responseDetails.name,
                email: responseDetails.email,
                mobileNo: responseDetails.mobileNo
            }
        })

    } catch (error) {
        return next(error)
    }

})
module.exports = router;