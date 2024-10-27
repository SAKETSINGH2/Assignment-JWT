const validationResultConstructor = require("./resultValidatorConstructor")

const requestParamsValidator = (
    req, res, next
) => {

    let reqValidationResult = validationResultConstructor(req)

    if (reqValidationResult) {
        return res.status(400).json({
            success: true,
            data: reqValidationResult
        })
    }
    return next()

}
module.exports = requestParamsValidator;