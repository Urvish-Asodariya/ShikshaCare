const express = require("express");
const router = express.Router();
const courseControl = require("../../controller/user/course.control");

router.get("/single/:id", courseControl.singleCourse);

module.exports = router;