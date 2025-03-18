const mongoose = require("mongoose");
const courseCategorySchema = new mongoose.Schema({
    name: {
        type: String,
    }
},
    {
        timestamps: true
    });

const CourseCategory = mongoose.model("CourseCategory", courseCategorySchema);
module.exports = CourseCategory;