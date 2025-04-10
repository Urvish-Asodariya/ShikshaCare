const express = require("express");
const router = express.Router();
const bookCardControl = require("../../controller/user/bookCard.control");

router.get("/all", bookCardControl.allBookCard);
router.get("/search", bookCardControl.searchCard);
router.get("/categoryitems", bookCardControl.categoryitem);
router.get("/categorybooks/:id", bookCardControl.categoryWiseCourse);

module.exports = router;