const express = require("express");
const router = express.Router();
const paymentControl = require("../../controller/admin/payment.control");
const { auth, isadmin } = require("../../middleware/auth");

router.put("/update/:orderId", auth, isadmin, paymentControl.updateStatus);
router.get("/all", auth, isadmin, paymentControl.allPayments);
router.get("/single/:id", auth, isadmin, paymentControl.singlePayment);
router.get("/user/:id", auth, isadmin, paymentControl.singleUserPayments);
router.get("/orderchart", auth, isadmin, paymentControl.lastFiveMonthsRevenue)

module.exports = router;
