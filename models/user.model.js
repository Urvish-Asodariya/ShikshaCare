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
        enum: ['Student', 'Admin'],
        default: 'Student',
    },
    status: {
        type: String,
        enum: ["Active", "Inactive", "Block"],
        default: "Active"
    },
    otp: {
        type: Number
    },
    qualifications: [
        {
            title: {
                type: String
            },
            institute: {
                type: String
            },
            year: {
                type: String
            }
        }
    ],
    expertise: {
        type: [String]
    }
}, {
    timestamps: true,
});

module.exports = mongoose.model('User', userSchema);
