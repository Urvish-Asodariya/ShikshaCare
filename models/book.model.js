const mongoose = require('mongoose');

const BookSchema = new mongoose.Schema({
    title: { type: String, required: true },
    author: { type: String, required: true },
    image: { type: String, required: true },
    pdf: { type: String, required: true },
    badges: [{ type: String }],
    rating: {
        average: { type: Number, min: 0, max: 5 },
        totalReviews: { type: Number, required: true }
    },
    pricing: {
        price: { type: Number, required: true }
    },
    details: {
        publisher: { type: String, required: true },
        publicationDate: { type: String, required: true },
        pages: { type: Number, required: true },
        language: { type: String, required: true },
        isbn: { type: String, required: true }
    },
    description: {
        about: { type: String, required: true },
        points: [{ type: String }]
    },
    keyFeatures: [{ type: String }],
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'BookCategory',
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Book', BookSchema);
