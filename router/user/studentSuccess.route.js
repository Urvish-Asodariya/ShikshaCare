const express = require("express");
const router = express.Router();
const studentSuccessControl = require("../../controller/user/studentSuccess.control");
const { auth } = require("../../middleware/auth");
const { upload } = require("../../utils/CloudinaryConfig");

router.post("/add", auth, upload.single("image"), studentSuccessControl.addStudent);
router.get("/all", studentSuccessControl.allStudent);

module.exports = router;