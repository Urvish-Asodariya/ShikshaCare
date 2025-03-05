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