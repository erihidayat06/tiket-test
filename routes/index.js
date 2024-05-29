var express = require("express");
var router = express.Router();
var sew = require("../controller/gendreController");
var sew = require("../controller/movieController");
/* GET home page. */
router.get("/", sew.getAll);

module.exports = router;
