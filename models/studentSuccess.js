const mongoose = require("mongoose");
const studentSuccessSchema = new mongoose.Schema({
    image: {
        type: String
    },
    name: {
        type: String
    },
    position: {
        type: String
    },
    quote: {
        type: String
    },
    achievements: {
        type: Array
    }
},
    {
        timestamps: true
    });
const studentSuccess = mongoose.model("studentSuccess", studentSuccessSchema);
module.exports = studentSuccess;