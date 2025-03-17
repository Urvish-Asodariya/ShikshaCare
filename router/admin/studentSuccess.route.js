const express = require("express");
const router = express.Router();
const studentSuccessControl = require("../../controller/admin/studentSuccess.control");
const { auth, isadmin } = require("../../middleware/auth");
const { upload } = require("../../utils/CloudinaryConfig");

router.post("/add", auth, isadmin, upload.single("image"), studentSuccessControl.addStudent);
router.get("/all", auth, isadmin, studentSuccessControl.allStudent);
router.get("/single/:id", studentSuccessControl.singleStudent);
router.put("/update/:id", auth, isadmin, upload.single("image"), studentSuccessControl.updateStudent);
router.delete("/delete/:id", auth, isadmin, studentSuccessControl.deleteStudent);

module.exports = router;