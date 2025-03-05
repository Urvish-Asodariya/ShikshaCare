const CourseCard = require("../../models/courseCard.model");
const { status } = require("http-status");
const { getFileUrl } = require("../../utils/CloudinaryConfig");

exports.allCards = async (req, res) => {
    try {
        const cards = await CourseCard.find();
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
            cards: cards
        });
    }
    catch (err) {
        return res.status(status.INTERNAL_SERVER_ERROR).json({
            message: err.message
        });
    }
};

exports.singleCard = async (req, res) => {
    try {
        const id = req.params.id;
        const card = await CourseCard.findById(id);
        if (!card) {
            return res.status(status.NOT_FOUND).json({
                message: "Course not found"
            });
        }
        card.courseDetails.image = getFileUrl(card.courseDetails.image);
        return res.status(status.OK).json({
            message: "Course retrieved successfully",
            course: card
        });
    }
    catch (err) {
        return res.status(status.INTERNAL_SERVER_ERROR).json({
            message: err.message
        });
    }
};