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
        return res.status(500).json({ message: err.message });
    }
};

exports.allStudent = async (req, res) => {
    try {
        const students = await studentSuccess.find().sort({ createdAt: -1 });
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

exports.singleStudent = async (req, res) => {
    try {
        const studentId = req.params.id;
        const student = await studentSuccess.findById({ _id: studentId });
        if (!student) {
            return res.status(status.NOT_FOUND).json({
                message: "Student not found"
            });
        };
        student.image = getFileUrl(student.image);
        return res.status(status.OK).json({
            message: "Student found",
            data: student
        });
    }
    catch (err) {
        return res.status(status.INTERNAL_SERVER_ERROR).json({
            message: err.message
        });
    }
};

exports.updateStudent = async (req, res) => {
    try {
        const student = await studentSuccess.findById({ _id: req.params.id });
        if (!student) {
            return res.status(status.NOT_FOUND).json({
                message: "Student not found"
            });
        };
        const updateData = JSON.parse(req.body.data);
        console.log(updateData)
        if (req.file) {
            updateData.image = req.file.filename;
        }
        const updatedStudent = await studentSuccess.findByIdAndUpdate(student._id, updateData, { new: true, runValidators: true });
        if (!updatedStudent) {
            return res.status(status.BAD_REQUEST).json({
                message: "Student not updated"
            });
        }
        return res.status(status.OK).json({
            message: "Student updated successfully",
            data: updatedStudent
        });
    }
    catch (err) {
        return res.status(status.INTERNAL_SERVER_ERROR).json({
            message: err.message
        });
    }
};

exports.deleteStudent = async (req, res) => {
    try {
        const studentId = req.params.id;
        const student = await studentSuccess.findById({ _id: studentId });
        if (!student) {
            return res.status(status.NOT_FOUND).json({
                message: "Student not found"
            });
        };
        await studentSuccess.findByIdAndDelete(student._id);
        return res.status(status.OK).json({
            message: "Student deleted successfully"
        });
    }
    catch (err) {
        return res.status(status.INTERNAL_SERVER_ERROR).json({
            message: err.message
        });
    }
};