var express = require("express");
var router = express.Router();
var promotion = require("../controller/promotionController");
/* GET home page. */
router.get("/", promotion.getAll);
router.post("/create", promotion.create);
router.post("/edit/:id", promotion.edit);
router.post("/delete/:id", promotion.destroy);

module.exports = router;
