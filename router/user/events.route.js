const express = require("express");
const router = express.Router();
const eventControl = require("../../controller/user/events.control");

router.get("/single/:id", eventControl.singleEvent);

module.exports = router;