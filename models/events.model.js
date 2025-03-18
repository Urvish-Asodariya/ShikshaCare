const mongoose = require('mongoose');
const eventSchema = new mongoose.Schema({
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
    description: {
        about: {
            type: String
        },
        detail: {
            type: [String]
        }
    },
    workshop: [
        {
            title: {
                type: String
            },
            description: {
                type: String
            },
        }
    ],
    schedule: [
        {
            time: {
                type: String
            },
            title: {
                type: String
            },
            detail: {
                type: String
            }
        }
    ],
    price: {
        type: Number
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'EventCategory',
    }
},
    {
        timestamps: true
    });

const Event = mongoose.model('Event', eventSchema);
module.exports = Event;