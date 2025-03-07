const express = require("express");
const router = express.Router();
const userControl = require("../../controller/admin/user.control");
const { auth, isadmin } = require("../../middleware/auth");
const { upload } = require("../../utils/CloudinaryConfig");

router.post("/add", auth, isadmin, upload.single("image"), userControl.addUser);
router.get("/all", auth, isadmin, userControl.allUser);
router.get("/single/:id", auth, isadmin, userControl.singleUser);
router.put("/update/:id", auth, isadmin, upload.single("image"), userControl.updateUser);
router.delete("/delete/:id", auth, isadmin, userControl.deleteUser);
router.put("/status/:id", auth, isadmin, userControl.updateStatus);
router.get("/newuserchart", auth, isadmin, userControl.newUserChart);

module.exports = router;