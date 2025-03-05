const CourseCard = require("../../models/courseCard.model");
const { status } = require("http-status");
const { getFileUrl } = require("../../utils/CloudinaryConfig");

exports.allCards = async (req, res) => {
    try {
        const limit = 6;
        const page = parseInt(req.query.page) || 1;
        const skip = (page - 1) * limit;
        const total = await CourseCard.countDocuments();
        const cards = await CourseCard.aggregate([
            { $skip: skip },
            { $limit: limit }
        ]);
        if (cards.length == 0) {
            return res.status(status.NOT_FOUND).json({
                message: "No course found"
            });
        }
        cards.map(card => {
            card.courseDetails.image = getFileUrl(card.courseDetails.image);
        });
        return res.status(status.OK).json({
            message: "Courses retrieved successfully",
            cards: cards,
            total: total,
        });
    }
    catch (err) {
        return res.status(status.INTERNAL_SERVER_ERROR).json({
            message: err.message
        });
    }
};
