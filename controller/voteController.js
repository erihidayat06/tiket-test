const config = require("../library/database");
let mysql = require("mysql");
const voteValidate = require("../model/vote");

let pool = mysql.createPool(config);

pool.on("error", (err) => {
  console.error(err);
});

const getAll = async (req, res, next) => {
  try {
    const connection = await new Promise((resolve, reject) => {
      pool.getConnection((err, connection) => {
        if (err) {
          reject(err);
        } else {
          resolve(connection);
        }
      });
    });

    const rows = await new Promise((resolve, reject) => {
      connection.query(
        "SELECT * FROM tbl_votes WHERE archived = ?",
        [0],
        function (err, rows) {
          connection.release();
          if (err) {
            reject(err);
          } else {
            resolve(rows);
          }
        }
      );
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
      votes: rows,
    });
  } catch (err) {
    console.error("Error:", err);
    return res.status(500).json({
      error: "Internal Server Error",
      message: "An error occurred while processing your request",
    });
  }
};

const voteSchema = voteValidate;
const create = async (req, res) => {
  let connection;
  try {
    // Validasi body permintaan terhadap skema
    const { error, value } = voteSchema.validate(req.body, {
      abortEarly: false,
    });

    if (error) {
      // Kumpulkan semua kesalahan validasi
      const validationErrors = error.details.map((detail) => detail.message);
      return res.status(400).json({ errors: validationErrors });
    }
    // Mendapatkan koneksi dari pool
    connection = await new Promise((resolve, reject) => {
      pool.getConnection((err, connection) => {
        if (err) {
          reject(err);
        } else {
          resolve(connection);
        }
      });
    });

    let { rating, comment, id_movie, id_user } = value;

    let formData = {
      rating: rating,
      comment: comment,
      id_movie: id_movie,
      id_user: id_user,
    };

    // Menjalankan query untuk memasukkan data
    const result = await new Promise((resolve, reject) => {
      connection.query(
        "INSERT INTO tbl_votes SET ?",
        formData,
        (err, result) => {
          if (err) {
            reject(err);
          } else {
            resolve(result);
          }
        }
      );
    });

    // Mengirim respons sukses
    res.json({ data: formData, pesan: "Berhasil Menambah actor" });
  } catch (err) {
    console.error("Error:", err);
    res.status(500).json({
      error: "Internal Server Error",
      message: "An error occurred while processing your request",
    });
  } finally {
    // Melepaskan koneksi kembali ke pool
    if (connection) connection.release();
  }
};

const edit = async (req, res) => {
  let connection;
  // Validasi body permintaan terhadap skema
  const { error, value } = voteSchema.validate(req.body, {
    abortEarly: false,
  });

  if (error) {
    // Kumpulkan semua kesalahan validasi
    const validationErrors = error.details.map((detail) => detail.message);
    return res.status(400).json({ errors: validationErrors });
  }
  try {
    // Mendapatkan koneksi dari pool
    connection = await new Promise((resolve, reject) => {
      pool.getConnection((err, connection) => {
        if (err) {
          reject(err);
        } else {
          resolve(connection);
        }
      });
    });

    let id = req.params.id;
    let { rating, comment, id_movie, id_user } = value;

    let formData = {
      rating: rating,
      comment: comment,
      id_movie: id_movie,
      id_user: id_user,
    };

    const result = await new Promise((resolve, reject) => {
      connection.query(
        "UPDATE tbl_votes SET ? WHERE id_vote =?",
        [formData, id],
        (err, result) => {
          if (err) {
            reject(err);
          } else {
            resolve(result);
          }
        }
      );
    });
    res.json({ data: formData, pesan: "Berhasil Edit vote" });
  } catch (err) {
    console.error("Error:", err);
    res.status(500).json({
      error: "Internal Server Error",
      message: "An error occurred while processing your request",
    });
  } finally {
    // Melepaskan koneksi kembali ke pool
    if (connection) connection.release();
  }
};

const destroy = async (req, res) => {
  let connection;

  try {
    // Mendapatkan koneksi dari pool
    connection = await new Promise((resolve, reject) => {
      pool.getConnection((err, connection) => {
        if (err) {
          reject(err);
        } else {
          resolve(connection);
        }
      });
    });

    let id = req.params.id;
    let archived = true;

    let formData = {
      archived: archived,
    };

    const result = await new Promise((resolve, reject) => {
      connection.query(
        "UPDATE tbl_votes SET ? WHERE id_vote =?",
        [formData, id],
        (err, result) => {
          if (err) {
            reject(err);
          } else {
            resolve(result);
          }
        }
      );
    });
    res.json({ data: formData, pesan: "Berhasil hapus produk" });
  } catch (err) {
    console.error("Error:", err);
    res.status(500).json({
      error: "Internal Server Error",
      message: "An error occurred while processing your request",
    });
  } finally {
    // Melepaskan koneksi kembali ke pool
    if (connection) connection.release();
  }
};

module.exports = {
  getAll,
  create,
  edit,
  destroy,
};
