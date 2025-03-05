const express = require("express");
const router = express.Router();
const userReviewControl = require("../../controller/user/userReview.control");
const { auth, isUser } = require("../../middleware/auth");

router.post("/add/:bookId", auth, isUser, userReviewControl.addReview);
router.get("/all/:bookId", userReviewControl.allReview);

module.exports = router;