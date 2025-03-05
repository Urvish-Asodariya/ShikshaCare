const nodemailer = require("nodemailer");
const randomstring = require("randomstring");
const User = require("../../models/user.model");
const Enrollform = require("../../models/enrollForm.model");
const Course = require("../../models/course.model");
const Event = require("../../models/events.model");
const Book = require("../../models/book.model");
const { status } = require("http-status");
const accountSid = process.env.ACCOUNTSID;
const authToken = process.env.AUTHTOKEN;
const client = require('twilio')(accountSid, authToken);

const sendCourseEnrollmentEmail = async (userEmail, type, details) => {
    try {
        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.EMAIL,
                pass: process.env.PASSWORD
            }
        });

        const emailTemplates = {
            course: {
                subject: "📚 Confirm Your Course Enrollment - Verification Required!",
                message: `You have requested to enroll in <strong>${details.name}</strong>. To verify your enrollment, please use the OTP code below.`,
            },
            book: {
                subject: "📖 Book Reservation Confirmation",
                message: `You have reserved the book <strong>${details.name}</strong>. Your reservation ID is <strong>${details.id}</strong>.`,
            },
            event: {
                subject: "🎟️ Event Registration Confirmation",
                message: `You have successfully registered for the event <strong>${details.name}</strong>. Your ticket number is <strong>${details.id}</strong>.`,
            }
        };

        if (!emailTemplates[type]) {
            throw new Error("Invalid email type.");
        }

        const { subject, message } = emailTemplates[type];

        const mailOptions = {
            from: process.env.EMAIL,
            to: userEmail,
            subject,
            html: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${subject}</title>
    <style>
        body { font-family: Arial, sans-serif; background-color: #f9f9f9; color: #333; margin: 0; padding: 0; }
        .email-container { max-width: 600px; margin: 20px auto; background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1); }
        .header { background-color: #4CAF50; color: white; text-align: center; padding: 20px; font-size: 20px; font-weight: bold; }
        .content { padding: 20px; text-align: left; }
        .content p { font-size: 16px; margin: 10px 0; }
        .highlight-box { font-size: 22px; font-weight: bold; color: #4CAF50; background: #f1f1f1; padding: 12px; text-align: center; border-radius: 5px; margin: 15px 0; max-width: 150px; margin: 20px auto; }
        .footer { background-color: #f1f1f1; text-align: center; padding: 10px; font-size: 14px; color: #555; }
    </style>
</head>
<body>
    <div class="email-container">
        <div class="header">${subject}</div>
        <div class="content">
            <p>Hello,</p>
            <p>${message}</p>
            ${details.otp ? `<div class="highlight-box">${details.otp}</div>` : ""}
            <p>If you did not request this, please ignore this email or contact support.</p>
        </div>
        <div class="footer">
            <p>&copy; 2025 ShikshaCare. All rights reserved.</p>
        </div>
    </div>
</body>
</html>`
        };

        await transporter.sendMail(mailOptions);
        console.log("Email sent successfully!");
        return true;
    } catch (error) {

        console.error("Error sending email:", error);
    }
};

// exports.enrollForm = async (req, res) => {
//     try {
//         const { name, email, mobile, education, currentProfile, language } = req.body;
//         const enroll = new Enrollform({ name, email, mobile, education, currentProfile, language });
//         await enroll.save();
//         const id = req.params.id;
//         if (!id) {
//             return res.status(status.BAD_REQUEST).json({ message: "Missing item ID" });
//         }
//         const userId = req.user._id;
//         const user = await User.findById({ _id: userId });
//         if (!user) {
//             return res.status(status.NOT_FOUND).json({ message: "User not found" });
//         }
//         let item = await Course.findById(id) || await Event.findById(id) || await Book.findById(id);
//         if (!item) {
//             return res.status(status.NOT_FOUND).json({ message: "Item not found" });
//         }
//         let field, itemName;
//         if (item instanceof Course) {
//             field = "course";
//             itemName = item.courseDetails.title;
//         } else if (item instanceof Event) {
//             field = "event";
//             itemName = item.title;
//         } else if (item instanceof Book) {
//             field = "book";
//             itemName = item.title;
//         }
//         const otp = randomstring.generate({
//             length: 6,
//             charset: 'numeric'
//         });
//         await User.findOneAndUpdate(
//             { email },
//             { otp: otp },
//             { new: true, runValidators: true }
//         );
//         await user.save();
//         const response = await sendCourseEnrollmentEmail(email, field, { name: itemName, otp });
//         if (!response) {
//             return res.status(status.BAD_REQUEST).json({
//                 message: "Email not sent"
//             });
//         }
//         return res.status(status.OK).json({
//             message: "Enroll form submitted successfully",
//             otp: otp
//         });
//     } catch (err) {
//         return res.status(status.INTERNAL_SERVER_ERROR).json({
//             message: err.message
//         });
//     }
// };

exports.enrollForm = async (req, res) => {
    try {
        const { name, email, mobile, education, currentProfile, language } = req.body;
        const enroll = new Enrollform({ name, email, mobile, education, currentProfile, language });
        await enroll.save();
        const verification = await client.verify.v2
            .services(process.env.SERVICES)
            .verifications.create({
                channel: "sms",
                to: `+91${req.body.mobile}`,
            });
        console.log(verification.status);
        return res.status(status.OK).json({
            message: "Enroll form submitted successfully",
        });
    } catch (err) {
        console.log(err)
        return res.status(status.INTERNAL_SERVER_ERROR).json({
            message: err.message
        });
    }
};

exports.otpCheck = async (req, res) => {
    try {
        const verificationCheck = await client.verify.v2
            .services(process.env.SERVICES)
            .verificationChecks.create({
                code: req.body.otp,
                to: `+91${req.body.mobile}`,
            });

        console.log(verificationCheck.status);
        if (verificationCheck.status === "pending") {
            return res.status(status.UNAUTHORIZED).json({
                message: "Invalid OTP or mobile number",
            });
        }
        return res.status(status.OK).json({
            message: "OTP verified successfully",
        });
    } catch (err) {
        console.log(err);
        return res.status(status.INTERNAL_SERVER_ERROR).json({
            message: err.message
        });
    }
};

