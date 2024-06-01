var express = require("express");
var router = express.Router();
var picture = require("../controller/pictureController");
/* GET home page. */
router.get("/", picture.getAll);
router.post("/create", picture.create);
router.post("/edit/:id", picture.edit);
router.post("/delete/:id", picture.destroy);

module.exports = router;
