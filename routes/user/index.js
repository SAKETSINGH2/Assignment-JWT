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
const loginApiValidator = require("./validators/loginApiValidator");
const verifyOtpApiValidator = require("./validators/verifyOtpApiValidator");
const loginRateLimit = require("../../middlewares/loginRateLimit");
const UserSessionRepository = require("../../repository/userSessions/index");
const userAgent = require("express-useragent");

dotenv.config();

const router = express.Router();

const userRepository = new UserRepository();
const userSessionRepository = new UserSessionRepository();

router.post(
    "/register",
    userRegistrationApiValidator,
    requestParamsValidator,
    async (req, res, next) => {
        const { name, email, password, mobileNo } = req.body;
        let responseDetails;

        try {
            isUserAlreadyRegistered = await userRepository.isUserResgistered(
                mobileNo
            );

            if (isUserAlreadyRegistered) {
                return res.status(400).json({
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

router.post(
    "/login",
    loginApiValidator,
    requestParamsValidator,
    loginRateLimit,
    async (req, res, next) => {
        const { mobileNo, password } = req.body;

        try {
            let isUserAlreadyRegistered =
                await userRepository.isUserResgistered(mobileNo);
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
                return res.status(400).json({
                    result: true,
                    message: "Invalid password , please enter valid password",
                });
            }

            // two factor auth
            if (
                isUserAlreadyRegistered.twoFactorAuth === TwoFactorAuth.INABLED
            ) {
                let { otp, expiresIn } = generateOtp();

                if (!otp) {
                    return res.status(400).json({
                        result: false,
                        message: "Issue in otp generation",
                    });
                }

                let body = `your one time password(otp) is ${otp}`;

                await Promise.all([
                    mailSender(
                        isUserAlreadyRegistered.email,
                        "you have recieved otp",
                        body
                    ),
                    userRepository.storeOtp(mobileNo, otp, expiresIn),
                ]);

                res.status(200).json({
                    result: true,
                    message: "otp sent successfully",
                });
            } else {
                // but in case user DISABLED 2FA then directly generate token
                let token = await generateToken(isUserAlreadyRegistered);

                const ipAddress = (req.headers["x-forwarded-for"] || "").split(
                    ","
                )[0];

                let deviceInfo = {
                    browser: req.useragent.browser,
                    version: req.useragent.version,
                    os: req.useragent.os,
                };

                const url =
                    "https://apiip.net/api/check?ip=" +
                    ipAddress +
                    "&accessKey=" +
                    process.env.API_IP_ACSESS_KEY;

                const response = await fetch(url);
                const data = await response.json();
                const { city, countryName } = data;

                await userSessionRepository.createUserSessionInfo(
                    { city, countryName, deviceInfo },
                    isUserAlreadyRegistered._id
                );

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
    }
);

router.post(
    "/verify_otp",
    verifyOtpApiValidator,
    requestParamsValidator,
    async (req, res, next) => {
        const { mobileNo, otp } = req.body;
        let responseDetails;

        try {
            let isUserAlreadyRegistered =
                await userRepository.isUserResgistered(mobileNo);
            if (!isUserAlreadyRegistered) {
                return res.status(400).json({
                    result: false,
                    message: "user not found",
                });
            }

            responseDetails = await userRepository.verifyOtp(mobileNo, otp);

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
            return next(error);
        }
    }
);

router.get("/profile", authenticatedUser, async (req, res, next) => {
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
                twoFactorAuth: responseDetails.twoFactorAuth,
            },
        });
    } catch (error) {
        return next(error);
    }
});

router.post(
    "/remove_two_factor_auth",
    authenticatedUser,
    async (req, res, next) => {
        let responseDetails;

        try {
            responseDetails = await userRepository.disableTwoFactorAuth(
                req.userId
            );

            if (!responseDetails) {
                return res.status(400).json({
                    result: false,
                    message: "Issue while disabled two factor authentication ",
                });
            }

            return res.status(200).json({
                result: true,
                message: "two factor authentication successfully disabled",
            });
        } catch (error) {
            return next(error);
        }
    }
);

router.post(
    "/add_two_factor_auth",
    authenticatedUser,
    async (req, res, next) => {
        let responseDetails;

        try {
            responseDetails = await userRepository.enableTwoFactorAuth(
                req.userId
            );

            if (!responseDetails) {
                return res.status(400).json({
                    result: false,
                    message: "Issue while enable two factor authentication ",
                });
            }

            return res.status(200).json({
                result: true,
                message: "two factor authentication successfully enabled",
            });
        } catch (error) {
            return next(error);
        }
    }
);

router.get("/all_active_session", authenticatedUser, async (req, res, next) => {
    let responseDetails;

    try {
        responseDetails = await userSessionRepository.fetchAllSessionInfo(
            req.userId
        );

        const response = await responseDetails.map((data) => ({
            sessionId: data._id,
            userId: data.userId,
            country: data.country,
            city: data.city,
            deviceInfo: {
                browser: data.deviceInfo?.browser,
                version: data.deviceInfo?.version,
                os: data.deviceInfo?.os,
            },
            loginTime: data.createdAt,
        }));

        if (responseDetails.length === 0) {
            return res.status(400).json({
                result: false,
                message: "No active session found",
            });
        }

        return res.status(200).json({
            result: true,
            messsage: "fetched successfully",
            data: response,
        });
    } catch (error) {
        return next(error);
    }
});

router.post("/logout/:sessionId", authenticatedUser, async (req, res, next) => {
    let responseDetails;

    try {
        responseDetails = await userSessionRepository.updateSessionStatus(
            req.userId,
            req.params.sessionId
        );
    } catch (error) {
        return next(error);
    }
    if (!responseDetails) {
        return res
            .status(400)
            .json({ result: false, message: "issue in logout process " });
    }
    return res
        .status(200)
        .json({ result: true, message: "successfully logout" });
});

router.post("/logout", authenticatedUser, async (req, res) => {
    let responseDetails;

    try {
        return res.status(200).json({
            result: true,
            message: "User successfully logged out.",
        });
    } catch (error) {
        return res.status(500).json({
            result: false,
            message: "Issue in logout process",
        });
    }
});

module.exports = router;
