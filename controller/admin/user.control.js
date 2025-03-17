const bcrypt = require("bcryptjs");
const User = require("../../models/user.model");
const Book = require("../../models/book.model");
const Event = require('../../models/events.model');
const Course = require("../../models/course.model");
const { status } = require("http-status");
const { getFileUrl } = require("../../utils/CloudinaryConfig");
const validator = require("validator");

exports.addUser = async (req, res) => {
    try {
        const { firstName, lastName, email, password, dateOfBirth, mobileNumber, gender, city, state, joiningDate } = req.body;
        if (!validator.isEmail(email)) {
            return res.status(status.BAD_REQUEST).json({
                message: "Invalid email format"
            });
        }
        if (email) {
            const existingUser = await User.findOne({ email });
            if (existingUser) {
                return res.status(status.BAD_REQUEST).json({
                    message: "Email already exists"
                });
            }
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        let joiningdate;
        if (!joiningDate) {
            const date = new Date();
            const day = String(date.getDate()).padStart(2, '0');
            const month = String(date.getMonth() + 1);
            const year = date.getFullYear();
            const formattedDate = `${day}-${month}-${year}`;
            joiningdate = formattedDate
        }
        joiningdate = joiningDate;
        const publicId = req.file?.filename || null;
        const user = new User({ firstName, lastName, email, password: hashedPassword, dateOfBirth, mobileNumber, gender, image: publicId, city, state, joiningdate, batch: year });
        await user.save();
        return res.status(status.OK).json({
            message: "User created successfully"
        });
    }
    catch (err) {
        console.log(err)
        return res.status(status.INTERNAL_SERVER_ERROR).json({
            message: err.message,
        });
    }
};

exports.allUser = async (req, res) => {
    try {
        const users = await User.find({ role: "Student" }).sort({ createdAt: -1 });
        if (users.length == 0) {
            return res.status(status.NOT_FOUND).json({
                message: "No user found"
            });
        }
        users.map(user => {
            user.image = getFileUrl(user.image);
        });
        return res.status(status.OK).json({
            message: "Users found successfully",
            users: users
        });
    }
    catch (err) {
        return res.status(status.INTERNAL_SERVER_ERROR).json({
            message: err.message
        });
    }
};

exports.singleUser = async (req, res) => {
    try {
        const id = req.params.id;
        const user = await User.findById(id);
        if (!user) {
            return res.status(status.NOT_FOUND).json({
                message: "User not found"
            })
        }
        user.image = getFileUrl(user.image);
        let bookName = [];
        let courseName = [];
        let eventName = [];
        const books = await Promise.all(user.book.map(async (item) => {
            const book = await Book.findById(item);
            return book ? book.title : null;
        }));
        bookName = books.filter(title => title !== null);
        const courses = await Promise.all(user.course.map(async (item) => {
            const course = await Course.findById(item);
            return course ? course.courseDetails.title : null;
        }));
        courseName = courses.filter(title => title !== null);
        const events = await Promise.all(user.event.map(async (item) => {
            const event = await Event.findById(item);
            return event ? event.title : null;
        }));
        eventName = events.filter(title => title !== null);

        return res.status(status.OK).json({
            message: "User profile retrieved successfully",
            user: user,
            book: bookName,
            course: courseName,
            event: eventName
        });
    }
    catch (err) {
        return res.status(status.INTERNAL_SERVER_ERROR).json({
            message: err.message
        });
    }
};

exports.updateUser = async (req, res) => {
    try {
        const id = req.params.id;
        const updatedData = { ...req.body };
        if (req.file) {
            updatedData.image = req.file.filename;
        }
        const updatedusers = await User.findByIdAndUpdate(id, updatedData, { new: true, runValidators: true });
        if (!updatedusers) {
            return res.status(status.NOT_FOUND).json({
                message: "User not found"
            });
        }
        await updatedusers.save();
        return res.status(status.OK).json({
            message: "User updated",
            data: updatedusers
        });
    }
    catch (err) {
        return res.status(status.INTERNAL_SERVER_ERROR).json({
            message: err.message
        });
    }
};

exports.deleteUser = async (req, res) => {
    try {
        const id = req.params.id;
        const user = await User.findByIdAndDelete(id);
        if (!user) {
            return res.status(status.NOT_FOUND).json({
                message: "User not found"
            });
        }
        return res.status(status.OK).json({
            message: "User deleted successfully"
        });
    }
    catch (err) {
        return res.status(status.INTERNAL_SERVER_ERROR).json({
            message: err.message
        });
    }
};

exports.newUserChart = async (req, res) => {
    try {
        const fiveMonthsAgo = new Date();
        fiveMonthsAgo.setMonth(fiveMonthsAgo.getMonth() - 5);
        const newUsers = await User.aggregate([
            {
                $match: {
                    createdAt: { $gte: fiveMonthsAgo } 
                }
            },
            {
                $group: {
                    _id: { $month: "$createdAt" }, 
                    totalUsers: { $sum: 1 } 
                }
            },
            { $sort: { _id: -1 } } 
        ]);
        const months = ["", "Jan", "Feb", "Mar", "Apr", "May", "Jun",
            "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        newUsers.forEach((item) => {
            item.month = months[item._id]; 
        });
        if (newUsers.length === 0) {
            return res.status(status.NOT_FOUND).json({
                message: "No users found"
            });
        }

        return res.status(status.OK).json({
            message: "Last 5 months' user data fetched successfully",
            data: newUsers
        });

    } catch (err) {
        return res.status(status.INTERNAL_SERVER_ERROR).json({
            message: err.message
        });
    }
};

exports.updateStatus = async (req, res) => {
    try {
        const user = await User.findByIdAndUpdate(req.params.id, { $set: { status: req.query.status } }, { new: true, runValidators: true });
        if (!user) {
            return res.status(status.NOT_FOUND).json({
                message: "User not found"
            });
        }
        return res.status(status.OK).json({
            message: "User status updated successfully"
        });
    }
    catch (err) {
        return res.status(status.INTERNAL_SERVER_ERROR).json({
            message: err.message
        });
    }
};