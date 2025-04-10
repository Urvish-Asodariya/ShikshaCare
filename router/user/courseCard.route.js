const express = require("express");
const router = express.Router();
const courseCardControl = require("../../controller/user/courseCard.control");

router.get("/all", courseCardControl.allCards);
router.get("/search", courseCardControl.searchCard);
router.get("/categoryitems", courseCardControl.categoryItems);
router.get("/categorycourses/:id", courseCardControl.categoryWiseCourse);

module.exports = router;