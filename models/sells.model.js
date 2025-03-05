const mongoose = require("mongoose");
const sellSchema = mongoose.Schema({
    name: {
        type: String,
    },
    quantity: {
        type: Number
    },
    type: {
        type: String
    },
    price: {
        type: Number
    },
    item: {
        type: mongoose.Schema.Types.ObjectId,
        enum: ['Book', 'Event', 'Course'],
    },
},
    {
        timestamps: true
    });
module.exports = mongoose.model("Sell", sellSchema);