const Course = require("../../models/course.model");
const Userreview = require("../../models/userReview.model");
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
        const reviews = await Userreview.find({ itemId: course._id, itemType: 'Course' });
        let avgRating = 0;
        if (reviews.length > 0) {
            const total = reviews.reduce((sum, r) => sum + r.rating, 0);
            avgRating = total / reviews.length;
        }
        course.courseDetails.rating = Number(avgRating.toFixed(1));
        return res.status(status.OK).json({
            message: "Course retrieved successfully",
            course: course,
            reviews: reviews,
        });
    }
    catch (err) {
        return res.status(status.INTERNAL_SERVER_ERROR).json({
            message: err.message
        });
    }
};