const { validationResult } = require("express-validator")

module.exports = function(req) {

    const result = validationResult(req)

    if (result.isEmpty()) {
        return null;
    }

    const errorMessage =
        result.formatWith((error) => error.msg.toString())
        .array();

    return errorMessage.join(" || ")

}