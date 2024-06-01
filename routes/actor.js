var express = require("express");
var router = express.Router();
var actor = require("../controller/actorController");
/* GET home page. */
router.get("/", actor.getAll);
router.post("/create", actor.create);
router.post("/edit/:id", actor.edit);
router.post("/delete/:id", actor.destroy);

module.exports = router;
