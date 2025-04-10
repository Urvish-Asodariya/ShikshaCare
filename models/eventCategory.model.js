const mongoose = require("mongoose");
const eventCategorySchema = new mongoose.Schema({
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

const EventCategory = mongoose.model("EventCategory", eventCategorySchema);
module.exports = EventCategory;