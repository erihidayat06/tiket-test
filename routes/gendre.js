var express = require("express");
var router = express.Router();
var gendre = require("../controller/gendreController");
const jwt = require("jsonwebtoken");
const { verifyToken, checkRole } = require("../controller/loginController");

/* GET home page. */
router.get("/", gendre.getAll);
router.post("/create", verifyToken, checkRole("admin"), gendre.create);
router.post("/edit/:id", verifyToken, checkRole("admin"), gendre.edit);
router.post("/delete/:id", verifyToken, checkRole("admin"), gendre.destroy);

module.exports = router;
