const mongoose = require('mongoose');

const bookCardSchema = new mongoose.Schema({
    title: { type: String, required: true },
    author: { type: String, required: true },
    image: { type: String, required: true },
    badges: [{ type: String }],
    rating: {
        average: { type: Number, required: true, min: 0, max: 5 },
        totalReviews: { type: Number, required: true }
    },
    pricing: {
        price: { type: Number, required: true }
    },
    book: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Book',
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('BookCard', bookCardSchema);
