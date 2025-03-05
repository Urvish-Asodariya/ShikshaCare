const express = require("express");
const router = express.Router();
const paymentControl = require("../../controller/user/payment.control");
const { auth, isUser } = require("../../middleware/auth");

router.post("/bill/:id", auth, isUser, paymentControl.billing);
router.put("/update/:orderId", auth, paymentControl.updateStatus);
router.get("/user", auth, paymentControl.singleUserPayments);

module.exports = router;
