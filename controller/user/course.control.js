const Course = require("../../models/course.model");
const { status } = require("http-status");
const { getFileUrl } = require("../../utils/CloudinaryConfig");

exports.singleCourse = async (req, res) => {
    try {
        const id = req.params.id;
        const course = await Course.findById(id);
        if (!course) {
            return res.status(status.NOT_FOUND).json({
                message: "Course not found"
            });
        }
        course.courseDetails.image = getFileUrl(course.courseDetails.image);
        return res.status(status.OK).json({
            message: "Course retrieved successfully",
            course: course
        });
    }
    catch (err) {
        return res.status(status.INTERNAL_SERVER_ERROR).json({
            message: err.message
        });
    }
};