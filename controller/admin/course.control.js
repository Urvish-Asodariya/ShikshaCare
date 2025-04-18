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
        // let updatedCourse;
        // try {
        //     updatedCourse = JSON.parse(req.body.data);
        // } catch (error) {
        //     return res.status(status.BAD_REQUEST).json({
        //         message: "Invalid data format"
        //     });
        // }
        // if (req.file) {
        //     updatedCourse.courseDetails.image = req.file.filename;
        // }
        const courseData = JSON.parse(req.body.data);
        if (req.file) {
            courseData.courseDetails.image = req.file.filename;
        } else {
            courseData.courseDetails.image = course.courseDetails.image;
        }
        const newCourse = await Course.findByIdAndUpdate(id, courseData, {
            new: true,
            runValidators: true
        });

        if (!newCourse) {
            return res.status(status.INTERNAL_SERVER_ERROR).json({
                message: "Failed to update course"
            });
        }
        const updatedFeatures = newCourse.features || {};
        await CourseCard.findOneAndUpdate(
            { course: id },
            {
                $set: {
                    "courseDetails.title": newCourse.courseDetails.title,
                    "courseDetails.instructor": newCourse.courseDetails.instructor,
                    "courseDetails.duration": newCourse.courseDetails.duration,
                    "courseDetails.level": newCourse.courseDetails.level,
                    "courseDetails.rating": newCourse.courseDetails.rating,
                    "courseDetails.description": newCourse.courseDetails.description,
                    "courseDetails.image": newCourse.courseDetails.image,
                    "courseDetails.price": newCourse.courseDetails.price,
                    features: updatedFeatures
                }
            },
            { new: true, runValidators: true }
        );

        return res.status(status.OK).json({
            message: "Course updated successfully",
            updatedCourse: newCourse
        });

    } catch (err) {
        return res.status(status.INTERNAL_SERVER_ERROR).json({
            message: err.message
        });
    }
};

exports.deleteCourse = async (req, res) => {
    try {
        const course = await Course.findById({ _id: req.params.id });
        if (!course) {
            return res.status(status.NOT_FOUND).json({
                message: "Course not found"
            });
        }
        await CourseCard.findOneAndDelete({ course: course._id })
        await Course.findByIdAndDelete({ _id: req.params.id });
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
        const fiveMonthsAgo = new Date();
        fiveMonthsAgo.setMonth(fiveMonthsAgo.getMonth() - 5);
        const sells = await Sell.aggregate([
            {
                $match: {
                    type: "Course",
                    createdAt: { $gte: fiveMonthsAgo }
                }
            },
            {
                $group: {
                    _id: { $month: "$createdAt" },
                    totalRevenue: { $sum: { $multiply: ["$quantity", "$price"] } }
                }
            },
            { $sort: { _id: -1 } }
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
            message: "Last 5 months' revenue fetched successfully",
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

exports.categoryItems = async (req, res) => {
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
                    _id: 1,
                    name: 1,
                    description: 1,
                    totalProducts: { $size: "$courses" }
                }
            }
        ]);
        const categoryProduct = results.map((item) => {
            const _id = item._id;
            const name = item.name;
            const description = item.description;
            const totalProducts = item.totalProducts
            return { _id, name, description, totalProducts };
        })
        return res.status(status.OK).json({
            message: "Categories wise data fetched successfully",
            data: categoryProduct
        });
    }
    catch (err) {
        return res.status(status.INTERNAL_SERVER_ERROR).json({
            message: err.message
        });
    }
};

exports.categoryWiseCourse = async (req, res) => {
    try {
        const results = await courseCategory.aggregate([
            {
                $match: { _id: new mongoose.Types.ObjectId(req.params.id) }
            },
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
                    courseName: "$courses.courseDetails.title"
                }
            }
        ]);

        const categoryProduct = results.map((item) => {
            return { courseName: item.courseName };
        });

        return res.status(status.OK).json({
            message: "Categories wise data fetched successfully",
            data: categoryProduct
        });

    } catch (err) {
        return res.status(status.INTERNAL_SERVER_ERROR).json({
            message: err.message
        });
    }
}