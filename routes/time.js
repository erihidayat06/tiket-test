var express = require("express");
var router = express.Router();
var time = require("../controller/timeController");
const { verifyToken, checkRole } = require("../controller/loginController");
/* GET home page. */
router.get("/", time.getAll);
router.post("/create", verifyToken, checkRole("admin"), time.create);
router.post("/edit/:id", verifyToken, checkRole("admin"), time.edit);
router.post("/delete/:id", verifyToken, checkRole("admin"), time.destroy);

module.exports = router;
