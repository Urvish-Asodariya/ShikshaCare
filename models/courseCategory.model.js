const mongoose = require("mongoose");
const courseCategorySchema = new mongoose.Schema({
    name: {
        type: String,
    }
},
    {
        timestamps: true
    });

module.exports = mongoose.model("CourseCategory", courseCategorySchema);