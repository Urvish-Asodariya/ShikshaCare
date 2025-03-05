const express = require("express");
const router = express.Router();
const accountControl = require("../../controller/admin/account.control");
const { auth, isadmin } = require("../../middleware/auth");

router.post("/login", accountControl.login);
router.get("/single/:id", accountControl.singleUser);
router.put("/update/:id", accountControl.updateUser);

module.exports = router;