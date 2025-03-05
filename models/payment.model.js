const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    item: {
        type: mongoose.Schema.Types.ObjectId,
        refPath: 'itemType',
        required: true,
    },
    itemType: {
        type: String,
        enum: ['Book', 'Course', 'Event']
    },
    price: {
        type: Number,
        required: true
    },
    orderId: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'completed', 'failed'],
        default: 'pending'
    },
}, {
    timestamps: true
});

module.exports = mongoose.model('Payment', paymentSchema);
