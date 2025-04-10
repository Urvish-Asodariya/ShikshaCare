const express = require("express");
const router = express.Router();
const eventControl = require("../../controller/admin/events.control");
const { auth, isadmin } = require("../../middleware/auth");
const { upload } = require("../../utils/CloudinaryConfig");

router.post("/add", auth, isadmin, upload.single("image"), eventControl.addEvent);
router.get("/all", auth, isadmin, eventControl.allEvent);
router.get("/single/:id", auth, isadmin, eventControl.singleEvent);
router.put("/update/:id", auth, isadmin, upload.single("image"), eventControl.updateEvent);
router.delete("/delete/:id", auth, isadmin, eventControl.deleteEvent);
router.get("/enrollchart", auth, isadmin, eventControl.enrollChart);
router.get("/categorychart", auth, isadmin, eventControl.categoryChart);
router.get("/categoryitems",auth, isadmin, eventControl.categoryitems);


module.exports = router;