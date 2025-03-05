const express = require("express");
const router = express.Router();
const eventCardControl = require("../../controller/admin/eventCard.control");
const { auth, isadmin } = require("../../middleware/auth");

router.get("/all", eventCardControl.allCards);
router.get("/single/:id", eventCardControl.singleCard);

module.exports = router;