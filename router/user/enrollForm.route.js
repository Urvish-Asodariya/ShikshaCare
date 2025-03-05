const express = require("express");
const router = express.Router();
const enrollFormControl = require("../../controller/user/enrollForm.control");
const { auth, isUser } = require("../../middleware/auth");

router.post("/enroll/:id", enrollFormControl.enrollForm);
router.post("/verify-otp", enrollFormControl.otpCheck);

module.exports = router;