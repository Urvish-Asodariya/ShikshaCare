const mongoose = require("mongoose");
const bookCategorySchema = new mongoose.Schema({
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

const BookCategory = mongoose.model("BookCategory", bookCategorySchema);
module.exports = BookCategory;