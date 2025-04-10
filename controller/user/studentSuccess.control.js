const studentSuccess = require("../../models/studentSuccess");
const { status } = require("http-status");
const { getFileUrl } = require("../../utils/CloudinaryConfig");

exports.addStudent = async (req, res) => {
    try {
        let { data } = req.body;
        if (!data) {
            return res.status(400).json({ message: "No data received" });
        }
        const parsedData = JSON.parse(data);
        const { name, position, quote, achievements } = parsedData;
        let achievementsData;
        if (Array.isArray(achievements)) {
            achievementsData = achievements;
        } else if (typeof achievements === "string") {
            try {
                achievementsData = JSON.parse(achievements);
            } catch (error) {
                achievementsData = achievements.split(',').map((achievement) => achievement.trim());
            }
        }
        const publicId = req.file ? req.file.filename : null;
        const student = new studentSuccess({
            image: publicId,
            name,
            position,
            quote,
            achievements: achievementsData
        });
        await student.save();
        return res.status(200).json({ message: "Student added successfully", student });
    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: err.message });
    }
};

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
