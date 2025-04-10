const Book = require("../../models/book.model");
const BookCard = require("../../models/bookCard.model");
const bookCategory = require("../../models/bookCategory.model");
const { status } = require("http-status");

exports.add = async (req, res) => {
    try {
        const { name, description } = req.body;
        const existingCategory = await bookCategory.findOne({ name });
        if (existingCategory) {
            return res.status(status.CONFLICT).json({
                message: "Category already exists"
            });
        }
        const category = new bookCategory({ name, description });
        await category.save();
        return res.status(status.OK).json({
            message: "category added successfully"
        });
    }
    catch (err) {
        return res.status(status.INTERNAL_SERVER_ERROR).json({
            message: err.message
        });
    }
};

exports.all = async (req, res) => {
    try {
        const categories = await bookCategory.find();
        if (categories.length == 0) {
            return res.status(status.NOT_FOUND).json({
                message: "Categories not found"
            })
        }
        return res.status(status.OK).json({
            message: "categories fetched successfully",
            data: categories
        });
    }
    catch (err) {
        return res.status(status.INTERNAL_SERVER_ERROR).json({
            message: err.message
        });
    }
};

exports.update = async (req, res) => {
    try {
        const id = req.params.id;
        const category = await bookCategory.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });
        if (!category) {
            return res.status(status.NOT_FOUND).json({
                message: "Category not found"
            });
        }
        return res.status(status.OK).json({
            message: "Category updated successfully",
            data: category
        });
    } catch (err) {
        return res.status(status.INTERNAL_SERVER_ERROR).json({
            message: err.message
        });
    }
};

exports.delete = async (req, res) => {
    try {
        const id = req.params.id;
        const category = await bookCategory.findById(id);
        if (!category) {
            return res.status(status.NOT_FOUND).json({ message: "Category not found" });
        }
        const courses = await Book.find({ category: category._id });
        for (const course of courses) {
            await BookCard.deleteMany({ course: course._id });
            await Book.findByIdAndDelete({ id: course._id })
        }
        await bookCategory.findByIdAndDelete(id);
        return res.status(status.OK).json({
            message: "Category deleted successfully"
        });
    } catch (err) {
        return res.status(status.INTERNAL_SERVER_ERROR).json({
            message: err.message
        });
    }
};
