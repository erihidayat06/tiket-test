var express = require("express");
var router = express.Router();
var vote = require("../controller/voteController");
const { verifyToken } = require("../controller/loginController");
/* GET home page. */
router.get("/", vote.getAll);
router.get("/:id", vote.getById);
router.post("/create", vote.create);
router.post("/edit/:id", verifyToken, vote.edit);
router.post("/delete/:id", verifyToken, vote.destroy);

module.exports = router;
