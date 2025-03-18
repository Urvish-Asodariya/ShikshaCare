const jwt = require('jsonwebtoken');
const { status } = require("http-status");
const Admin = require("../models/user.model")

exports.auth = (req, res, next) => {
    const token = req.header('Authorization')?.split(' ')[1];
    if (!token) {
        return res.status(status.UNAUTHORIZED).json({
            message: 'Access denied. No token provided.'
        });
    }
    try {
        const verified = jwt.verify(token, process.env.SECRET_KEY);
        req.user = { _id: verified.id };
        next();
    } catch (err) {
        return res.status(status.BAD_REQUEST).json({
            message: "Invalid token"
        });
    }
};

exports.isUser = async (req, res, next) => {
    try {
        const id = req.user._id;
        const admin = await Admin.findById(id);
        if (!admin) {
            return res.status(status.UNAUTHORIZED).json({
                message: "You are not an user"
            });
        }
        next();
    } catch (err) {
        return res.status(status.INTERNAL_SERVER_ERROR).json({
            message: "Error fetching user information."
        });
    }
};

exports.isadmin = async (req, res, next) => {
    try {
        const id = req.user._id;
        const admin = await Admin.findById(id);
        if (!admin || admin.role != "Admin") {
            return res.status(status.UNAUTHORIZED).json({
                message: "You are not an admin"
            });
        }
        next();
    } catch (err) {
        return res.status(status.INTERNAL_SERVER_ERROR).json({
            message: "Error fetching user information."
        });
    }
};
