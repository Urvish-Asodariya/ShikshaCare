const express = require("express");
const router = express.Router();
const courseCardControl = require("../../controller/admin/courseCard.control");
const { auth, isadmin } = require("../../middleware/auth");

router.get("/all",  courseCardControl.allCards);
router.get("/single/:id",  courseCardControl.singleCard);

module.exports = router;