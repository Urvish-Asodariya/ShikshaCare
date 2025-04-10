const mongoose = require("mongoose");

const userReviewSchema = mongoose.Schema({
    username: {
        type: String,
    },
    rating: {
        type: Number,
        min: 0,
        max: 5
    },
    review: {
        type: String,
    },
    itemType: {
        type: String,
        enum: ['Book', 'Event', 'Course'],
        required: true
    },
    itemId: {
        type: mongoose.Schema.Types.ObjectId,
        refPath: 'itemType',
        required: true
    }
},
    {
        timestamps: true
    });

const Userreview = mongoose.model("Userreview", userReviewSchema);
module.exports = Userreview;