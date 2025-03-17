const studentSuccess = require("../../models/studentSuccess");
const { status } = require("http-status");
const { getFileUrl } = require("../../utils/CloudinaryConfig");

exports.allStudent = async (req, res) => {
    try {
        const limit = 3;
        const page = parseInt(req.query.page) || 1;
        const skip = (page - 1) * limit;
        const total = await studentSuccess.countDocuments();
        const students = await studentSuccess.aggregate([
            { $skip: skip },
            { $limit: limit }
        ]);
        if (students.length == 0) {
            return res.status(status.NOT_FOUND).json({
                message: "No student found"
            });
        }
        students.map((student) => {
            student.image = getFileUrl(student.image);
        });
        return res.status(status.OK).json({
            message: "Students found",
            data: students,
            total: total
        });
    }
    catch (err) {
        return res.status(status.INTERNAL_SERVER_ERROR).json({
            message: err.message
        });
    }
};
