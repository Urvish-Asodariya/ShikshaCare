const User = require("../../models/user.model");
const Enrollform = require("../../models/enrollForm.model");
const { status } = require("http-status");

exports.allEnrlForm = async (req, res) => {
    try {
        const enroll = await Enrollform.find({ status: "Approved" });
        if (enroll.length === 0) {
            return res.status(status.NOT_FOUND).json({
                message: "No enroll form found"
            });
        }
        return res.status(status.OK).json({
            message: "Enroll data found",
            data: enroll
        });
    }
    catch (err) {
        return res.status(status.INTERNAL_SERVER_ERROR).json({
            message: err.message
        });
    }
};

exports.singleEnrollForm = async (req, res) => {
    try {
        const id = req.params.id;
        const enroll = await Enrollform.findById(id);
        if (!enroll) {
            return res.status(status.NOT_FOUND).json({
                message: "Enroll form not found"
            });
        }
        return res.status(status.OK).json({
            message: "Enroll data found",
            data: enroll
        });
    }
    catch (err) {
        return res.status(status.INTERNAL_SERVER_ERROR).json({});
    }
};


