const Instructor = require("../../models/instructor.model");
const nodemailer = require("nodemailer");
const { status } = require("http-status");
const { getFileUrl } = require("../../utils/CloudinaryConfig");


const getFutureDate = (days) => {
    const currentDate = new Date();
    currentDate.setDate(currentDate.getDate() + days);

    const day = String(currentDate.getDate()).padStart(2, '0');
    const month = String(currentDate.getMonth() + 1).padStart(2, '0');
    const year = currentDate.getFullYear();
    return `${day}/${month}/${year}`;
};

const sendResponseEmail = async (userEmail, name, interviewDate, resultsDate) => {
    try {
        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.EMAIL,
                pass: process.env.PASSWORD
            }
        });
        const mailOptions = {
            from: process.env.EMAIL,
            to: userEmail,
            subject: "🚀 Your Instructor Application Has Been Received!",
            html: `
                <!DOCTYPE html>
                <html lang="en">
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>Instructor Application Received</title>
                    <style>
                        body { font-family: Arial, sans-serif; background-color: #f9f9f9; color: #333; }
                        .email-container { max-width: 600px; margin: 20px auto; background: #ffffff; border: 1px solid #ddd; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1); }
                        .header { background: linear-gradient(90deg, #4CAF50, #2E8B57); color: white; text-align: center; padding: 20px; border-bottom: 4px solid #2E8B57; }
                        .header h1 { margin: 0; font-size: 24px; text-transform: uppercase; letter-spacing: 1px; }
                        .header p { margin: 5px 0 0; font-size: 14px; font-style: italic; }
                        .content { padding: 20px; text-align: left; }
                        .content p { font-size: 16px; margin: 10px 0; }
                        .important-dates { background-color: #EAF2F8; padding: 15px; border-radius: 8px; margin: 20px 0; text-align: center; }
                        .important-dates h3 { color: #2C3E50; margin-bottom: 10px; }
                        .important-dates p { font-size: 18px; color: #E74C3C; font-weight: bold; }
                        .footer { background-color: #f1f1f1; text-align: center; padding: 10px; font-size: 14px; color: #555; }
                    </style>
                </head>
                <body>
                    <div class="email-container">
                        <div class="header">
                            <h1>🚀 Welcome to ShikshaCare!</h1>
                            <p>"Empowering Education, One Instructor at a Time"</p>
                        </div>
                        <div class="content">
                            <p>Dear <strong>${name}</strong>,</p>
                            <p>We are thrilled to inform you that your application to become an instructor on our platform has been received successfully. Our team will review your application and get in touch with you shortly.</p>
                            <div class="important-dates">
                                <h3>📅 Important Dates</h3>
                                <p>📝 Interview Date: <span>${interviewDate}</span></p>
                                <p>📢 Results Announcement: <span>${resultsDate}</span></p>
                            </div>
                            <h3>📌 What’s Next?</h3>
                            <ul>
                                <li><strong>Interview Date:</strong> Your interview is scheduled for <strong>${interviewDate}</strong>. Please be prepared for the interview.</li>
                                <li><strong>Results Date:</strong> After your interview, we will review your application and share the final results with you on <strong>${resultsDate}</strong>.</li>
                            </ul>
                            <h3>📞 Need Help?</h3>
                            <p>If you have any questions, feel free to contact us:</p>
                            <p><strong>Email:</strong> <a href="mailto:${process.env.EMAIL}" style="color: #2980B9;">${process.env.EMAIL}</a></p>
                            <p><strong>Phone:</strong> ${process.env.MNO}</p>
                            <p><strong>Address:</strong> ${process.env.ADDRESS}</p>
                        </div>
                        <div class="footer">
                            <p>&copy; 2025 ShikshaCare. All rights reserved.</p>
                        </div>
                    </div>
                </body>
                </html>
            `
        };
        await transporter.sendMail(mailOptions);
        console.log(" Email sent successfully!");
    } catch (error) {
        console.error(" Error sending email:", error);
    }
};

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

        await transporter.sendMail(mailOptions);
        res.status(status.OK).json({
            message: "Instructor added successfully",
        });
    }
    catch (err) {
        return res.status(status.INTERNAL_SERVER_ERROR).json({
            message: err.message
        });
    }
};

exports.allInstructors = async (req, res) => {
    try {
        const instructors = await Instructor.find();
        if (instructors.length == 0) {
            return res.status(status.NOT_FOUND).json({
                message: "No instructor found"
            });
        }
        instructors.map(instructor => {
            instructor.additionalInformation.resume = getFileUrl(instructor.additionalInformation.resume);
        });
        return res.status(status.OK).json({
            message: "Instructors found successfully",
            instructors: instructors
        });
    }
    catch (err) {
        return res.status(status.INTERNAL_SERVER_ERROR).json({
            message: err.message
        });
    }
};

exports.singleInstructor = async (req, res) => {
    try {
        const instructorId = req.params.id;
        const instructor = await Instructor.findById(instructorId);
        if (!instructor) {
            return res.status(status.NOT_FOUND).json({
                message: "Instructor not found"
            })
        }
        instructor.additionalInformation.resume = getFileUrl(instructor.additionalInformation.resume);
        return res.status(status.OK).json({
            message: "Instructor profile retrieved successfully",
            instructor: instructor
        });
    }
    catch (err) {
        return res.status(status.INTERNAL_SERVER_ERROR).json({
            message: err.message
        });
    }
};

exports.updateapplicationStatus = async (req, res) => {
    try {
        const instructorId = req.params.id;
        const instructor = await Instructor.findById({ _id: instructorId });
        if (!instructor) {
            return res.status(status.NOT_FOUND).json({
                message: "Instructor not found"
            });
        }
        const name = instructor.personalInformation.firstName;
        const email = instructor.personalInformation.email;
        if (req.query.status === 'Approved') {
            const interviewDate = getFutureDate(7);
            const resultsDate = getFutureDate(15);
            sendResponseEmail(email, name, interviewDate, resultsDate);
        }
        const updatedInstructor = await Instructor.findByIdAndUpdate(instructorId, { $set: { applicationStatus: req.query.status } }, { new: true, runValidators: true });
        if (!updatedInstructor) {
            return res.status(status.NOT_FOUND).json({
                message: "Instructor not found"
            });
        }
        await updatedInstructor.save();
        return res.status(status.OK).json({
            message: "Instructor updated"
        });
    }
    catch (err) {
        return res.status(status.INTERNAL_SERVER_ERROR).json({
            message: err.message
        });
    }
};

exports.updateemployMentStatus = async (req, res) => {
    try {
        const instructor = await Instructor.findById({ _id: req.params.id });
        if (!instructor) {
            return res.status(status.NOT_FOUND).json({
                message: "Instructor not found"
            });
        }
        const updatedInstructor = await Instructor.findByIdAndUpdate(req.params.id, { $set: { employMentStatus: req.query.status } }, { new: true, runValidators: true });
        if (!updatedInstructor) {
            return res.status(status.NOT_FOUND).json({
                message: "Instructor not found"
            });
        }
        await updatedInstructor.save();
        return res.status(status.OK).json({
            message: "Instructor updated"
        });
    }
    catch (err) {
        return res.status(status.INTERNAL_SERVER_ERROR).json({
            message: err.message
        });
    }
};

exports.deleteInstructor = async (req, res) => {
    try {
        const instructorId = req.params.id;
        const instructor = await Instructor.findByIdAndDelete(instructorId);
        if (!instructor) {
            return res.status(status.NOT_FOUND).json({
                message: "Instructor not found"
            });
        }
        return res.status(status.OK).json({
            message: "Instructor deleted"
        });
    }
    catch (err) {
        return res.status(status.INTERNAL_SERVER_ERROR).json({
            message: err.message
        });
    }
};

exports.applicationChart = async (req, res) => {
    try {
        const fiveMonthsAgo = new Date();
        fiveMonthsAgo.setMonth(fiveMonthsAgo.getMonth() - 5);
        const applications = await Instructor.aggregate([
            {
                $match: {
                    createdAt: { $gte: fiveMonthsAgo }
                }
            },
            {
                $group: {
                    _id: { $month: "$createdAt" },
                    totalApplications: { $sum: 1 }
                }
            },
            { $sort: { _id: -1 } }
        ]);
        const months = ["", "Jan", "Feb", "Mar", "Apr", "May", "Jun",
            "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        applications.forEach((item) => {
            item.month = months[item._id];
        });
        if (applications.length === 0) {
            return res.status(status.NOT_FOUND).json({
                message: "No applications found"
            });
        }
        return res.status(status.OK).json({
            message: "Last 5 months' application data fetched successfully",
            data: applications
        });

    } catch (err) {
        return res.status(status.INTERNAL_SERVER_ERROR).json({
            message: err.message
        });
    }
};

exports.deleteApplication = async (req, res) => {
    try {
        const thirtyDaysAgo = new Date(Date.now() - (30 * 24 * 60 * 60 * 1000));
        const expiredApplications = await Instructor.find({
            applicationStatus: "Rejected",
            createdAt: { $lte: thirtyDaysAgo }
        });
        for (const app of expiredApplications) {
            await Instructor.findByIdAndDelete(app._id);
        }
        console.log(`${expiredApplications.length} applications deleted successfully`);
    }
    catch (err) {
        return res.status(status.INTERNAL_SERVER_ERROR).json({
            message: err.message
        });
    }
}