const mongoose = require("mongoose");
const EnrollfromSchema = new mongoose.Schema({
    name: {
        type: String,
    },
    email: {
        type: String,
    },
    mobile: {
        type: String,
    },
    education: {
        type: String,
    },
    currentProfile: {
        type: String,
    },
    language: {
        type: String,
    },
    status: {
        type: String,
        enum: ["Pending", "Approved", "Rejected"],
        default: "Pending"
    }
});
module.exports = mongoose.model("Enrollform", EnrollfromSchema);
