const express = require("express");
const router = express.Router();
const ContactUsControl = require("../../controller/user/contactUs.control");

router.post("/add", ContactUsControl.contactUs);

module.exports = router;