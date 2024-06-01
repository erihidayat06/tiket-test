var express = require("express");
var router = express.Router();
var vote = require("../controller/voteController");
/* GET home page. */
router.get("/", vote.getAll);
router.post("/create", vote.create);
router.post("/edit/:id", vote.edit);
router.post("/delete/:id", vote.destroy);

module.exports = router;
