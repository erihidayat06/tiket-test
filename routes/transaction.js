var express = require("express");
var router = express.Router();
var transaction = require("../controller/transactionController");

router.post("/", transaction.proses);

module.exports = router;
