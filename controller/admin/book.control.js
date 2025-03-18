const Book = require("../../models/book.model");
const BookCard = require("../../models/bookCard.model");
const bookCategory = require("../../models/bookCategory.model");
const Sell = require("../../models/sells.model");
const Userreview = require("../../models/userReview.model");
const { status } = require("http-status");
const { getFileUrl } = require("../../utils/CloudinaryConfig");

exports.addBook = async (req, res) => {
    try {
        const bookdata = JSON.parse(req.body.data);
        const { title, author, badges, rating, amount, details, description, keyFeatures, category, pdf } = bookdata;
        const Category = await bookCategory.findOne({ name: category });
        if (!Category) {
            return res.status(status.NOT_FOUND).json({ message: "Category not found" });
        }
        const pricing = {
            price: amount,
        }
        const publicId = req.file ? req.file.filename : null;
        const book = new Book({ title, author, image: publicId, pdf, badges, rating, pricing: pricing, details, description, keyFeatures, category: Category._id });
        await book.save();
        const bookCard = new BookCard({ title, author, image: publicId, badges, rating, pricing: pricing, book: book._id });
        await bookCard.save();
        res.status(status.OK).json({
            message: "Book added successfully"
        });
    }
    catch (err) {
        return res.status(status.INTERNAL_SERVER_ERROR).json({
            message: err.message,
        });
    }
};

exports.allBooks = async (req, res) => {
    try {
        const books = await Book.find().populate("category");
        if (books.length == 0) {
            return res.status(status.NOT_FOUND).json({
                message: "No books found"
            });
        }
        books.map((book) => {
            book.image = getFileUrl(book.image);
        });
        res.status(status.OK).json({
            message: "Books retrieved successfully",
            data: books
        });
    }
    catch (err) {
        return res.status(status.INTERNAL_SERVER_ERROR).json({
            message: err.message,
        });
    }
};

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
        const reviews = await Userreview.find({ book: book._id });
        res.status(status.OK).json({
            message: "Book retrieved successfully",
            data: book,
            reviews: reviews
        });
    }
    catch (err) {
        return res.status(status.INTERNAL_SERVER_ERROR).json({
            message: err.message,
        });
    }
};

exports.updateBook = async (req, res) => {
    try {
        const id = req.params.id;
        const book = await Book.findById(id);
        if (!book) {
            return res.status(status.NOT_FOUND).json({
                message: "Book not found"
            });
        }
        const Books = JSON.parse(req.body.data);
        if (req.file) {
            Books.image = req.file.filename;
        }
        const updatedBook = await Book.findByIdAndUpdate(id, Books, { new: true, runValidators: true });
        await BookCard.findByIdAndUpdate({ book: id },
            {
                $set: {
                    title: updatedBook.title,
                    author: updatedBook.author,
                    image: updatedBook.image,
                    badges: updatedBook.badges,
                    rating: updatedBook.rating,
                    pricing: updatedBook.pricing
                }
            },
            { new: true, runValidators: true }
        );
        return res.status(status.OK).json({
            message: "Book updated successfully"
        })
    }
    catch (err) {
        return res.status(status.INTERNAL_SERVER_ERROR).json({
            message: err.message,
        });
    }
};

exports.deleteBook = async (req, res) => {
    try {
        const book = await Book.findById({ _id: req.params.id });
        if (!book) {
            return res.status(status.NOT_FOUND).json({
                message: "Book not found"
            });
        }
        await BookCard.findOneAndDelete({ book: book._id });
        await Book.findByIdAndDelete({ _id: req.params.id });
        return res.status(status.OK).json({
            message: "Book deleted successfully"
        });
    }
    catch (err) {
        return res.status(status.INTERNAL_SERVER_ERROR).json({
            message: err.message,
        });
    }
};

exports.enrollChart = async (req, res) => {
    try {
        const fiveMonthsAgo = new Date();
        fiveMonthsAgo.setMonth(fiveMonthsAgo.getMonth() - 5);
        const sells = await Sell.aggregate([
            {
                $match: {
                    type: "Book",
                    createdAt: { $gte: fiveMonthsAgo }
                }
            },
            {
                $group: {
                    _id: { $month: "$createdAt" },
                    total: { $sum: "$quantity" }
                }
            },
            {
                $sort: { _id: -1 }
            }
        ]);
        const months = ["", "Jan", "Feb", "Mar", "Apr", "May", "Jun",
            "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        sells.forEach((item) => {
            item.month = months[item._id];
        });
        if (sells.length === 0) {
            return res.status(status.NOT_FOUND).json({
                message: "No sales found"
            });
        }
        return res.status(status.OK).json({
            message: "Last 5 months' sales fetched successfully",
            data: sells
        });

    } catch (err) {
        return res.status(status.INTERNAL_SERVER_ERROR).json({
            message: err.message
        });
    }
};

exports.categoryChart = async (req, res) => {
    try {
        const results = await bookCategory.aggregate([
            {
                $lookup: {
                    from: "books",
                    localField: "_id",
                    foreignField: "category",
                    as: "books"
                }
            },
            {
                $project: {
                    _id: 0,
                    name: 1,
                    totalProducts: { $size: "$books" }
                }
            }
        ]);
        const categoryProduct = results.map((item) => {
            const name = item.name
            const totalProducts = item.totalProducts
            return { name, totalProducts };
        })
        return res.status(status.OK).json({
            message: "Chartdata fetched successfully",
            data: categoryProduct
        });
    }
    catch (err) {
        return res.status(status.INTERNAL_SERVER_ERROR).json({
            message: err.message
        });
    }
};