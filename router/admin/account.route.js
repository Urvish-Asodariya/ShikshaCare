const express = require("express");
const router = express.Router();
const accountControl = require("../../controller/admin/account.control");
const { auth, isadmin } = require("../../middleware/auth");
const { upload } = require("../../utils/CloudinaryConfig");

router.post("/login", auth, isadmin, accountControl.login);
router.get("/profile", auth, isadmin, accountControl.singleUser);
router.put("/update", auth, isadmin, upload.single('image'), accountControl.updateUser);
router.put("/changepass", auth, isadmin, accountControl.changepass)
router.delete("/logout", auth, isadmin, accountControl.logout)

module.exports = router;