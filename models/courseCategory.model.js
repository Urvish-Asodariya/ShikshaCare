const mongoose = require("mongoose");
const courseCategorySchema = new mongoose.Schema({
    name: {
        type: String,
    },
    description: {
        type: String,
    }
},
    {
        timestamps: true
    });

const CourseCategory = mongoose.model("CourseCategory", courseCategorySchema);
module.exports = CourseCategory;