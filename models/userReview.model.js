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

const Userreview = mongoose.model("Userreview", userReviewSchema);
module.exports = Userreview;