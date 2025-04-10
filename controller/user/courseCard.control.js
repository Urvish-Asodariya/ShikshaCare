const CourseCard = require("../../models/courseCard.model");
const { status } = require("http-status");
const mongoose = require('mongoose');
const { getFileUrl } = require("../../utils/CloudinaryConfig");
const courseCategory = require("../../models/courseCategory.model");

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
        console.log(err);
        return res.status(status.INTERNAL_SERVER_ERROR).json({
            message: err.message
        });
    }
};

exports.searchCard = async (req, res) => {
    try {
        const query = req.query.query;
        const limit = 6;
        const page = parseInt(req.query.page) || 1;
        const skip = (page - 1) * limit;
        const coursecard = await CourseCard.find({
            "courseDetails.title": { $regex: query, $options: "i" }
        }).skip(skip).limit(limit);

        const total = await CourseCard.countDocuments({
            "courseDetails.title": { $regex: query, $options: "i" }
        });
        if (coursecard.length == 0) {
            return res.status(status.NOT_FOUND).json({
                message: "No course found"
            });
        }
        coursecard.forEach(card => {
            card.courseDetails.image = getFileUrl(card.courseDetails.image);
        });
        return res.status(status.OK).json({
            message: "CourseCards retrieved successfully",
            cards: coursecard,
            total: total
        })
    }
    catch (err) {
        return res.status(status.INTERNAL_SERVER_ERROR).json({
            message: err.message
        })
    }
};

exports.categoryItems = async (req, res) => {
    try {
        const results = await courseCategory.aggregate([
            {
                $lookup: {
                    from: "courses",
                    localField: "_id",
                    foreignField: "category",
                    as: "courses"
                }
            },
            {
                $project: {
                    _id: 1,
                    name: 1,
                    description: 1,
                    totalProducts: { $size: "$courses" }
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
            message: "Categories wise data fetched successfully",
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
        const results = await courseCategory.aggregate([
            {
                $match: { _id: new mongoose.Types.ObjectId(req.params.id) }
            },
            {
                $lookup: {
                    from: "courses",
                    localField: "_id",
                    foreignField: "category",
                    as: "courses"
                }
            },
            {
                $project: {
                    courseName: "$courses.courseDetails.title"
                }
            }
        ]);

        const categoryProduct = results.map((item) => {
            return { courseName: item.courseName };
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