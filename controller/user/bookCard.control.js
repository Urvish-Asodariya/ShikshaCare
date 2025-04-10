const BookCard = require("../../models/bookCard.model");
const { status } = require("http-status");
const mongoose = require('mongoose');
const { getFileUrl } = require("../../utils/CloudinaryConfig");
const bookCategory = require("../../models/bookCategory.model");

exports.allBookCard = async (req, res) => {
    try {
        const limit = 6;
        const page = parseInt(req.query.page) || 1;
        const skip = (page - 1) * limit;
        const total = await BookCard.countDocuments();
        const bookCard = await BookCard.aggregate([
            { $skip: skip },
            { $limit: limit }
        ]);
        if (bookCard.length == 0) {
            return res.status(status.NOT_FOUND).json({
                message: "No book card found"
            });
        }
        bookCard.forEach(card => {
            card.image = getFileUrl(card.image);
        });
        return res.status(status.OK).json({
            message: "Books card found",
            data: bookCard,
            total: total,
        })
    }
    catch (err) {
        res.status(status.INTERNAL_SERVER_ERROR).json({
            message: err.message
        });
    }
};

exports.searchCard = async (req, res) => {
    try {
        const query = req.query.query || "";
        const page = parseInt(req.query.page) || 1;
        const limit = 6;
        const skip = (page - 1) * limit;
        const filter = { "title": { $regex: query, $options: "i" } };
        const bookcard = await BookCard.find(filter).skip(skip).limit(limit);
        const total = await BookCard.countDocuments(filter);
        if (bookcard.length == 0) {
            return res.status(status.NOT_FOUND).json({
                message: "No course found"
            });
        }
        bookcard.forEach(book => {
            book.image = getFileUrl(book.image);
        });
        return res.status(status.OK).json({
            message: "EventCards retrieved successfully",
            data: bookcard,
            total: total
        })
    }
    catch (err) {
        return res.status(status.INTERNAL_SERVER_ERROR).json({
            message: err.message
        })
    }
};

exports.categoryitem = async (req, res) => {
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
                    _id: 1,
                    name: 1,
                    description: 1,
                    totalProducts: { $size: "$books" }
                }
            }
        ]);
        const categoryProduct = results.map((item) => {
            const _id = item._id;
            const name = item.name;
            const description = item.description;
            const totalProducts = item.totalProducts
            return { _id, name, description, totalProducts };
        })
        return res.status(status.OK).json({
            message: "Book Items fetched successfully",
            data: categoryProduct
        });
    }
    catch (err) {
        return res.status(status.INTERNAL_SERVER_ERROR).json({
            message: err.message
        });
    }
};

exports.categoryWiseCourse = async (req, res) => {
    try {
        const results = await bookCategory.aggregate([
            {
                $match: { _id: new mongoose.Types.ObjectId(req.params.id) }
            },
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
                    bookName: "$books.title"
                }
            }
        ]);

        const categoryProduct = results.map((item) => {
            return { bookName: item.bookName };
        });

        return res.status(status.OK).json({
            message: "Categories wise data fetched successfully",
            data: categoryProduct
        });

    } catch (err) {
        return res.status(status.INTERNAL_SERVER_ERROR).json({
            message: err.message
        });
    }
}