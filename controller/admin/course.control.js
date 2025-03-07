const Course = require("../../models/course.model");
const CourseCard = require("../../models/courseCard.model");
const Sell = require("../../models/sells.model");
const { status } = require("http-status");
const { getFileUrl } = require("../../utils/CloudinaryConfig");
const courseCategory = require("../../models/courseCategory.model");

exports.addCourse = async (req, res) => {
    try {
        const courseData = JSON.parse(req.body.data);
        const { courseDetails, curriculum, features, category } = courseData;
        const Category = await courseCategory.findOne({ name: category });
        if (!Category) {
            return res.status(status.NOT_FOUND).json({ message: "Category not found" });
        }
        courseDetails.rating = parseInt(courseDetails.rating);
        courseDetails.image = req.file ? req.file.filename : null;
        const course = new Course({ courseDetails, curriculum, features, category: Category._id });
        await course.save();
        const courseCard = new CourseCard({ courseDetails: courseDetails, features: features, course: course._id });
        await courseCard.save();
        return res.status(status.OK).json({
            message: "Course added successfully"
        });
    }
    catch (err) {
        console.log(err);
        return res.status(status.INTERNAL_SERVER_ERROR).json({
            message: err.message
        });
    }
};

exports.allCourse = async (req, res) => {
    try {
        const courses = await Course.find().populate("category");
        if (courses.length == 0) {
            return res.status(status.NOT_FOUND).json({
                message: "No course found"
            });
        }
        courses.map(course => {
            course.courseDetails.image = getFileUrl(course.courseDetails.image);
        });
        return res.status(status.OK).json({
            message: "Courses retrieved successfully",
            courses: courses
        });
    }
    catch (err) {
        return res.status(status.INTERNAL_SERVER_ERROR).json({
            message: err.message
        });
    }
};

exports.singleCourse = async (req, res) => {
    try {
        const id = req.params.id;
        const course = await Course.findById(id);
        if (!course) {
            return res.status(status.NOT_FOUND).json({
                message: "Course not found"
            });
        }
        course.courseDetails.image = getFileUrl(course.courseDetails.image);
        return res.status(status.OK).json({
            message: "Course retrieved successfully",
            course: course
        });
    }
    catch (err) {
        return res.status(status.INTERNAL_SERVER_ERROR).json({
            message: err.message
        });
    }
};

exports.updateCourse = async (req, res) => {
    try {
        const id = req.params.id;
        const course = await Course.findById(id);
        if (!course) {
            return res.status(status.NOT_FOUND).json({
                message: "Course not found"
            });
        }
        const updatedCourse = JSON.parse(req.body.data);
        if (req.file) {
            updatedCourse.courseDetails.image = req.file.filename;
        }
        await Course.findByIdAndUpdate(id, updatedCourse, { new: true, runValidators: true });
        return res.status(status.OK).json({
            message: "Course updated successfully",
        });
    }
    catch (err) {
        return res.status(status.INTERNAL_SERVER_ERROR).json({
            message: err.message
        });
    }
};

exports.deleteCourse = async (req, res) => {
    try {
        const id = req.params.id;
        const course = await Course.findById(id);
        if (!course) {
            return res.status(status.NOT_FOUND).json({
                message: "Course not found"
            });
        }
        await Course.findByIdAndDelete(id);
        await CourseCard.findOneAndDelete({ course: id })
        return res.status(status.OK).json({
            message: "Course deleted successfully"
        });
    }
    catch (err) {
        return res.status(status.INTERNAL_SERVER_ERROR).json({
            message: err.message
        });
    };
}

exports.enrollChart = async (req, res) => {
    try {
        const sells = await Sell.aggregate([
            { $match: { type: "Course" } },
            {
                $group: {
                    _id: { $month: "$createdAt" },
                    total: { $sum: "$quantity" }
                }
            },
            {
                $sort: { _id: -1 }
            },
            {
                $limit: 6,
            },
            // {
            //     $skip: 1
            // }
        ]);
        sells.map((item) => {
            const months = ["", "Jan", "Feb", "Mar", "Apr", "May", "Jun",
                "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
            item._id = months[item._id];
        })
        if (sells === 0) {
            return res.status(status.NOT_FOUND).json({
                message: "No sales found"
            });
        }
        return res.status(status.OK).json({
            message: "Last 5 month sales fetched successfully",
            data: sells
        });
    } catch (err) {
        return res.status(status.INTERNAL_SERVER_ERROR).json({
            message: err.message
        });
    }
};

exports.categoryChart = async (req, res) => {
    try {
        const results = await courseCategory.aggregate([
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
        const categoryProduct = results.map((item) => {
            const name = item.name
            const totalProducts = item.totalProducts
            return { name, totalProducts };
        })
        return res.status(status.OK).json({
            message: "Chartdata fetched successfully",
            data: categoryProduct
        });
    }
    catch (err) {
        return res.status(status.INTERNAL_SERVER_ERROR).json({
            message: err.message
        });
    }
};