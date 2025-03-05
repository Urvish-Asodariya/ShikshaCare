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
    book: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Book'
    }
},
    {
        timestamps: true
    });

module.exports = mongoose.model("Userreview", userReviewSchema);