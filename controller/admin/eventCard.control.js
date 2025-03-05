const eventCard = require('../../models/eventCard.model');
const { status } = require("http-status");
const { getFileUrl } = require("../../utils/CloudinaryConfig");

exports.allCards = async (req, res) => {
    try {
        const event = await eventCard.find();
        if (event.length == 0) {
            return res.status(status.NOT_FOUND).json({
                message: "No event found"
            });
        }
        event.map(event => {
            event.image = getFileUrl(event.image);
        });
        return res.status(status.OK).json({
            message: "Events retrieved successfully",
            event: event
        });
    }
    catch (err) {
        return res.status(status.INTERNAL_SERVER_ERROR).json({
            message: err.message
        });
    }
};

exports.singleCard = async (req, res) => {
    try {
        const id = req.params.id;
        const event = await eventCard.findById(id);
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