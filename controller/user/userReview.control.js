const Userreview = require("../../models/userReview.model");
const { status } = require("http-status");

exports.addReview = async (req, res) => {
    try {
        const id = req.params.bookId;
        const itemType = req.body.itemType;
        let itemModel;
        switch (itemType) {
            case 'Book': itemModel = require('../../models/book.model'); break;
            case 'Course': itemModel = require('../../models/course.model'); break;
            default:
                return res.status(400).json({ message: "Invalid itemType" });
        }
        const item = await itemModel.findById(id);
        if (!item) {
            return res.status(404).json({ message: `${itemType} not found` });
        }
        const { reviewerName, rating, reviewText } = req.body;
        console.log(req.body);
        const userReview = new Userreview({ username: reviewerName, rating: rating, review: reviewText, itemType: itemType, itemId: id });
        await userReview.save();
        res.status(status.OK).json({
            message: "Review added successfully",
        });
    }
    catch (err) {
        return res.status(status.INTERNAL_SERVER_ERROR).json({
            message: err.message,
        });
    }
};

exports.allReview = async (req, res) => {
    try {
        const id = req.params.bookId;
        const review = await Userreview.find({ book: id });
        if (review.length == 0) {
            return res.status(status.NOT_FOUND).json({
                message: "No reviews found for this book"
            });
        }
        res.status(status.OK).json({
            message: "Reviews found",
            data: review
        });
    }
    catch (err) {
        return res.status(status.INTERNAL_SERVER_ERROR).json({
            message: err.message,
        });
    }
};