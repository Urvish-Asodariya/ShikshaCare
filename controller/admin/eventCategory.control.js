const Event = require('../../models/events.model');
const EventCard = require('../../models/eventCard.model');
const eventCategory = require("../../models/eventCategory.model");
const { status } = require("http-status");

exports.add = async (req, res) => {
    try {
        const { name, description } = req.body;
        const existingCategory = await eventCategory.findOne({ name });
        if (existingCategory) {
            return res.status(status.CONFLICT).json({
                message: "Category already exists"
            });
        }
        const category = new eventCategory({ name, description });
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
        const categories = await eventCategory.find();
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
        const category = await eventCategory.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });
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
        const category = await eventCategory.findById(id);
        if (!category) {
            return res.status(status.NOT_FOUND).json({ message: "Category not found" });
        }
        const events = await Event.find({ category: category._id });
        for (const event of events) {
            await EventCard.deleteMany({ event: event._id });
        }
        await Event.findByIdAndDelete({ category: category._id });
        await eventCategory.findByIdAndDelete(id);
        return res.status(status.OK).json({
            message: "Category deleted successfully"
        });
    } catch (err) {
        return res.status(status.INTERNAL_SERVER_ERROR).json({
            message: err.message
        });
    }
};
