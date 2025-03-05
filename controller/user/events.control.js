const Event = require('../../models/events.model');
const { status } = require("http-status");
const { getFileUrl } = require("../../utils/CloudinaryConfig");

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