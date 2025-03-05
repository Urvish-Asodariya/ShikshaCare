const express = require("express");
const router = express.Router();
const userControl = require("../../controller/user/user.control");
const { upload } = require("../../utils/CloudinaryConfig");

router.post("/register", upload.single("image"), userControl.register);
router.post("/login", userControl.login);
router.post("/resetlink", userControl.resetlink);
router.put("/newpass", userControl.newpass);


module.exports = router;