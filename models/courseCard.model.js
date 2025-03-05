const mongoose = require('mongoose');
const courseCardSchema = new mongoose.Schema({
    courseDetails: {
        title: { type: String, },
        instructor: { type: String, },
        duration: { type: String, },
        level: { type: String, },
        rating: { type: Number, },
        description: { type: String, },
        image: { type: String, },
        price: { type: String, },
    },
    features: {
        totalLessons: { type: Number, required: true },
        certificate: { type: Boolean, required: true },
        lifetimeAccess: { type: Boolean, required: true },
        realWorldProjects: { type: Boolean, default: false },
        communitySupport: { type: Boolean, default: false },
        personalizedFeedback: { type: Boolean, default: false },
        quizzes: { type: Boolean, default: false },
        mentoring: { type: Boolean, default: false },
    },
    course: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course'
    }
}, {
    timestamps: true
});
module.exports = mongoose.model('CourseCard', courseCardSchema);