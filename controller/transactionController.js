const config = require("../library/database");
const mysql = require("mysql");
const midtransClient = require("midtrans-client");

const crypto = require("crypto");

let pool = mysql.createPool(config);

// Menangani kesalahan koneksi
pool.on("error", (err) => {
  console.error(err);
});
// Membuat instance Snap API
let snap = new midtransClient.Snap({
  // Set ke true jika Anda ingin Lingkungan Produksi (menerima transaksi nyata).
  isProduction: false,
  serverKey: process.env.SERVER_KEY_MIDTRANS,
});

const proses = (req, res) => {
  const { gross_amount, first_name, last_name, email, phone } = req.body;

  let parameter = {
    transaction_details: {
      order_id: crypto.randomBytes(16).toString("hex"), // Sebaiknya, order_id harus dihasilkan secara dinamis dan unik untuk setiap transaksi
      gross_amount: gross_amount,
    },
    credit_card: {
      secure: true,
    },
    customer_details: {
      first_name: first_name,
      last_name: last_name,
      email: email,
      phone: phone,
    },
  };

  snap
    .createTransaction(parameter)
    .then((transaction) => {
      // token transaksi
      let transactionToken = transaction.token;
      console.log("transactionToken:", transactionToken);
      // Kirim token transaksi sebagai respons JSON
      res.status(200).json({ transactionToken });
    })
    .catch((error) => {
      console.error("Error creating transaction:", error);
      res.status(500).json({ error: "Gagal membuat transaksi" });
    });
};

module.exports = {
  proses,
};
