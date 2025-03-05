const Instructor = require("../../models/instructor.model");
const { status } = require("http-status");

exports.addInstructor = async (req, res) => {
    try {
        const {
            firstName, lastName, email, phone, dateOfBirth, gender,
            qualification, specialization, experience, certifications,
            preferredSubjects, availability, availabilityComments,
            teachingMode, languages, bio, portfolio, salary
        } = req.body;
        const resume = req.file ? req.file.filename : null;
        const newInstructor = new Instructor({
            personalInformation: {
                firstName,
                lastName,
                email,
                phone,
                dateOfBirth,
                gender
            },
            professionalInformation: {
                qualification,
                specialization,
                experience,
                certifications
            },
            teachingPreferences: {
                preferredSubjects: preferredSubjects ? JSON.parse(preferredSubjects) : [],
                availability,
                availabilityComments,
                teachingMode
            },
            additionalInformation: {
                languages,
                bio,
                portfolio,
                salary,
                resume: resume
            }
        });
        await newInstructor.save();
        res.status(status.OK).json({
            message: "Your application has been received successfully!. Please check your email for further details. Response will be sent within 2 to 3 days.",
        });
    }
    catch (err) {
        return res.status(500).json({
            message: err.message
        });
    }
};

