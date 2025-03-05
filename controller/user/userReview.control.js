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
        console.log(req.body);
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