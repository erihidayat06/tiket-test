const config = require("../library/database");
const mysql = require("mysql");
const midtransClient = require("midtrans-client");
const { token } = require("morgan");
const Midtrans = require("midtrans-client");

let pool = mysql.createPool(config);

pool.on("error", (err) => {
  console.error(err);
});

let snap = new midtransClient.Snap({
  isProduction: false,
  serverKey: process.env.SERVER_KEY_MIDTRANS,
});

const createTransaction = (
  order_id,
  totalPrice,
  seats,
  id_time,
  id_movie,
  id_user,
  transactionToken // Added transactionToken parameter
) => {
  return new Promise((resolve, reject) => {
    const created_at = new Date().toISOString();
    const sql = `INSERT INTO tbl_transactions (id_transaction, total, seat, status, id_time, id_movie, id_user, token) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`; // Added token field in the SQL query
    pool.query(
      sql,
      [
        order_id,
        totalPrice,
        JSON.stringify(seats),
        "PROSES",
        id_time,
        id_movie,
        id_user,
        transactionToken, // Added transactionToken as a parameter
      ],
      (error, results) => {
        if (error) {
          reject(error);
        } else {
          resolve({ order_id, created_at });
        }
      }
    );
  });
};

const updateTransactionStatus = (req, res) => {
  const { order_id, status } = req.body;

  const sql = `UPDATE tbl_transactions SET status = ? WHERE id_transaction = ?`;
  pool.query(sql, [status, order_id], (error, results) => {
    if (error) {
      console.error("Failed to update status:", error);
      res.status(500).json({ error: "Failed to update status" });
    } else {
      res.status(200).json({ message: "Status updated successfully", results });
    }
  });
};

const proses = (req, res) => {
  const {
    order_id,
    totalPrice,
    name,
    seats,
    email,
    phone,
    movie_id,
    movie_price,
    movie_title,
    movie_categori,
    id_time,
    id_movie,
    id_user,
  } = req.body;

  let parameter = {
    transaction_details: {
      order_id: order_id,
      gross_amount: totalPrice,
    },
    credit_card: {
      secure: true,
    },
    item_details: [
      {
        id: movie_id,
        price: movie_price,
        quantity: 1,
        name: movie_title,
        brand: movie_title,
        category: movie_categori,
      },
    ],
    customer_details: {
      first_name: name,
      email: email,
      phone: phone,
    },
  };

  snap
    .createTransaction(parameter)
    .then(async (transaction) => {
      console.log("Transaction Response:", transaction);
      let transactionToken = transaction.token;
      console.log("transactionToken:", transactionToken);

      const { created_at } = await createTransaction(
        order_id,
        totalPrice,
        seats,
        id_time,
        id_movie,
        id_user,
        transactionToken // Pass the transactionToken
      );

      res.status(200).json({ transactionToken, order_id, created_at });
    })
    .catch((error) => {
      console.error("Error creating transaction:", error);
      res.status(500).json({ error: "Gagal membuat transaksi" });
    });
};

const getById = async (req, res, next) => {
  let connection;
  const { userId } = req.query; // Mengambil userId dari query parameter

  try {
    connection = await new Promise((resolve, reject) => {
      pool.getConnection((err, connection) => {
        if (err) {
          reject(err);
        } else {
          resolve(connection);
        }
      });
    });

    const query = `
      SELECT 
        t.id_transaction, 
        t.total, 
        t.seat, 
        t.status, 
        t.created_at, 
        t.token, 
        tt.dated, 
        tt.hour, 
        m.name_film, 
        m.durasi, 
        u.username, 
        u.no_telp 
      FROM tbl_transactions as t 
      INNER JOIN tbl_times as tt ON t.id_time = tt.id_time 
      INNER JOIN tbl_movies as m ON t.id_movie = m.id_movie 
      INNER JOIN tbl_users as u ON t.id_user = u.id_user 
      WHERE t.archived = ? ${userId ? "AND t.id_user = ?" : ""}
    `;

    const queryParams = [0];
    if (userId) queryParams.push(userId);

    const rows = await new Promise((resolve, reject) => {
      connection.query(query, queryParams, function (err, rows) {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });

    if (rows.length === 0) {
      return res.status(404).json({
        error: "Not Found",
        message: "No record found with the given ID",
      });
    }

    res.json({
      status: true,
      message: "List Data Posts",
      transactions: {
        transaction: rows,
      },
    });
  } catch (err) {
    console.error("Error:", err);
    return res.status(500).json({
      error: "Internal Server Error",
      message: "An error occurred while processing your request",
    });
  } finally {
    if (connection) {
      connection.release(); // Melepas koneksi setelah selesai
    }
  }
};

const getAll = async (req, res, next) => {
  let connection;

  try {
    connection = await new Promise((resolve, reject) => {
      pool.getConnection((err, connection) => {
        if (err) {
          reject(err);
        } else {
          resolve(connection);
        }
      });
    });

    const query = `
      SELECT 
       *
      FROM tbl_transactions as t 
      INNER JOIN tbl_times as tt ON t.id_time = tt.id_time 
      INNER JOIN tbl_movies as m ON t.id_movie = m.id_movie 
      INNER JOIN tbl_users as u ON t.id_user = u.id_user 
      WHERE t.archived = ? 
    `;

    const queryParams = [0];

    const rows = await new Promise((resolve, reject) => {
      connection.query(query, queryParams, function (err, rows) {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });

    if (rows.length === 0) {
      return res.status(404).json({
        error: "Not Found",
        message: "No record found with the given ID",
      });
    }

    res.json({
      status: true,
      message: "List Data Posts",
      transactions: {
        transaction: rows,
      },
    });
  } catch (err) {
    console.error("Error:", err);
    return res.status(500).json({
      error: "Internal Server Error",
      message: "An error occurred while processing your request",
    });
  } finally {
    if (connection) {
      connection.release(); // Melepas koneksi setelah selesai
    }
  }
};

module.exports = {
  proses,
  updateTransactionStatus,
  getById,
  getAll,
};
