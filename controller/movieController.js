const config = require("../library/database");
let mysql = require("mysql");

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
      connection.query("SELECT * FROM tbl_movies", function (err, rows) {
        connection.release();
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
      movies: rows,
    });
  } catch (err) {
    console.error("Error:", err);
    return res.status(500).json({
      error: "Internal Server Error",
      message: "An error occurred while processing your request",
    });
  }
};

const create = async (req, res) => {
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

    let { name_film, picture, trailer, deskripsi, durasi, sutradara, rate_age, broadcast_date, end_of_show } = req.body;
    let errors = false;
    let errorMessages = [];

    // Validasi input
    if (!name_genre) {
      errors = true;
      errorMessages.push("Woy nama lu siapa?");
    }
    if (!picture) {
      errors = true;
      errorMessages.push("Woy nama lu siapa?");
    }

    if (errors) {
      // Jika ada kesalahan, kirim kembali halaman formulir dengan pesan kesalahan
      res.status(400).json({ errors: errorMessages });
      return; // Menghentikan eksekusi fungsi
    }

    let formData = {
      name_genre: name_genre,
    };

    // Menjalankan query untuk memasukkan data
    const result = await new Promise((resolve, reject) => {
      connection.query("INSERT INTO tbl_genreses SET ?", formData, (err, result) => {
        if (err) {
          reject(err);
        } else {
          resolve(result);
        }
      });
    });

    // Mengirim respons sukses
    res.json({ data: formData, pesan: "Berhasil Menambah Produk" });
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
  postMovie,
};
