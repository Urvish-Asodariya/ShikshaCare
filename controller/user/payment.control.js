const PaymentModel = require("../../models/payment.model");
const User = require("../../models/user.model");
const Event = require("../../models/events.model");
const Course = require("../../models/course.model");
const Enrollform = require("../../models/enrollForm.model");
const Book = require("../../models/book.model");
const { payment } = require("../../utils/payment");
const { status } = require("http-status");

exports.billing = async (req, res) => {
    try {
        const userId = req.user._id;
        const quantity = req.body.quantity || 1;
        const id = req.params.id;
        const user = await User.findById({ _id: userId });
        if (!user) {
            return res.status(status.NOT_FOUND).json({
                message: "User not found"
            });
        }
        if (user.course.includes(id) || user.event.includes(id) || user.book.includes(id)) {
            return res.status(400).json({ message: "Item already exists in your purchased list" });
        }
        let itemName, itemType, price;
        let field = null;
        const course = await Course.findById(id);
        const book = await Book.findById(id);
        const event = await Event.findById(id);
        if (course) {
            itemName = course.courseDetails.title;
            itemType = "Course";
            price = course.courseDetails.price;
            field = "course";
        } else if (event) {
            itemName = event.title;
            itemType = "Event";
            price = event.price;
            field = "event";
        } else if (book) {
            itemName = book.title;
            itemType = "Book";
            price = book.pricing.price;
            field = "book";
        } else {
            return res.status(status.NOT_FOUND).json({
                message: "Item not found"
            });
        }
        const paymentData = await payment({
            username: user.firstName,
            email: user.email,
            product: itemName,
            quantity,
            amount: price
        });
        if (!paymentData.orderId) {
            return res.status(status.BAD_REQUEST).json({
                message: "Payment Order creation failed"
            });
        }
        user.orderId = paymentData.orderId;
        await user.save();
        const newPayment = new PaymentModel({
            user: userId,
            item: id,
            itemType,
            price,
            orderId: paymentData.orderId,
            status: "pending"
        });
        await newPayment.save();
        res.status(status.OK).json({
            message: "Payment order created successfully",
            paymentResponse: paymentData
        });
    } catch (err) {
        res.status(status.INTERNAL_SERVER_ERROR).json({
            message: err.message
        });
    }
};

exports.updateStatus = async (req, res) => {
    try {
        const userId = req.user._id;
        const orderId = req.params.orderId;
        const user = await User.findById({ _id: userId });
        if (!user) {
            return res.status(status.NOT_FOUND).json({
                message: "User not found"
            });
        }
        const payment = await Payment.findOne({ orderId: orderId });
        if (!payment) {
            return res.status(status.NOT_FOUND).json({
                message: "Payment not found"
            });
        }
        payment.status = "completed";
        await payment.save();
        const enroll = await Enrollform.findOne({ email: user.email });
        if (!enroll) {
            return res.status(status.NOT_FOUND).json({
                message: "Enroll form not found"
            });
        }
        enroll.status = "Approved";
        await enroll.save();
        res.status(status.OK).json({
            message: "Payment status updated successfully"
        });
    }
    catch (err) {
        res.status(status.INTERNAL_SERVER_ERROR).json({
            message: err.message
        });
    }
};

exports.singleUserPayments = async (req, res) => {
    try {
        const id = req.user._id;
        const payments = await Payment.find({ user: id }).populate('item');
        if (payment.length == 0) {
            return res.status(status.NOT_FOUND).json({
                message: "No payments found"
            });
        }
        return res.status(200).json({
            message: 'Payments retrieved successfully',
            payments,
        });
    } catch (err) {
        return res.status(500).json({
            message: 'Error retrieving payments',
            error: err.message,
        });
    }
};