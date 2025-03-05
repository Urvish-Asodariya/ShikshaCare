const express = require("express");
const router = express.Router();
const courseCategoryControl = require("../../controller/admin/courseCategory.control");
const { auth, isadmin } = require("../../middleware/auth");

router.post("/add", courseCategoryControl.add);
router.get("/all", courseCategoryControl.all);
router.put("/update/:id", courseCategoryControl.update);
router.delete("/delete/:id", courseCategoryControl.delete);


module.exports = router;