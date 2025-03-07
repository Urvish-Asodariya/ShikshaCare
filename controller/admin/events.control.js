const Event = require('../../models/events.model');
const EventCard = require('../../models/eventCard.model');
const eventCategory = require("../../models/eventCategory.model");
const { status } = require("http-status");
const Sell = require("../../models/sells.model");
const { getFileUrl } = require("../../utils/CloudinaryConfig");

exports.addEvent = async (req, res) => {
    try {
        const eventdata = JSON.parse(req.body.data);
        const Category = await eventCategory.findOne({ name: eventdata.category });
        if (!Category) {
            return res.status(status.NOT_FOUND).json({ message: "Category not found" });
        }
        eventdata.image = req.file ? req.file.filename : null;
        eventdata.category = Category._id;
        console.log(eventdata)
        const event = new Event(eventdata);
        await event.save();
        const eventCard = new EventCard({ image: eventdata.image, title: eventdata.title, notes: eventdata.notes, event: event._id });
        await eventCard.save();
        return res.status(status.OK).json({
            message: "Event added successfully"
        });
    }
    catch (err) {
        return res.status(status.INTERNAL_SERVER_ERROR).json({
            message: err.message
        });
    }
};

exports.allEvent = async (req, res) => {
    try {
        const events = await Event.find().populate("category");
        if (events.length == 0) {
            return res.status(status.NOT_FOUND).json({
                message: "No event found"
            });
        }
        events.map(event => {
            event.image = getFileUrl(event.image);
        });
        return res.status(status.OK).json({
            message: "Events retrieved successfully",
            events: events
        });
    }
    catch (err) {
        return res.status(status.INTERNAL_SERVER_ERROR).json({
            message: err.message
        });
    }
};

exports.singleEvent = async (req, res) => {
    try {
        const id = req.params.id;
        const event = await Event.findById(id);
        if (!event) {
            return res.status(status.NOT_FOUND).json({
                message: "Event not found"
            });
        }
        event.image = getFileUrl(event.image);
        return res.status(status.OK).json({
            message: "Event retrieved successfully",
            event: event
        });
    }
    catch (err) {
        return res.status(status.INTERNAL_SERVER_ERROR).json({
            message: err.message
        });
    }
};

exports.updateEvent = async (req, res) => {
    try {
        const id = req.params.id;
        const eventdata = JSON.parse(req.body.data);
        if (req.file) {
            eventdata.image = req.file.filename;
        }
        const updatedEvent = await Event.findByIdAndUpdate(id, eventdata, { new: true, runValidators: true });
        if (!updatedEvent) {
            return res.status(status.NOT_FOUND).json({
                message: "Event not found"
            });
        }
        await updatedEvent.save();
        return res.status(status.OK).json({
            message: "Event updated",
        });
    }
    catch (err) {
        return res.status(status.INTERNAL_SERVER_ERROR).json({
            message: err.message
        });
    }
};

exports.deleteEvent = async (req, res) => {
    try {
        const id = req.params.id;
        const event = await Event.findByIdAndDelete(id);
        if (!event) {
            return res.status(status.NOT_FOUND).json({
                message: "Event not found"
            });
        }
        await EventCard.findOneAndDelete({ event: id });
        return res.status(status.OK).json({
            message: "Event deleted"
        });
    }
    catch (err) {
        return res.status(status.INTERNAL_SERVER_ERROR).json({
            message: err.message
        });
    };
};

exports.enrollChart = async (req, res) => {
    try {
        const sells = await Sell.aggregate([
            { $match: { type: "Event" } },
            {
                $group: {
                    _id: { $month: "$createdAt" },
                    total: { $sum: "$quantity" }
                }
            },
            {
                $sort: { _id: -1 }
            },
            {
                $limit: 6,
            },
            // {
            //     $skip: 1
            // }
        ]);
        sells.map((item) => {
            const months = ["", "Jan", "Feb", "Mar", "Apr", "May", "Jun",
                "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
            item._id = months[item._id];
        })
        if (sells === 0) {
            return res.status(status.NOT_FOUND).json({
                message: "No sales found"
            });
        }
        return res.status(status.OK).json({
            message: "Last 5 month sales fetched successfully",
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
        const results = await eventCategory.aggregate([
            {
                $lookup: {
                    from: "events",
                    localField: "_id",
                    foreignField: "category",
                    as: "events"
                }
            },
            {
                $project: {
                    _id: 0,
                    name: 1,
                    totalProducts: { $size: "$events" }
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