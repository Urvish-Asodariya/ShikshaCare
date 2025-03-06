const express = require("express");
const router = express.Router();
const instructorControl = require("../../controller/admin/instructor.control");
const { auth, isadmin } = require("../../middleware/auth");
const { upload } = require("../../utils/CloudinaryConfig");

router.post("/add", auth, isadmin, upload.single("resume"), instructorControl.addInstructor);
router.get("/all", auth, isadmin, instructorControl.allInstructors);
router.get("/single/:id", auth, isadmin, instructorControl.singleInstructor);
router.put("/applicationStatus/:id", auth, isadmin, instructorControl.updateapplicationStatus);
router.put("/employMentStatus/:id", auth, isadmin, instructorControl.updateemployMentStatus);
router.delete("/delete/:id", auth, isadmin, instructorControl.deleteInstructor);
router.get("/applicationchart", auth, isadmin, instructorControl.applicationChart);

module.exports = router;