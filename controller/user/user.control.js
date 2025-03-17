const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../../models/user.model");
const nodemailer = require("nodemailer");
const { status } = require("http-status");
const validator = require("validator");
const randomstring = require("randomstring");

const sendWelcomeEmail = async (userEmail) => {
    try {
        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.EMAIL,
                pass: process.env.PASSWORD
            }
        });

        const mailOptions = {
            from: process.env.EMAIL,
            to: userEmail,
            subject: "Welcome to ShikshaCare!",
            html: `
                <!DOCTYPE html>
                <html lang="en">
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>Welcome to ShikshaCare</title>
                    <style>
                        body { font-family: Arial, sans-serif; background-color: #f9f9f9; color: #333; }
                        .email-container { max-width: 600px; margin: 20px auto; background: #ffffff; border: 1px solid #ddd; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1); }
                        .header { background-color: #4CAF50; color: white; text-align: center; padding: 20px; }
                        .header h1 { margin: 0; font-size: 24px; }
                        .content { padding: 20px; text-align: center; }
                        .content p { font-size: 16px; margin: 10px 0; }
                        .footer { background-color: #f1f1f1; text-align: center; padding: 10px; font-size: 14px; color: #555; }
                    </style>
                </head>
                <body>
                    <div class="email-container">
                        <div class="header">
                            <h1>Welcome to ShikshaCare!</h1>
                        </div>
                        <div class="content">
                            <p>Hi there,</p>
                            <p>Thank you for joining <strong>ShikshaCare</strong>. We are thrilled to have you on board!</p>
                            <p>Start exploring the best educational resources that we offer.</p>
                        </div>
                        <div class="footer">
                            <p>&copy; 2025 ShikshaCare. All rights reserved.</p>
                        </div>
                    </div>
                </body>
                </html>
            `
        };
        await transporter.sendMail(mailOptions);
        console.log("Email sent successfully!");
    } catch (error) {
        console.error("Error sending email:", error);
    }
};

exports.register = async (req, res) => {
    try {
        const { firstName, lastName, email, password, mobileNumber } = req.body;
        if (email) {
            const existingUser = await User.findOne({ email });
            if (existingUser) {
                return res.status(status.BAD_REQUEST).json({
                    message: "Email already exists"
                });
            }
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const date = new Date();
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1);
        const year = date.getFullYear();
        const formattedDate = `${year}-${month}-${day}`;
        const publicId = req.file?.filename || null;
        const user = new User({ firstName, lastName, email, password: hashedPassword, dateOfBirth: null, mobileNumber, gender: null, image: publicId, city: null, state: null, joiningdate: formattedDate, batch: year });
        await user.save();
        return res.status(status.OK).json({
            message: "User created successfully"
        });
    }
    catch (err) {
        return res.status(status.INTERNAL_SERVER_ERROR).json({
            message: err.message
        });
    }
};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!validator.isEmail(email)) {
            return res.status(status.BAD_REQUEST).json({
                message: "Invalid email format"
            });
        }
        const user = await User.findOne({ email });
        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!user) {
            return res.status(status.NOT_FOUND).json({
                message: "User not found"
            });
        } else if (!isValidPassword) {
            return res.status(status.UNAUTHORIZED).json({
                message: "Invalid password"
            });
        } else if (user.status === "Block") {
            return res.status(status.UNAUTHORIZED).json({
                message: "User is blocked"
            });
        } else {
            await User.findByIdAndUpdate({ _id: user._id }, { $set: { status: "Active" } }, { new: true, runValidators: true });
            const token = jwt.sign({ id: user._id }, process.env.SECRET_KEY, { expiresIn: "1h" });
            const option = {
                httpOnly: true,
                maxAge: 3600000,
                secure: process.env.NODE_ENV,
                sameSite: "strict"
            };
            res.cookie("TOKEN", token, option);
            if (user.role == "Student") {
                await sendWelcomeEmail(email);
            }
            return res.status(status.OK).json({
                message: "User logged in successfully",
                token: token,
                role: user.role
            });
        }
    }
    catch (err) {
        return res.status(status.INTERNAL_SERVER_ERROR).json({
            message: err.message
        });
    }
};

exports.resetlink = async (req, res) => {
    try {
        const email = req.body.email;
        if (!validator.isEmail(email)) {
            return res.status(status.BAD_REQUEST).json({ message: "Invalid email format" });
        }
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(status.UNAUTHORIZED).json({
                message: "Invalid email"
            });
        } else {
            const otp = randomstring.generate({
                length: 6,
                charset: 'numeric'
            });
            await User.findOneAndUpdate({ email }, { otp: otp }, { new: true, runvalidators: true });
            let transporter = nodemailer.createTransport({
                service: "gmail",
                auth: {
                    user: process.env.EMAIL,
                    pass: process.env.PASSWORD
                },
            });

            let mailOptions = {
                from: process.env.EMAIL,
                to: email,
                subject: "🔒 Reset Your Password - Quick & Easy!",
                html: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Reset Your Password</title>
    <style>
        body { font-family: Arial, sans-serif; background-color: #f9f9f9; color: #333; margin: 0; padding: 0; }
        .email-container { max-width: 600px; margin: 20px auto; background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1); }
        .header { background-color: #4CAF50; color: white; text-align: center; padding: 20px; font-size: 20px; font-weight: bold; }
        .content { padding: 20px; text-align: left; }
        .content p { font-size: 16px; margin: 10px 0; }
        .otp-box { font-size: 22px; font-weight: bold; color: #4CAF50; background: #f1f1f1; padding: 12px; text-align: center; border-radius: 5px; margin: 15px 0; }
        .footer { background-color: #f1f1f1; text-align: center; padding: 10px; font-size: 14px; color: #555; }
    </style>
</head>
<body>
    <div class="email-container">
        <div class="header">
            Reset Your Password
        </div>
        <div class="content">
            <p>Hello,</p>
            <p>We received a request to reset your password. Use the OTP code below to proceed.</p>
            <div class="otp-box">${otp}</div>
            <p>If you didn't request a password reset, please ignore this email or contact us if you have any concerns.</p>
        </div>
        <div class="footer">
            <p>&copy; 2025 ShikshaCare. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
`,
            };
            await transporter.sendMail(mailOptions);
            return res.status(status.OK).json({
                message: "Email sent successfully",
                otp: otp
            });
        }
    }
    catch (err) {
        return res.status(status.INTERNAL_SERVER_ERROR).json({
            message: err.message
        });
    }
};

exports.newpass = async (req, res) => {
    try {
        const { email, newpassword, confirmpassword, otp } = req.body;
        const users = await User.findOne({ email });
        if (!users) {
            return res.status(status.NOT_FOUND).json({
                message: "User not found"
            });
        } else {
            if (users.otp != otp) {
                return res.status(status.UNAUTHORIZED).json({
                    message: "Invalid OTP"
                });
            } else {
                if (await bcrypt.compare(newpassword, users.password)) {
                    console.log(newpassword, users.password);
                    return res.status(status.BAD_REQUEST).json({
                        message: "Password already exists"
                    });
                }
                if (newpassword !== confirmpassword) {
                    return res.status(status.UNAUTHORIZED).json({
                        message: "Passwords do not match"
                    });
                } else {
                    const hashedPassword = await bcrypt.hash(newpassword, 10);
                    users.password = hashedPassword;
                    await users.save();
                    return res.status(status.OK).json({
                        message: "Password changed successfully"
                    });
                }
            }
        }
    }
    catch (err) {
        console.log(err);
        return res.status(status.INTERNAL_SERVER_ERROR).json({
            message: err.message
        });
    }
};
