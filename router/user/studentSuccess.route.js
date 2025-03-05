const express = require("express");
const router = express.Router();
const studentSuccessControl = require("../../controller/user/studentSuccess.control");

router.get("/all", studentSuccessControl.allStudent);

module.exports = router;