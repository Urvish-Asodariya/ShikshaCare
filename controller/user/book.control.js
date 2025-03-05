const Book = require("../../models/book.model");
const Userreview = require("../../models/userReview.model");
const { status } = require("http-status");
const { getFileUrl } = require("../../utils/CloudinaryConfig");

exports.singleBook = async (req, res) => {
    try {
        const id = req.params.id;
        const book = await Book.findById(id);
        if (!book) {
            return res.status(status.NOT_FOUND).json({
                message: "Book not found"
            });
        }
        book.image = getFileUrl(book.image);
        let avgRating = 0;
        let reviews = 0;
        let rating = {};
        const review = await Userreview.find({ book: book._id });
        if (review) {
            const Rating = review.reduce((acc, curr) => acc + curr.rating, 0);
            avgRating = Rating / review.length;
            reviews = review.length;
            rating = {
                average: avgRating,
                totalReviews: reviews
            }
            book.rating = rating;
        } else {
            rating = {
                average: avgRating,
                totalReviews: reviews
            }
            book.rating = rating;
        }
        // await Book.findByIdAndUpdate(id, { rating: rating }, { new: true, runValidators: true });
        // await book.save();
        return res.status(status.OK).json({
            message: "Book retrieved successfully",
            data: book,
            reviews: review
        });
    }
    catch (err) {
        return res.status(status.INTERNAL_SERVER_ERROR).json({
            message: err.message,
        });
    }
};

