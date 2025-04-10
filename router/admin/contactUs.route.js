const express = require("express");
const router = express.Router();
const ContactUsControl = require("../../controller/admin/contactUs.control");
const { auth, isadmin } = require("../../middleware/auth");

router.post("/add", ContactUsControl.contactUs);
router.get("/all", ContactUsControl.allContactUs);
router.get("/single/:id", ContactUsControl.singleContactUs);
router.delete("/delete/:id", ContactUsControl.deleteContactUs);

module.exports = router;