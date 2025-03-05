const Userreview = require("../../models/userReview.model");
const Book = require("../../models/book.model");
const { status } = require("http-status");

exports.addReview = async (req, res) => {
    try {
        const id = req.params.bookId;
        const book = await Book.findById(id);
        if (!book) {
            return res.status(status.NOT_FOUND).json({
                message: "Book not found"
            });
        }
        const { reviewerName, rating, reviewText } = req.body;
        const userReview = new Userreview({ username: reviewerName, rating: rating, review: reviewText, book: id });
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
        const reviews = await Userreview.find();
        if (reviews.length == 0) {
            return res.status(status.NOT_FOUND).json({
                message: "No found any reviews"
            });
        }
        return res.status(status.OK).json({
            message: "Reviews found successfully",
            data: reviews
        });
    }
    catch (err) {
        return res.status(status.INTERNAL_SERVER_ERROR).json({
            message: err.message
        });
    }
};

exports.bookReview = async (req, res) => {
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

exports.singleReview = async (req, res) => {
    try {
        const id = req.params.id;
        const review = await Userreview.findById(id);
        if (!review) {
            return res.status(status.NOT_FOUND).json({
                message: "Review not found"
            });
        }
        res.status(status.OK).json({
            message: "Review found",
            data: review
        });
    }
    catch (err) {
        return res.status(status.INTERNAL_SERVER_ERROR).json({
            message: err.message,
        });
    }
};

exports.updateReview = async (req, res) => {
    try {
        const id = req.params.id;
        const review = await Userreview.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });
        if (!review) {
            return res.status(status.NOT_FOUND).json({
                message: "Review not found"
            });
        }
        res.status(status.OK).json({
            message: "Review updated",
            data: review
        });
    }
    catch (err) {
        return res.status(status.INTERNAL_SERVER_ERROR).json({
            message: err.message,
        });
    }
};

exports.deleteReview = async (req, res) => {
    try {
        const id = req.params.id;
        const review = await Userreview.findById(id);
        if (!review) {
            return res.status(status.NOT_FOUND).json({
                message: "Review not found"
            });
        }
        await Userreview.findByIdAndDelete(id);
        res.status(status.OK).json({
            message: "Review deleted"
        });
    }
    catch (err) {
        return res.status(status.INTERNAL_SERVER_ERROR).json({
            message: err.message,
        });
    }
};
