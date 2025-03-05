const express = require("express");
const router = express.Router();
const studentSuccessControl = require("../../controller/admin/studentSuccess.control");
const { auth, isadmin } = require("../../middleware/auth");
const { upload } = require("../../utils/CloudinaryConfig");

router.post("/add", upload.single("image"), studentSuccessControl.addStudent);
router.get("/all", studentSuccessControl.allStudent);
router.get("/single/:id", studentSuccessControl.singleStudent);
router.put("/update/:id", upload.single("image"), studentSuccessControl.updateStudent);
router.delete("/delete/:id", studentSuccessControl.deleteStudent);

module.exports = router;