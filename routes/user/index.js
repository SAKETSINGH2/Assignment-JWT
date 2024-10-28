const express = require("express");
const UserRepository = require("../../repository/user/index");
const userRegistrationApiValidator = require("./validators/userRegistrationApiValidator");
const requestParamsValidator = require("../../utils/requestParamsValidator");
const bcrypt = require("bcrypt");
const dotenv = require("dotenv");
const generateToken = require("../../utils/generateToken");
const authenticatedUser = require("../../middlewares/authenticate");
const { generateOtp } = require("../../utils/twoFactorAuth");
const mailSender = require("../../utils/mailSender");
const TwoFactorAuth = require("../../repository/user/twoFactorAuth");

dotenv.config();

const router = express.Router();

const userRepository = new UserRepository();

router.post(
    "/register",
    userRegistrationApiValidator,
    requestParamsValidator,
    async(req, res, next) => {
        const { name, email, password, mobileNo } = req.body;
        let responseDetails;

        try {
            isUserAlreadyRegistered = await userRepository.isUserResgistered(
                mobileNo
            );

            if (isUserAlreadyRegistered) {
                return res
                    .status(400)
                    .json({
                        result: false,
                        message: "user already registered",
                    });
            }
            //  if user not registered then registration process...
            let hashedPassword = await bcrypt.hash(password, 10);

            responseDetails = await userRepository.registerUser({
                name,
                email,
                password: hashedPassword,
                mobileNo,
            });

            if (!responseDetails) {
                return res.send(400).json({
                    result: false,
                    message: "Issue is user registration",
                });
            }

            return res.status(200).json({
                result: true,
                message: "user registration successfull",
                name: responseDetails.name,
                email: responseDetails.email,
                mobileNo: responseDetails.mobileNo,
            });
        } catch (error) {
            return next(error);
        }
    }
);

router.post("/login", async(req, res, next) => {
    const { mobileNo, password } = req.body;

    try {
        let isUserAlreadyRegistered = await userRepository.isUserResgistered(
            mobileNo
        );
        if (!isUserAlreadyRegistered) {
            return res.status(400).json({
                result: false,
                message: "user not found",
            });
        }
        // if user extis then login process...
        let validatePassword = await bcrypt.compare(
            password,
            isUserAlreadyRegistered.password
        );

        if (!validatePassword) {
            return res
                .status(400)
                .json({
                    result: true,
                    message: "Invalid password , please enter valid password",
                });
        }

        // two factor auth
        if (isUserAlreadyRegistered.twoFactorAuth === TwoFactorAuth.INABLED) {
            let { otp, expiresIn } = generateOtp();
            console.log(otp, expiresIn)

            if (!otp) {
                return res.status(400).json({
                    result: false,
                    message: "Issue in otp generation",
                });
            }

            let body = `your one time password(otp) is ${otp}`;

            await mailSender(
                isUserAlreadyRegistered.email,
                "you have recieved otp",
                body
            );

            await userRepository.storeOtp(mobileNo, otp, expiresIn);

            res.status(200).json({
                restult: true,
                message: "otp sent successfully",
            });
        } else {
            // but in case user DISABLED 2FA then directly generate token
            let token = await generateToken(isUserAlreadyRegistered);

            return res.status(200).json({
                result: true,
                message: "user successfully login",
                name: isUserAlreadyRegistered.name,
                email: isUserAlreadyRegistered.email,
                mobileNo: isUserAlreadyRegistered.mobileNo,
                token: token,
            });
        }
    } catch (error) {
        return next(error);
    }
});

router.post("/verify_otp", async(req, res, next) => {
    const { mobileNo, otp } = req.body;
    let responseDetails;

    try {

        let isUserAlreadyRegistered = await userRepository.isUserResgistered(
            mobileNo
        );
        if (!isUserAlreadyRegistered) {
            return res.status(400).json({
                result: false,
                message: "user not found",
            });
        }

        responseDetails = await userRepository.verifyOtp(mobileNo, otp)

        if (!responseDetails) {
            return res.status(400).json({
                result: false,
                message: "Invalid otp , please enter valid valid otp",
            });
        }

        let token = await generateToken(isUserAlreadyRegistered);

        return res.status(200).json({
            result: true,
            message: "user logged in successfully",
            name: isUserAlreadyRegistered.name,
            email: isUserAlreadyRegistered.email,
            mobileNo: isUserAlreadyRegistered.mobileNo,
            token: token,
        });


    } catch (error) {
        console.log("Otp verifaication failed", error)
        return next(error);
    }
});

router.get("/profile", authenticatedUser, async(req, res, next) => {
    let responseDetails;

    try {
        responseDetails = await userRepository.getUserProfile(req.userId);

        if (!responseDetails) {
            return res.status(400).json({
                result: false,
                message: "user profile not found",
            });
        }

        return res.status(200).json({
            result: true,
            data: {
                userId: responseDetails._id,
                name: responseDetails.name,
                email: responseDetails.email,
                mobileNo: responseDetails.mobileNo,
            },
        });
    } catch (error) {
        return next(error);
    }
});

router.post("/remove_two_factor_auth", authenticatedUser, async(req, res, next) => {

    let responseDetails;

    try {

        responseDetails = await userRepository.disableTwoFactorAuth(req.userId)

        if (!responseDetails) {
            return res.status(400).json({
                result: false,
                message: "Issue while disabled two factor authentication "
            })
        }

        return res.status(200).json({
            result: true,
            messsage: "two factor authentication successfully disabled"
        });
    } catch (error) {
        return next(error);
    }
});

router.post("/add_two_factor_auth", authenticatedUser, async(req, res, next) => {

    let responseDetails;

    try {

        responseDetails = await userRepository.enableTwoFactorAuth(req.userId)

        if (!responseDetails) {
            return res.status(400).json({
                result: false,
                message: "Issue while enable two factor authentication "
            })
        }

        return res.status(200).json({
            result: true,
            messsage: "two factor authentication successfully enabled"
        });
    } catch (error) {
        return next(error);
    }
});
module.exports = router;