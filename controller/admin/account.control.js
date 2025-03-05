const bcrypt = require("bcryptjs");
const User = require("../../models/user.model");
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
        return res.status(status.OK).json({
            message: "User profile retrieved successfully",
            user: user
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
        const updatedData = { ...req.body };
        if (req.file) {
            updatedData.image = req.file.filename;
        };
        const updatedUser = await User.findByIdAndUpdate(id, updatedData, { new: true, runValidators: true });
        if (!updatedUser) {
            return res.status(status.NOT_FOUND).json({
                message: "User not found"
            });
        }
        await updatedUser.save();
        return res.status(status.OK).json({
            message: "User updated",
            user: updatedUser
        });
    }
    catch (err) {
        return res.status(status.INTERNAL_SERVER_ERROR).json({
            message: err.message
        });
    }
};

