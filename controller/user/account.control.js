const bcrypt = require("bcryptjs");
const User = require("../../models/user.model");
const Book = require("../../models/book.model");
const Course = require("../../models/course.model");
const Event = require("../../models/events.model");
const { status } = require("http-status");
const { getFileUrl } = require("../../utils/CloudinaryConfig");

exports.userprofile = async (req, res) => {
    try {
        const id = req.user._id;
        const user = await User.findById(id);
        if (!user) {
            return res.status(status.NOT_FOUND).json({
                message: "User not found"
            })
        }
        user.image = getFileUrl(user.image);
        return res.status(status.OK).json({
            message: "User profile retrieved successfully",
            user: user
        });
    }
    catch (err) {
        return res.status(status.INTERNAL_SERVER_ERROR).json({
            message: err.message
        });
    }
};

exports.updateuser = async (req, res) => {
    try {
        const id = req.user._id;
        const user = await User.findById(id);
        if (!user) {
            return res.status(status.NOT_FOUND).json({
                message: "User not found"
            });
        }

        const updatedData = { ...req.body };
        console.log(updatedData);
        if (req.file) {
            updatedData.image = req.file.filename;
        }

        if (req.body.dateOfBirth) {
            const date = new Date(req.body.dateOfBirth);
            if (!isNaN(date.getTime())) {
                const day = String(date.getDate()).padStart(2, '0');
                const month = String(date.getMonth() + 1).padStart(2, '0');
                const year = date.getFullYear();
                updatedData.dateOfBirth = `${year}-${month}-${day}`;
            } else {
                return res.status(status.BAD_REQUEST).json({
                    message: "Invalid date format"
                });
            }
        } else {
            updatedData.dateOfBirth = user.dateOfBirth ? user.dateOfBirth : "-/-/-";
        }

        const updatedUser = await User.findByIdAndUpdate(id, updatedData, { new: true, runValidators: true });

        if (!updatedUser) {
            return res.status(status.NOT_FOUND).json({
                message: "User not updated"
            });
        }

        await updatedUser.save();

        return res.status(status.OK).json({
            message: "User updated",
            data: updatedUser
        });
    } catch (err) {
        return res.status(status.INTERNAL_SERVER_ERROR).json({
            message: err.message
        });
    }
};

exports.userBook = async (req, res) => {
    try {
        const userId = req.user._id;
        const user = await User.findById(userId).select("book");
        if (!user) {
            return res.status(status.NOT_FOUND).json({
                message: "No user found."
            });
        }
        const books = await Book.find({ _id: { $in: user.book } }).lean();
        if (books.length == 0) {
            return res.status(status.NOT_FOUND).json({
                message: "No books found for the user."
            });
        }
        books.forEach(book => {
            book.image = getFileUrl(book.image);
        });

        res.status(status.OK).json({
            message: "Books retrieved successfully",
            books
        });
    } catch (err) {
        return res.status(status.INTERNAL_SERVER_ERROR).json({
            message: err.message
        });
    }
};

exports.removeBook = async (req, res) => {
    try {
        const userId = req.user._id;
        const bookId = req.params.id;
        const user = await User.findOne({ _id: userId, book: bookId });
        if (!user) {
            return res.status(status.NOT_FOUND).json({
                message: "Book not found"
            });
        }
        user.book.splice(user.book.indexOf(bookId), 1);
        await user.save();
        return res.status(status.OK).json({
            message: "Book removed successfully"
        });
    }
    catch (err) {
        return res.status(status.INTERNAL_SERVER_ERROR).json({
            message: err.message
        });
    }
};

exports.userCourse = async (req, res) => {
    try {
        const userId = req.user._id;
        const user = await User.findById(userId).select("course");
        if (!user) {
            return res.status(status.NOT_FOUND).json({
                message: "No user found."
            });
        }
        const courses = await Course.find({ _id: { $in: user.course } }).lean();
        if (courses.length == 0) {
            return res.status(status.NOT_FOUND).json({
                message: "No courses found for the user."
            });
        }
        courses.forEach(course => {
            course.courseDetails.image = getFileUrl(course.courseDetails.image);
        });

        res.status(status.OK).json({
            message: "Courses retrieved successfully",
            courses
        });
    } catch (err) {
        return res.status(status.INTERNAL_SERVER_ERROR).json({
            message: err.message
        });
    }
};

exports.removeCourse = async (req, res) => {
    try {
        const userId = req.user._id;
        const courseId = req.params.id;
        const user = await User.findOne({ _id: userId, course: courseId });
        if (!user) {
            return res.status(status.NOT_FOUND).json({
                message: "Course not found"
            });
        }
        user.course.splice(user.course.indexOf(courseId), 1);
        await user.save();
        return res.status(status.OK).json({
            message: "Course removed successfully"
        });
    }
    catch (err) {
        return res.status(status.INTERNAL_SERVER_ERROR).json({
            message: err.message
        });
    }
};

exports.userEvent = async (req, res) => {
    try {
        const userId = req.user._id;
        const user = await User.findById(userId).select("event");
        if (!user) {
            return res.status(status.NOT_FOUND).json({
                message: "No user found."
            });
        }
        const events = await Event.find({ _id: { $in: user.event } }).lean();
        if (events.length == 0) {
            return res.status(status.NOT_FOUND).json({
                message: "No events found for the user."
            });
        }
        events.forEach(event => {
            event.image = getFileUrl(event.image);
        });

        res.status(status.OK).json({
            message: "Events retrieved successfully",
            events
        });
    } catch (err) {
        return res.status(status.INTERNAL_SERVER_ERROR).json({
            message: err.message
        });
    }
};

exports.removeEvent = async (req, res) => {
    try {
        const userId = req.user._id;
        const eventId = req.params.id;
        const user = await User.findOne({ _id: userId, event: eventId });
        if (!user) {
            return res.status(status.NOT_FOUND).json({
                message: "Event not found"
            });
        }
        user.event.splice(user.event.indexOf(eventId), 1);
        await user.save();
        return res.status(status.OK).json({
            message: "Course removed successfully"
        });
    }
    catch (err) {
        return res.status(status.INTERNAL_SERVER_ERROR).json({
            message: err.message
        });
    }
};

exports.changepass = async (req, res) => {
    try {
        const { oldpass, newpass, confirmpass } = req.body;
        const id = req.user._id;
        const user = await User.findById(id);
        if (!user) {
            return res.status(status.NOT_FOUND).json({
                message: "User not found"
            });
        }
        const isValidPassword = await bcrypt.compare(oldpass, user.password);
        if (!isValidPassword) {
            return res.status(status.UNAUTHORIZED).json({
                message: "Old password is incorrect"
            })
        }
        if (newpass !== confirmpass) {
            return res.status(status.BAD_REQUEST).json({
                message: "Password and confirm password do not match"
            });
        }
        const hashedPassword = await bcrypt.hash(newpass, 10);
        user.password = hashedPassword;
        await user.save();
        return res.status(status.OK).json({
            message: "Password updated successfully"
        });
    }
    catch (err) {
        return res.status(status.INTERNAL_SERVER_ERROR).json({
            message: err.message
        });
    }
};

exports.logout = async (req, res) => {
    try {
        res.clearCookie("TOKEN", {
            httpOnly: true,
            secure: true,
            sameSite: "strict"
        });
        return res.status(status.OK).json({
            message: "Logged out successfully"
        });
    }
    catch (err) {
        return res.status(status.INTERNAL_SERVER_ERROR).json({
            message: err.message
        });
    }
};

exports.mobileVerify = async (req, res) => {
    try {
        const id = req.user._id;
        const user = await User.findById({ _id: id });
        if (!user) {
            return res.status(status.NOT_FOUND).json({
                message: "User not found"
            });
        }
        if (!user.mobileVerified) {
            return res.status(status.BAD_REQUEST).json({
                message: "Mobile number not verified"
            });
        }
        return res.status(status.OK).json({
            message: "Mobile number verification already done",
            status: 200
        });
    }
    catch (err) {
        return res.status(status.INTERNAL_SERVER_ERROR).json({
            message: err.message
        });
    }
}