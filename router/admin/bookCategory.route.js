const express = require("express");
const router = express.Router();
const bookCategoryControl = require("../../controller/admin/bookCategory.control");
const { auth, isadmin } = require("../../middleware/auth");

router.post("/add", bookCategoryControl.add);
router.get("/all", bookCategoryControl.all);
router.put("/update/:id", bookCategoryControl.update);
router.delete("/delete/:id", bookCategoryControl.delete);


module.exports = router;