const express = require("express");
const router = express.Router();
const courseControl = require("../../controller/admin/course.control");
const { auth, isadmin } = require("../../middleware/auth");
const { upload } = require("../../utils/CloudinaryConfig");

router.post("/add", upload.single("image"), courseControl.addCourse);
router.get("/all", auth, isadmin, courseControl.allCourse);
router.get("/single/:id", auth, isadmin, courseControl.singleCourse);
router.put("/update/:id", auth, isadmin, upload.single("image"), courseControl.updateCourse);
router.delete("/delete/:id", auth, isadmin, courseControl.deleteCourse);
router.get("/enrollchart", auth, isadmin, courseControl.enrollChart);
router.get("/categorychart", auth, isadmin, courseControl.categoryChart);


module.exports = router;