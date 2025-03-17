const bcrypt = require("bcryptjs");
const User = require("../../models/user.model");
const Instructor = require("../../models/instructor.model");
const { status } = require("http-status");
const { getFileUrl } = require("../../utils/CloudinaryConfig");
const validator = require("validator");

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!validator.isEmail(email)) {
            return res.status(status.BAD_REQUEST).json({
                message: "Invalid email format"
            });
        }
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(status.NOT_FOUND).json({
                message: "User not found"
            });
        }
        if (user.role !== "Admin") {
            return res.status(status.UNAUTHORIZED).json({
                message: "Unauthorized access"
            });
        }
        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
            return res.status(status.UNAUTHORIZED).json({
                message: "Invalid password"
            });
        }
        const token = jwt.sign({ id: user._id }, process.env.SECRET_KEY, { expiresIn: "1h" });
        const option = {
            httpOnly: true,
            maxAge: 3600000,
            secure: process.env.NODE_ENV,
            sameSite: "strict"
        };
        res.cookie("TOKEN", token, option);
        return res.status(status.OK).json({
            message: "User logged in successfully",
            token: token
        });
    }
    catch (err) {
        return res.status(status.INTERNAL_SERVER_ERROR).json({
            message: err.message
        });
    }
};

exports.singleUser = async (req, res) => {
    try {
        const id = req.user._id;
        const user = await User.findById(id);
        if (!user) {
            return res.status(status.NOT_FOUND).json({
                message: "User not found"
            });
        }
        user.image = getFileUrl(user.image);
        const students = await User.countDocuments({ role: "Student" });
        const Employee = await Instructor.countDocuments({ employMentStatus: "Employed" });
        const totalUser = students + Employee;
        return res.status(status.OK).json({
            message: "User profile retrieved successfully",
            user: user,
            totalUser: totalUser
        });
    }
    catch (err) {
        return res.status(status.INTERNAL_SERVER_ERROR).json({
            message: err.message
        });
    }
};

exports.updateUser = async (req, res) => {
    try {
        const id = req.user._id;
        const user = await User.findById(id);
        if (!user) {
            return res.status(status.NOT_FOUND).json({
                message: "User not found"
            });
        }
        const updatedData = JSON.parse(req.body.data);
        if (req.file) {
            updatedData.image = req.file.filename;
        }
        await User.findByIdAndUpdate(user._id, updatedData, { new: true, runValidators: true });
        return res.status(status.OK).json({
            message: "User updated successfully"
        })
    }
    catch (err) {
        return res.status(status.INTERNAL_SERVER_ERROR).json({
            message: err.message
        })
    }
}

exports.changepass = async (req, res) => {
    try {
        const { oldpass, newpass, confirmpass } = req.body;
        const id = req.user._id;
        const user = await User.findById(id);
        if (!user) {
            return res.status(status.NOT_FOUND).json({
                message: "User not found"
            });
        }
        const isValidPassword = await bcrypt.compare(oldpass, user.password);
        if (!isValidPassword) {
            return res.status(status.UNAUTHORIZED).json({
                message: "Old password is incorrect"
            })
        }
        if (newpass !== confirmpass) {
            return res.status(status.BAD_REQUEST).json({
                message: "Password and confirm password do not match"
            });
        }
        const hashedPassword = await bcrypt.hash(newpass, 10);
        user.password = hashedPassword;
        await user.save();
        return res.status(status.OK).json({
            message: "Password updated successfully"
        });
    }
    catch (err) {
        return res.status(status.INTERNAL_SERVER_ERROR).json({
            message: err.message
        });
    }
};

exports.logout = async (req, res) => {
    try {
        res.clearCookie("TOKEN", {
            httpOnly: true,
            secure: true,
            sameSite: "strict"
        });
        return res.status(status.OK).json({
            message: "Logged out successfully"
        });
    }
    catch (err) {
        return res.status(status.INTERNAL_SERVER_ERROR).json({
            message: err.message
        });
    }
};