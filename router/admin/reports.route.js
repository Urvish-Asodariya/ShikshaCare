const express = require("express");
const router = express.Router();
const reportControl = require("../../controller/admin/reports.control");
const { auth, isadmin } = require("../../middleware/auth");

router.get("/stock", auth, isadmin, reportControl.stock);
router.get("/userdata", auth, isadmin, reportControl.userdata);
router.get("/categorydata", auth, isadmin, reportControl.categorydata);
router.get("/recent-activities", auth, isadmin, reportControl.recentActivities);
router.get("/cards", auth, isadmin, reportControl.cards);
router.get("/growthchart", auth, isadmin, reportControl.growthChart)

module.exports = router;