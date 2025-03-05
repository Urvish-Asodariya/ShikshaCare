const express = require("express");
const router = express.Router();
const courseCardControl = require("../../controller/user/courseCard.control");

router.get("/all", courseCardControl.allCards);

module.exports = router;