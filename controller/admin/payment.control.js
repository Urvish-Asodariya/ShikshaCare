const Payment = require("../../models/payment.model");
const Sell = require("../../models/sells.model");
const { status } = require("http-status");

exports.updateStatus = async (req, res) => {
    try {
        const orderId = req.params.orderId;
        const status = req.body.status;
        const payment = await Payment.findOne({ orderId: orderId });
        if (!payment) {
            return res.status(status.NOT_FOUND).json({
                message: "Payment not found"
            });
        }
        if (status !== "pending" && status !== "completed" && status !== "failed") {
            return res.status(status.BAD_REQUEST).json({
                message: "Invalid status"
            });
        }
        payment.status = status;
        await payment.save();
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

exports.allPayments = async (req, res) => {
    try {
        const payment = await Payment.find({ status: "completed" })
            .populate("user", "firstName lastName -_id")
            .populate("item")
            .sort({ createdAt: -1 }).limit(12);
        if (payment.length === 0) {
            return res.status(status.NOT_FOUND).json({
                message: "No payments found"
            });
        }
        res.status(status.OK).json({
            message: "All Payments Retrieved Successfully",
            payment: payment
        });
    } catch (err) {
        res.status(status.INTERNAL_SERVER_ERROR).json({
            message: err.message
        });
    }
};

exports.singleUserPayments = async (req, res) => {
    try {
        const id = req.params.id;
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

exports.singlePayment = async (req, res) => {
    try {
        const id = req.params.id;

        const payment = await Payment.findById(id).populate('item');
        if (!payment) {
            return res.status(404).json({ message: 'Payment not found' });
        }

        return res.status(200).json({
            message: 'Payment retrieved successfully',
            payment,
        });
    } catch (err) {
        return res.status(500).json({
            message: 'Error retrieving payment',
            error: err.message,
        });
    }
};

exports.lastFiveMonthsRevenue = async (req, res) => {
    try {
        const fiveMonthsAgo = new Date();
        fiveMonthsAgo.setMonth(fiveMonthsAgo.getMonth() - 5);

        const revenueData = await Payment.aggregate([
            {
                $match: {
                    createdAt: { $gte: fiveMonthsAgo },
                    status: "completed"
                }
            },
            {
                $group: {
                    _id: {
                        year: { $year: "$createdAt" },
                        monthNum: { $month: "$createdAt" },
                        monthName: { $dateToString: { format: "%B", date: "$createdAt" } }
                    },
                    totalRevenue: { $sum: "$price" }
                }
            },
            { $sort: { "_id.year": -1, "_id.monthNum": -1 } }
        ]);
        const formattedData = revenueData.map(item => ({
            month: item._id.monthName,
            year: item._id.year,
            totalRevenue: item.totalRevenue
        }));

        if (formattedData.length === 0) {
            return res.status(status.NOT_FOUND).json({
                message: "No revenue data found for the last 5 months"
            });
        }

        return res.status(status.OK).json({
            message: "Last 5 months' revenue fetched successfully",
            data: formattedData
        });

    } catch (err) {
        return res.status(status.INTERNAL_SERVER_ERROR).json({ message: err.message });
    }
};
