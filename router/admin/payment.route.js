const express = require("express");
const router = express.Router();
const paymentControl = require("../../controller/admin/payment.control");
const { auth, isadmin } = require("../../middleware/auth");

router.put("/update/:orderId",  paymentControl.updateStatus);
router.get("/all",  paymentControl.allPayments);
router.get("/single/:id",  paymentControl.singlePayment);
router.get("/user/:id",  paymentControl.singleUserPayments);

module.exports = router;
