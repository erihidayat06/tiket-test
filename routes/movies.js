var express = require("express");
var router = express.Router();
var movieController = require("../controller/movieController");

// GET home page
router.get("/", movieController.getAll);

router.post("/create", movieController.getAll);
module.exports = router;
