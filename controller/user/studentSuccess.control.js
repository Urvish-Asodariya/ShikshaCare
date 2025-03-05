const studentSuccess = require("../../models/studentSuccess");
const { status } = require("http-status");
const { getFileUrl } = require("../../utils/CloudinaryConfig");

exports.allStudent = async (req, res) => {
    try {
        const students = await studentSuccess.find().limit(3).sort({ createdAt: -1 });
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
            data: students
        });
    }
    catch (err) {
        return res.status(status.INTERNAL_SERVER_ERROR).json({
            message: err.message
        });
    }
};
