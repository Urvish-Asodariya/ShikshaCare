const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const Sells = require("../models/sells.model");
const Payment = require("../models/payment.model");
const User = require("../models/user.model");
const Course = require("../models/course.model");
const Book = require("../models/book.model");
const Event = require("../models/events.model");

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

            console.log('🔍 Searching for Payment with Order ID:', orderId);

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

            //  Find the purchased item
            if (itemType === "Course") {
                const course = await Course.findById(item);
                if (course) {
                    itemName = course.courseDetails.title;
                    field = "course";
                }
            } else if (itemType === "Event") {
                const event = await Event.findById(item);
                if (event) {
                    itemName = event.title;
                    field = "event";
                }
            } else if (itemType === "Book") {
                const book = await Book.findById(item);
                if (book) {
                    itemName = book.title;
                    field = "book";
                }
            }

            //  Update User's Purchased Items
            if (field && !user[field].includes(item)) {
                user[field].push(item);
                await user.save();
            }

            //  Update Sell Records
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
                console.log(' Sell record updated');
            }

            return res.status(200).json({ success: true, message: 'Payment successful, user updated' });
        }

    } catch (error) {
        console.error(' Error processing webhook:', error);
        return res.status(500).json({ success: false, message: 'Webhook processing failed' });
    }
});

module.exports = router;
