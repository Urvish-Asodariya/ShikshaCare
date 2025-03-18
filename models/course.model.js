const mongoose = require('mongoose');
const courseSchema = new mongoose.Schema({
    courseDetails: {
        title: { type: String, },
        instructor: { type: String, },
        duration: { type: String, },
        level: { type: String, },
        rating: { type: Number, },
        description: { type: String, },
        image: { type: String, },
        price: { type: String, },
        video: { type: String, }
    },
    curriculum: [
        {
            moduleTitle: { type: String, },
            lessons: [{ type: String, }],
        },
    ],
    features: {
        totalLessons: { type: Number, },
        certificate: { type: Boolean, },
        lifetimeAccess: { type: Boolean, },
        realWorldProjects: { type: Boolean, default: false },
        communitySupport: { type: Boolean, default: false },
        personalizedFeedback: { type: Boolean, default: false },
        quizzes: { type: Boolean, default: false },
        mentoring: { type: Boolean, default: false },
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'CourseCategory',
    }
}, {
    timestamps: true
}
);
const Course = mongoose.model('Course', courseSchema);
module.exports = Course;