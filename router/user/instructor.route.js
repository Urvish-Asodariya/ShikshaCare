const express = require("express");
const router = express.Router();
const instructorControl = require("../../controller/user/instructor.control");
const { upload } = require("../../utils/CloudinaryConfig");
const { auth, isUser } = require("../../middleware/auth");

router.post("/add", auth, isUser, upload.single("resume"), instructorControl.addInstructor);

module.exports = router;