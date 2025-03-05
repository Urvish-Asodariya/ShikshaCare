const express = require("express");
const router = express.Router();
const bookCardControl = require("../../controller/user/bookCard.control");

router.get("/all", bookCardControl.allBookCard);

module.exports = router;