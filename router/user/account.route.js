const express = require("express");
const router = express.Router();
const accountControl = require("../../controller/user/account.control");
const { auth, isUser } = require("../../middleware/auth");
const { upload } = require("../../utils/CloudinaryConfig");

router.get("/profile", auth, isUser, accountControl.userprofile);
router.put("/update", auth, isUser, upload.single("image"), accountControl.updateuser);
router.get("/course", auth, isUser, accountControl.userCourse);
router.delete("/removecourse/:id", auth, isUser, accountControl.removeCourse);
router.get("/book", auth, isUser, accountControl.userBook);
router.delete("/removebook/:id", auth, isUser, accountControl.removeBook);
router.get("/event", auth, isUser, accountControl.userEvent);
router.delete("/removeevent/:id", auth, isUser, accountControl.removeEvent);
router.put("/changepass", auth, isUser, accountControl.changepass);
router.put("/logout", auth, isUser, accountControl.logout);

module.exports = router;