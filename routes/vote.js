var express = require("express");
var router = express.Router();
var vote = require("../controller/voteController");
const { verifyToken } = require("../controller/loginController");
/* GET home page. */
router.get("/", vote.getAll);
router.post("/create", verifyToken, vote.create);
router.post("/edit/:id", verifyToken, vote.edit);
router.post("/delete/:id", verifyToken, vote.destroy);

module.exports = router;
