var express = require("express");
var router = express.Router();
var sew = require("../controller/gendreController");
/* GET home page. */
router.get("/", sew.getAll);

module.exports = router;
