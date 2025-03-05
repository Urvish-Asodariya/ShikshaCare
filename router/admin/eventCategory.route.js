const express = require("express");
const router = express.Router();
const eventCategoryControl = require("../../controller/admin/eventCategory.control");
const { auth, isadmin } = require("../../middleware/auth");

router.post("/add", eventCategoryControl.add);
router.get("/all", eventCategoryControl.all);
router.put("/update/:id", eventCategoryControl.update);
router.delete("/delete/:id", eventCategoryControl.delete);


module.exports = router;