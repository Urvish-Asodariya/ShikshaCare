const mongoose = require('mongoose');
const userSchema = new mongoose.Schema({
    firstName: {
        type: String,
    },
    lastName: {
        type: String,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true
    },
    dateOfBirth: {
        type: String
    },
    mobileNumber: {
        type: String
    },
    gender: {
        type: String,
        enum: ['male', 'female']
    },
    image: {
        type: String
    },
    city: {
        type: String
    },
    state: {
        type: String
    },
    joiningdate: {
        type: String
    },
    batch: {
        type: String
    },
    book: {
        type: [String]
    },
    course: {
        type: [String]
    },
    event: {
        type: [String]
    },
    orderId: {
        type: String
    },
    role: {
        type: String,
        enum: ['Student', 'Admin', 'Teacher'],
        default: 'Student',
    },
    status: {
        type: String,
        enum: ["activate", "deactivate", "block"],
        default: "activate"
    },
    otp: {
        type: Number
    }
}, {
    timestamps: true,
});

module.exports = mongoose.model('User', userSchema);
