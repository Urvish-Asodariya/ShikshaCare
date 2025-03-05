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
module.exports = mongoose.model("studentSuccess", studentSuccessSchema);