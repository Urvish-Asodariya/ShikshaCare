const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const Sells = require("../models/sells.model");
const Payment = require("../models/payment.model");
const User = require("../models/user.model");
const Course = require("../models/course.model");
const Book = require("../models/book.model");
const Event = require("../models/events.model");
const Enrollform = require("../models/enrollForm.model")
const nodemailer = require("nodemailer");

const sendSuccessEmail = async (userEmail, type, details) => {
    try {
        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.EMAIL,
                pass: process.env.PASSWORD
            }
        });

        const emailTemplates = {
            Course: {
                subject: "🎉 Course Enrollment Successful!",
                message: `Congratulations! You have successfully enrolled in <strong>${details.name}</strong>. Start your learning journey now!`
            },
            Book: {
                subject: "📚 Book Purchase Confirmation",
                message: `Your purchase of the book <strong>${details.name}</strong> has been confirmed. Happy reading!`
            },
            Event: {
                subject: "🎟️ Event Registration Confirmed!",
                message: `You are successfully registered for the event <strong>${details.name}</strong>.<br><br>
                📅 <strong>Date:</strong> ${details.date}<br>
                🕒 <strong>Time:</strong> ${details.time}<br><br>
                We look forward to seeing you there!`
            }
        };

        if (!emailTemplates[type]) {
            throw new Error("Invalid email type.");
        }

        const { subject, message } = emailTemplates[type];

        const mailOptions = {
            from: process.env.EMAIL,
            to: userEmail,
            subject,
            html: `<!DOCTYPE html>
                   <html lang="en">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${subject}</title>
</head>
<body style="font-family: Arial, sans-serif; background-color: #f9f9f9; color: #333; margin: 0; padding: 0;">
    <div style="max-width: 600px; margin: 20px auto; background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);">
        <div style="background-color: #4CAF50; color: white; text-align: center; padding: 20px; font-size: 20px; font-weight: bold;">
            ${subject}
        </div>
        <div style="padding: 20px; text-align: left;">
            <p style="font-size: 16px; margin: 10px 0;">Hello,</p>
            <p style="font-size: 16px; margin: 10px 0;">${message}</p>
            <p style="font-size: 16px; margin: 10px 0;">Thank you for choosing ShikshaCare!</p>
        </div>
        <div style="background-color: #f1f1f1; text-align: center; padding: 10px; font-size: 14px; color: #555;">
            &copy; 2025 ShikshaCare. All rights reserved.
        </div>
    </div>
</body>
</html>`
        };

        await transporter.sendMail(mailOptions);
        console.log("Success email sent successfully!");
    } catch (error) {
        console.error("Error sending success email:", error);
    }
};

router.post('/razorpay-webhook', async (req, res) => {
    try {
        const secret = 'ShikshaCare';

        // Verify webhook signature
        const shasum = crypto.createHmac('sha256', secret)
            .update(JSON.stringify(req.body))
            .digest('hex');

        if (shasum !== req.headers['x-razorpay-signature']) {
            return res.status(400).json({ success: false, message: 'Invalid signature' });
        }

        const event = req.body.event;
        const payload = req.body.payload;


        if (event === 'payment.captured') {
            const orderId = payload.payment.entity.order_id;


            // Find payment record
            const paymentRecord = await Payment.findOne({ orderId });
            if (!paymentRecord) {
                return res.status(404).json({ success: false, message: 'Payment record not found' });
            }

            // Find user by payment record
            const user = await User.findById(paymentRecord.user);
            if (!user) {
                return res.status(404).json({ success: false, message: 'User not found for this order' });
            }

            //  Update Payment Status
            paymentRecord.status = "completed";
            await paymentRecord.save();

            const { item, itemType, price } = paymentRecord;
            let field = null;
            let itemName = '';
            let emailDetails = {};

            //  Find the purchased item
            if (itemType === "Course") {
                const course = await Course.findById(item);
                if (course) {
                    itemName = course.courseDetails.title;
                    field = "course";
                    emailDetails = { name: itemName };
                }
            } else if (itemType === "Event") {
                const event = await Event.findById(item);
                if (event) {
                    itemName = event.title;
                    field = "event";
                    const date = new Intl.DateTimeFormat('en-GB', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric'
                    }).format(new Date(event.notes?.date));
                    const time = event.notes?.time || "TBA";
                    emailDetails = { name: itemName, date, time };
                }
            } else if (itemType === "Book") {
                const book = await Book.findById(item);
                if (book) {
                    itemName = book.title;
                    field = "book";
                    emailDetails = { name: itemName };
                }
            }

            //  Update User's Purchased Items
            if (field && !user[field].includes(item)) {
                user[field].push(item);
                await user.save();
            }

            const existingSell = await Sells.findOne({ name: itemName });
            if (!existingSell) {
                await new Sells({
                    name: itemName,
                    quantity: 1,
                    type: itemType,
                    price: price,
                    item: item
                }).save();
            } else {
                await Sells.findByIdAndUpdate(
                    existingSell._id,
                    { $inc: { quantity: 1 } },
                    { new: true, runValidators: true }
                );
            }

            await sendSuccessEmail(user.email, itemType, emailDetails);
            return res.status(200).json({ success: true, message: 'Payment successful, user updated' });
        }

    } catch (error) {
        console.error(' Error processing webhook:', error);
        return res.status(500).json({ success: false, message: 'Webhook processing failed' });
    }
});

module.exports = router;
