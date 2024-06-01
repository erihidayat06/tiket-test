var express = require("express");
var router = express.Router();
var gendre = require("../controller/gendreController");
const jwt = require("jsonwebtoken");
const { verifyToken, checkRole } = require("../controller/loginController");

/* GET home page. */
router.get("/", gendre.getAll);
router.post("/create", gendre.create);
router.post("/edit/:id", gendre.edit);
router.post("/delete/:id", verifyToken, gendre.destroy);

module.exports = router;
