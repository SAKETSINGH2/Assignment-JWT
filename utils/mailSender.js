const nodeMailer = require("nodemailer")
const dotenv = require("dotenv")
dotenv.config()


const mailSender = async(email, title, body) => {
    try {
        const transporter = nodeMailer.createTransport({
            host: process.env.MAIL_HOST,
            auth: {
                user: process.env.MAIL_USER,
                pass: process.env.MAIL_PASS
            }
        })

        let mailInfo = transporter.sendMail({
            from: "send mailer",
            to: `${email}`,
            subject: `${title}`,
            html: `${body}`
        })

        return mailInfo
    } catch (error) {
        throw new Error(error)
    }
}

module.exports = mailSender;