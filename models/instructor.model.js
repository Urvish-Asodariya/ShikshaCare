const mongoose = require('mongoose');

const instructorSchema = new mongoose.Schema({
    personalInformation: {
        firstName: {
            type: String,
        },
        lastName: {
            type: String,
        },
        email: {
            type: String,
            unique: true
        },
        phone: {
            type: String,
        },
        dateOfBirth: {
            type: Date,
        },
        gender: {
            type: String,
            enum: ['male', 'female'],
        },
    },

    professionalInformation: {
        qualification: {
            type: String,
        },
        specialization: {
            type: String,
        },
        experience: {
            type: String,
        },
        certifications: {
            type: String
        }
    },
    teachingPreferences: {
        preferredSubjects: [{
            type: [String],
        }],
        availability: {
            type: String,
            enum: ['full-time', 'part-time', 'weekends'],
        },
        availabilityComments: {
            type: String
        },
        teachingMode: {
            type: String,
            enum: ['online', 'in-person', 'hybrid']
        }
    },
    additionalInformation: {
        languages: {
            type: String
        },
        bio: {
            type: String,
        },
        portfolio: {
            type: String
        },
        salary: {
            type: String
        },
        resume: {
            type: String
        }
    },
    applicationStatus: {
        type: String,
        enum: ['Pending', 'Approved', 'Rejected'],
        default: 'Pending'
    },
    employMentStatus: {
        type: String,
        enum: ['Employed', 'Unemployed', 'Freelancer'],
        default: 'Unemployed'
    },
}, {
    timestamps: true
});

module.exports = mongoose.model('Instructor', instructorSchema);
