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
    }
});
const Enrollform = mongoose.model("Enrollform", EnrollfromSchema);
module.exports = Enrollform;
