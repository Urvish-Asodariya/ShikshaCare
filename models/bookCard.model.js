const mongoose = require('mongoose');

const bookCardSchema = new mongoose.Schema({
    title: { type: String, required: true },
    author: { type: String, required: true },
    image: { type: String, required: true },
    badges: [{ type: String }],
    rating: {
        average: { type: Number, min: 0, max: 5 },
        totalReviews: { type: Number, }
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

const BookCard = mongoose.model('BookCard', bookCardSchema);
module.exports = BookCard;
