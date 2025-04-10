const express = require("express");
const router = express.Router();
const bookControl = require("../../controller/admin/book.control");
const { auth, isadmin } = require("../../middleware/auth");
const { upload } = require("../../utils/CloudinaryConfig");

router.post("/add", upload.single("image"), bookControl.addBook);
router.get("/all",  bookControl.allBooks);
router.get("/single/:id", auth, isadmin, bookControl.singleBook);
router.put("/update/:id", auth, isadmin, upload.single("image"), bookControl.updateBook);
router.delete("/delete/:id", auth, isadmin, bookControl.deleteBook);
router.get("/enrollchart", auth, isadmin, bookControl.enrollChart);
router.get("/categorychart", auth, isadmin, bookControl.categoryChart);
router.get("/categoryitems",auth, isadmin, bookControl.categoryitem);

module.exports = router;