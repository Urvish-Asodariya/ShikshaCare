const User = require("../../models/user.model");
const Event = require("../../models/events.model");
const eventCategory = require("../../models/eventCategory.model");
const bookCategory = require("../../models/bookCategory.model");
const courseCategory = require("../../models/courseCategory.model");
const Course = require("../../models/course.model");
const Instructor = require("../../models/instructor.model");
const Sells = require("../../models/sells.model");
const Payment = require("../../models/payment.model");
const Book = require("../../models/book.model");
const { status } = require("http-status");

exports.stock = async (req, res) => {
    try {
        const books = await Book.countDocuments();
        const course = await Course.countDocuments();
        return res.status(status.OK).json({
            message: "Stocks fetched successfully",
            book: books.length,
            course: course.length
        });
    }
    catch (err) {
        return res.status(status.INTERNAL_SERVER_ERROR).json({
            message: err.message
        });
    }
};

exports.userdata = async (req, res) => {
    try {
        const active = await User.aggregate([
            {
                $match: { status: "active" }
            }
        ]);
        const inactive = await User.aggregate([
            {
                $match: {
                    status: {
                        $in: ["inactive", "block"]
                    }
                }
            }
        ]);
        const newUsers = await User.aggregate([
            {
                $match: {
                    createdAt: {
                        $gte: new Date(new Date().setDate(new Date().getDate() - 7))
                    }
                }
            }
        ]);
        return res.status(status.OK).json({
            message: "Data fetched successfuly",
            newUsers: newUsers.length,
            activeUser: active.length,
            inactiveUser: inactive.length,
        });
    }
    catch (err) {
        return res.status(status.INTERNAL_SERVER_ERROR).json({
            message: err.message
        });
    }
};

exports.categorydata = async (req, res) => {
    try {
        const events = await eventCategory.aggregate([
            {
                $lookup: {
                    from: "events",
                    localField: "_id",
                    foreignField: "category",
                    as: "events"
                }
            },
            {
                $project: {
                    _id: 0,
                    name: 1,
                    totalProducts: { $size: "$events" }
                }
            }
        ]);
        const eventdata = events.map((item) => {
            const name = item.name
            const totalProducts = item.totalProducts
            return { name, totalProducts };
        })
        const courses = await courseCategory.aggregate([
            {
                $lookup: {
                    from: "courses",
                    localField: "_id",
                    foreignField: "category",
                    as: "courses"
                }
            },
            {
                $project: {
                    _id: 0,
                    name: 1,
                    totalProducts: { $size: "$courses" }
                }
            }
        ]);
        const coursedata = courses.map((item) => {
            const name = item.name
            const totalProducts = item.totalProducts
            return { name, totalProducts };
        })
        return res.status(status.OK).json({
            message: "Data fetched successfully",
            event: eventdata,
            course: coursedata
        });
    }
    catch (err) {
        return res.status(status.INTERNAL_SERVER_ERROR).json({
            message: err.message
        });
    }
};

exports.recentActivities = async (req, res) => {
    try {
        const recentUsers = await User.find({ role: "Student" }).sort({ createdAt: -1 }).limit(5);
        const recentBooks = await Book.find().sort({ createdAt: -1 }).limit(5);
        const recentEvents = await Event.find().sort({ createdAt: -1 }).limit(5);
        const recentCourses = await Course.find().sort({ createdAt: -1 }).limit(5);
        const activities = [
            ...recentUsers.map(user => ({
                type: "User",
                message: `New user registration: ${user.firstName} ${user.lastName}`,
                timestamp: new Date(user.createdAt)
            })),
            ...recentBooks.map(book => ({
                type: "Book",
                message: `New book added: "${book.title}"`,
                timestamp: new Date(book.createdAt)
            })),
            ...recentEvents.map(event => ({
                type: "Event",
                message: `New event scheduled: "${event.title}"`,
                timestamp: new Date(event.createdAt)
            })),
            ...recentCourses.map(course => ({
                type: "Course",
                message: `New course added: "${course.courseDetails.title}"`,
                timestamp: new Date(course.createdAt)
            }))
        ];
        activities.sort((a, b) => b.timestamp - a.timestamp);
        res.status(status.OK).json({
            message: "Recent activities fetched successfully",
            activities
        });
    } catch (err) {
        return res.status(status.INTERNAL_SERVER_ERROR).json({
            message: err.message
        });
    }
};

exports.cards = async (req, res) => {
    try {
        //dashboard
        const totalUser = await User.countDocuments({ role: "Student" });
        const totalBook = await Book.countDocuments();
        const totalEvent = await Event.countDocuments();
        const totalCourse = await Course.countDocuments();

        //course
        const courseCategories = await courseCategory.countDocuments();
        const newestCourse = await Course.findOne().sort({ createdAt: -1 }).select("courseDetails.title createdAt");
        const courseRevenue = await Sells.aggregate([
            { $match: { type: "Course" } },
            { $group: { _id: null, totalRevenue: { $sum: { $multiply: ["$price", "$quantity"] } } } }
        ]);

        //books
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
        const parsePublicationDate = (dateStr) => {
            const date = new Date(dateStr + " 01");
            return date;
        };
        const books = await Book.find({});
        const recentBooks = books.filter(book => {
            if (!book.details.publicationDate) return false;
            const pubDate = parsePublicationDate(book.details.publicationDate);
            return pubDate >= sixMonthsAgo;
        });
        const bookCategories = await bookCategory.countDocuments();
        const bookRevenue = await Sells.aggregate([
            { $match: { type: "Book" } },
            { $group: { _id: null, totalRevenue: { $sum: { $multiply: ["$price", "$quantity"] } } } }
        ]);

        //events
        const eventCategories = await eventCategory.countDocuments();
        const today = new Date();
        const next14Days = new Date();
        next14Days.setDate(today.getDate() + 14);
        const nextEvents = await Event.find({
            'notes.date': { $gte: today, $lte: next14Days }
        });
        const result = await Sells.aggregate([
            { $match: { type: "Event" } },
            { $group: { _id: null, totalRevenue: { $sum: { $multiply: ["$price", "$quantity"] } } } }
        ]);

        //instructor
        const totalApplication = await Instructor.countDocuments();
        const approvedApplication = await Instructor.find({
            $and: [
                { applicationStatus: "Approved" },
                { employMentStatus: "Unemployed" }
            ]
        });
        const rejectedApplication = await Instructor.find({ applicationStatus: "Rejected" });
        const Employee = await Instructor.find({
            $and: [
                { applicationStatus: "Approved" },
                {
                    $or: [
                        { employMentStatus: "Employed" },
                        { employMentStatus: "Freelancer" }
                    ]
                }
            ]
        });

        //user
        const active = await User.find({ status: "Active", role: "Student" });
        const inactive = await User.find({ status: { $in: ["Inactive", "Block"] }, role: "Student" });
        const newUsers = await User.find({
            createdAt: {
                $gte: new Date(new Date().setDate(new Date().getDate() - 7))
            }
        });

        //order
        const completedPayments = await Payment.find({ status: 'completed' });
        const totalRevenue = completedPayments.reduce((sum, payment) => sum + payment.price, 0);
        const totalOrders = completedPayments.length;
        const averageOrderValue = totalOrders > 0 ? (totalRevenue / totalOrders).toFixed(2) : 0;
        const allOrdersCount = await Payment.countDocuments();
        const conversionRate = allOrdersCount > 0 ? ((totalOrders / allOrdersCount) * 100).toFixed(2) : 0;

        return res.status(status.OK).json({
            message: "Data fetched successfully",
            data: {
                totalUser: totalUser,
                totalBook: totalBook,
                totalEvent: totalEvent,
                totalCourse: totalCourse,

                courseCategories: courseCategories,
                newestCourse: newestCourse,
                courseRevenue: courseRevenue[0]?.totalRevenue || 0,

                recentPublished: recentBooks.length,
                bookCategories: bookCategories,
                bookRevenue: bookRevenue[0]?.totalRevenue || 0,

                eventCategories: eventCategories,
                nextEvents: nextEvents.length,
                eventRevenue: result[0]?.totalRevenue || 0,

                totalApplication: totalApplication,
                approvedApplication: approvedApplication.length,
                rejectedApplication: rejectedApplication.length,
                Employee: Employee.length,

                activeUser: active.length,
                inactiveUser: inactive.length,
                newUsers: newUsers.length,

                totalRevenue: totalRevenue,
                totalOrders: totalOrders,
                averageOrderValue: parseInt(averageOrderValue),
                conversionRate: conversionRate
            }
        })
    }
    catch (err) {
        return res.status(status.INTERNAL_SERVER_ERROR).json({
            message: err.message
        });
    }
};

exports.growthChart = async (req, res) => {
    try {
        const fiveMonthsAgo = new Date();
        fiveMonthsAgo.setMonth(fiveMonthsAgo.getMonth() - 5);
        const sells = await Sells.aggregate([
            {
                $match: {
                    createdAt: { $gte: fiveMonthsAgo }
                }
            },
            {
                $group: {
                    _id: { $month: "$createdAt" },
                    total: { $sum: "$quantity" }
                }
            },
            {
                $sort: { _id: -1 }
            }
        ]);
        const months = ["", "Jan", "Feb", "Mar", "Apr", "May", "Jun",
            "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        sells.forEach((item) => {
            item.month = months[item._id];
        });
        if (sells.length === 0) {
            return res.status(status.NOT_FOUND).json({
                message: "No sales found"
            });
        }
        return res.status(status.OK).json({
            message: "Last 5 months' sales fetched successfully",
            data: sells
        });

    } catch (err) {
        return res.status(status.INTERNAL_SERVER_ERROR).json({
            message: err.message
        });
    }
};
