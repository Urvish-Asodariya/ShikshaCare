const express = require("express");
const router = express.Router();
const bookControl = require("../../controller/user/book.control");

router.get("/single/:id", bookControl.singleBook);

module.exports = router;