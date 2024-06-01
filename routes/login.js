var express = require("express");
const { login, logout } = require("../controller/loginController");
var router = express.Router();

router.post("/", login);
router.get("/logout", logout);

module.exports = router;
