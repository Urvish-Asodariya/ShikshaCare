const mongoose = require("mongoose");
const bookCategorySchema = new mongoose.Schema({
    name: {
        type: String,
    }
},
    {
        timestamps: true
    });

module.exports = mongoose.model("BookCategory", bookCategorySchema);