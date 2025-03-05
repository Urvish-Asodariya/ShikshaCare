const express = require("express");
const router = express.Router();
const bookCardControl = require("../../controller/admin/bookCard.control");
const { auth, isadmin } = require("../../middleware/auth");

router.get("/all",  bookCardControl.allBookCard);
router.get("/single/:id",  bookCardControl.singleBookCard);

module.exports = router;