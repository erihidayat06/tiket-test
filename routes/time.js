var express = require("express");
var router = express.Router();
var time = require("../controller/timeController");
/* GET home page. */
router.get("/", time.getAll);
router.post("/create", time.create);
router.post("/edit/:id", time.edit);
router.post("/delete/:id", time.destroy);

module.exports = router;
