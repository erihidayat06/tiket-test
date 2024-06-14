var express = require("express");
var router = express.Router();
var transaction = require("../controller/transactionController");

router.get("/all", transaction.getAll);
router.post("/", transaction.proses);
router.get("/get", transaction.getById);
router.put("/update", transaction.updateTransactionStatus);

module.exports = router;
