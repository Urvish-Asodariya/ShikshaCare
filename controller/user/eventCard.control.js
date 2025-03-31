const eventCard = require('../../models/eventCard.model');
const Event = require('../../models/events.model');
const User = require("../../models/user.model");
const { status } = require("http-status");
const { getFileUrl } = require("../../utils/CloudinaryConfig");
const nodemailer = require('nodemailer');

exports.allCards = async (req, res) => {
    try {
        const limit = 6;
        const page = parseInt(req.query.page) || 1;
        const skip = (page - 1) * limit;
        const total = await eventCard.countDocuments();
        const events = await eventCard.aggregate([
            { $skip: skip },
            { $limit: limit }
        ]);
        if (events.length == 0) {
            return res.status(status.NOT_FOUND).json({
                message: "No event found"
            });
        }
        events.map(event => {
            event.image = getFileUrl(event.image);
        });
        return res.status(status.OK).json({
            message: "Events retrieved successfully",
            events: events,
            total: total,
        });
    }
    catch (err) {
        return res.status(status.INTERNAL_SERVER_ERROR).json({
            message: err.message
        });
    }
};

exports.nearestEvent = async (req, res) => {
    try {
        const today = new Date();
        const event = await Event.findOne({ "notes.date": { $gte: today } }).sort({ "notes.date": 1 });
        if (!event) {
            return res.status(status.NOT_FOUND).json({
                message: "No upcoming events found"
            });
        }
        event.image = getFileUrl(event.image);
        return res.status(status.OK).json({
            message: "Nearest upcoming event retrieved successfully",
            event
        });
    } catch (err) {
        return res.status(status.INTERNAL_SERVER_ERROR).json({
            message: err.message
        });
    }
};

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL,
        pass: process.env.PASSWORD
    }
});

exports.sendEventReminderEmails = async () => {
    try {
        const currentTime = new Date();
        const reminderTime = new Date(currentTime.getTime() + 24 * 60 * 60 * 1000);
        const events = await Event.find({ "notes.date": { $gte: currentTime, $lte: reminderTime } });

        if (events.length === 0) {
            console.log("No events scheduled for tomorrow.");
            return;
        }

        for (const event of events) {
            // Fetch users assigned to the event
            const users = await User.find({ event: event._id });

            if (users.length === 0) {
                console.log(`No users enrolled for event: ${event.title}`);
                continue;
            }

            for (const user of users) {
                const mailOptions = {
                    from: process.env.EMAIL,
                    to: user.email,
                    subject: `Reminder: Upcoming Event - ${event.title}`,
                    html: `
                        <!DOCTYPE html>
                        <html lang="en">
                        <head>
                            <meta charset="UTF-8">
                            <meta name="viewport" content="width=device-width, initial-scale=1.0">
                            <title>Event Reminder</title>
                            <style>
                                body { font-family: Arial, sans-serif; background-color: #f9f9f9; color: #333; margin: 0; padding: 0; }
                                .email-container { max-width: 600px; margin: 20px auto; background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1); }
                                .header { background-color: #4CAF50; color: white; text-align: center; padding: 20px; font-size: 20px; font-weight: bold; }
                                .content { padding: 20px; text-align: left; }
                                .content p { font-size: 16px; margin: 10px 0; }
                                .event-details { background-color: #f1f1f1; padding: 15px; border-radius: 5px; margin-top: 10px; }
                                .event-details strong { color: #4CAF50; }
                                .footer { background-color: #f1f1f1; text-align: center; padding: 10px; font-size: 14px; color: #555; }
                            </style>
                        </head>
                        <body>
                            <div class="email-container">
                                <div class="header">
                                    Reminder: Upcoming Event
                                </div>
                                <div class="content">
                                    <p>Dear <strong>${user.firstName}</strong>,</p>
                                    <p>This is a friendly reminder that you have an upcoming event.</p>
                                    <div class="event-details">
                                        <p><strong>Event:</strong> ${event.title}</p>
                                        <p><strong>Date:</strong> ${new Date(event.notes.date).toDateString()}</p>
                                        <p><strong>Time:</strong> ${event.notes.time}</p>
                                    </div>
                                    <p>We are excited to see you there! If you have any questions, feel free to contact us.</p>
                                    <p>For more details, visit our website <b>ShikshaCare</b></p>
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
                console.log(`Reminder email sent to ${user.email} for event: ${event.title}`);
            }
        }
    } catch (err) {
        console.error("Error sending reminder emails:", err);
    }
};