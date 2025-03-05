const express = require("express");
const router = express.Router();
const eventCardControl = require("../../controller/user/eventCard.control");

router.get("/all", eventCardControl.allCards);
router.get("/nearest", eventCardControl.nearestEvent);

module.exports = router;