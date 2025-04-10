const express = require("express");
const router = express.Router();
const eventCardControl = require("../../controller/user/eventCard.control");

router.get("/all", eventCardControl.allCards);
router.get("/nearest", eventCardControl.nearestEvent);
router.get("/search", eventCardControl.searchCard);
router.get("/categoryitems", eventCardControl.categoryitems);
router.get("/categoryevents/:id", eventCardControl.categoryWiseCourse);

module.exports = router;