const mongoose = require('mongoose');
const eventCardSchema = new mongoose.Schema({
    image: {
        type: String
    },
    title: {
        type: String
    },
    notes: {
        date: {
            type: Date
        },
        time: {
            type: String
        },
        type: {
            type: String
        }
    },
    event: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Event'
    }
},
    {
        timestamps: true
    });

const EventCard = mongoose.model('EventCard', eventCardSchema);
module.exports = EventCard;