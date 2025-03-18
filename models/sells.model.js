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

const Sell = mongoose.model("Sell", sellSchema);
module.exports = Sell;