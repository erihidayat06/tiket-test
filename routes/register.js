var express = require("express");
const { saveUser } = require("../controller/registerController");
var router = express.Router();

router.post("/", saveUser);

module.exports = router;
