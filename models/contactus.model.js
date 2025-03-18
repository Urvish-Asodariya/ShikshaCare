const mongoose = require("mongoose");
const ContactUsSchema = new mongoose.Schema({
    name: {
        type: String,
    },
    email: {
        type: String,
    },
    message: {
        type: String,
    }
});
const ContactUs = mongoose.model("ContactUs", ContactUsSchema);
module.exports = ContactUs;