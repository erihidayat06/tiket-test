const config = require("../library/database");
let mysql = require("mysql");
const Joi = require("joi");
const fs = require("fs");
const path = require("path");
const movieValidate = require("../model/movie");

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
        "SELECT * FROM tbl_movies INNER JOIN tbl_genreses ON tbl_movies.id_genre = tbl_genreses.id_genre WHERE tbl_movies.archived = false AND tbl_genreses.archived_genre",
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

// Definisikan skema Joi untuk validasi pengguna
const movieSchema = movieValidate;

const create = async (req, res) => {
  let connection;
  try {
    // Validasi body permintaan terhadap skema
    const { error, value } = movieSchema.validate(req.body, {
      abortEarly: false,
    });

    if (error) {
      // Kumpulkan semua kesalahan validasi
      const validationErrors = error.details.map((detail) => detail.message);
      return res.status(400).json({ errors: validationErrors });
    }

    const picture = req.file ? req.file.filename : null;

    let {
      name_film,
      trailer,
      deskripsi,
      durasi,
      sutradara,
      rate_age,
      broadcast_date,
      end_of_show,
      id_genre,
    } = value;

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

    let formData = {
      name_film: name_film,
      picture: picture,
      trailer: trailer,
      deskripsi: deskripsi,
      durasi: durasi,
      sutradara: sutradara,
      rate_age: rate_age,
      broadcast_date: broadcast_date,
      end_of_show: end_of_show,
      id_genre: id_genre,
    };

    // Menjalankan query untuk memasukkan data
    const result = await new Promise((resolve, reject) => {
      connection.query(
        "INSERT INTO tbl_movies SET ?",
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

    res.status(200).json({
      status: "sukses",
      data: formData,
      pesan: "Berhasil Menambah Film",
    });
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

  try {
    // Validasi body permintaan terhadap skema
    const { error, value } = movieSchema.validate(req.body, {
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
    let id = req.params.id;

    const picture_lama = req.body.picture_lama;

    const picture_baru = req.file ? req.file.filename : null;

    const picture = picture_baru ? picture_baru : picture_lama;

    let {
      name_film,
      trailer,
      deskripsi,
      durasi,
      sutradara,
      rate_age,
      broadcast_date,
      end_of_show,
      id_genre,
    } = value;

    let formData = {
      name_film: name_film,
      picture: picture,
      trailer: trailer,
      deskripsi: deskripsi,
      durasi: durasi,
      sutradara: sutradara,
      rate_age: rate_age,
      broadcast_date: broadcast_date,
      end_of_show: end_of_show,
      id_genre: id_genre,
    };

    const result = await new Promise((resolve, reject) => {
      connection.query(
        "UPDATE tbl_movies SET ? WHERE id_movie = ?",
        [formData, id],
        (err, result) => {
          if (err) {
            reject(err);
          } else {
            // Menghapus gambar lama jika ada
            if (picture_lama && picture_lama.length > 0 && picture_baru) {
              const filePath = path.join(
                __dirname,
                "..",
                "public",
                "uploads",
                picture_lama
              );
              fs.unlink(filePath, (err) => {
                if (err) {
                  console.error("Gagal menghapus gambar lama:", err);
                } else {
                  console.log("Gambar lama berhasil dihapus:", filePath);
                }
              });
            }
            resolve(result);
          }
        }
      );
    });

    res.status(200).json({
      status: true,
      data: formData,
      pesan: "Berhasil Edit film",
    });
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
  edit,
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
        "UPDATE tbl_movies SET ? WHERE id_movie =?",
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
    res.status(200).json({
      startus: "sukses",
      data: formData,
      pesan: "Berhasil Menghapus Film",
    });
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
