var express = require("express");
var router = express.Router();
var movie = require("../controller/movieController");
/* GET home page. */
router.get("/", movie.getAll);
router.post("/create", movie.create);
router.post("/edit/:id", movie.edit);
router.post("/delete/:id", movie.destroy);

module.exports = router;
