const mongoose = require("mongoose");
const sellSchema = mongoose.Schema({
    name: {
        type: String,
    },
    quantity: {
        type: Number
    },
    price: {
        type: Number
    },
    item: {
        type: mongoose.Schema.Types.ObjectId,
        refPath: 'itemType'
    },
    type: {
        type: String,
        enum: ['Book', 'Event', 'Course']
    }
},
    {
        timestamps: true
    });
module.exports = mongoose.model("Sell", sellSchema);