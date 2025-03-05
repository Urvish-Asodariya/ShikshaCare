const express = require("express");
const router = express.Router();
const userReviewControl = require("../../controller/admin/userReview.control");
const { auth, isadmin } = require("../../middleware/auth");

router.post("/add/:bookId", auth, isadmin, userReviewControl.addReview);
router.get("/all", auth, isadmin, userReviewControl.allReview);
router.get("/all/:bookId", auth, isadmin, userReviewControl.bookReview);
router.get("/single/:id", auth, isadmin, userReviewControl.singleReview);
router.put("/update/:id", auth, isadmin, userReviewControl.updateReview);
router.delete("/delete/:id", auth, isadmin, userReviewControl.deleteReview);

module.exports = router;