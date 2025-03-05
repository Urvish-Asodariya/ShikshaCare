const ContactUs = require('../../models/contactus.model');
const { status } = require('http-status');

exports.contactUs = async (req, res) => {
    try {
        const { name, email, message } = req.body;
        const contactUs = new ContactUs({ name, email, message });
        await contactUs.save();
        return res.status(status.CREATED).json({
            message: "Message sent successfully"
        });
    }
    catch (err) {
        return res.status(status.INTERNAL_SERVER_ERROR).json({
            message: err.message
        });
    }
};

exports.allContactUs = async (req, res) => {
    try {
        const allContact = await ContactUs.find().sort({ createdAt: -1 });
        if (allContact.length == 0) {
            return res.status(status.NOT_FOUND).json({
                message: "No contact messages found"
            });
        }
        return res.status(status.OK).json({
            message: "All contact messages retrieved successfully",
            data: allContact
        });
    }
    catch (err) {
        return res.status(status.INTERNAL_SERVER_ERROR).json({
            message: err.message
        });
    }
}

exports.singleContactUs = async (req, res) => {
    try {
        const id = req.params.id;
        const contact = await ContactUs.findById(id);
        if (!contact) {
            return res.status(status.NOT_FOUND).json({
                message: "Contact message not found"
            });
        }
        return res.status(status.OK).json({
            message: "Contact message retrieved successfully",
            data: contact
        });
    }
    catch (err) {
        return res.status(status.INTERNAL_SERVER_ERROR).json({
            message: err.message
        });
    }
}

exports.deleteContactUs = async (req, res) => {
    try {
        const id = req.params.id;
        const contact = await ContactUs.findByIdAndDelete(id);
        if (!contact) {
            return res.status(status.NOT_FOUND).json({
                message: "Contact message not found"
            });
        }
        return res.status(status.OK).json({
            message: "Contact message deleted successfully"
        });
    }
    catch (err) {
        return res.status(status.INTERNAL_SERVER_ERROR).json({
            message: err.message
        });
    }
}