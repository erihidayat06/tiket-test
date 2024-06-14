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

// Fungsi untuk menghapus file
const removeFile = (filepath) => {
  console.log(`Trying to delete file: ${filepath}`); // Tambahkan log untuk debugging
  fs.unlink(filepath, (err) => {
    if (err) {
      console.error(`Failed to delete file: ${filepath}`, err);
    } else {
      console.log(`File deleted: ${filepath}`);
    }
  });
};

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
        "SELECT * FROM tbl_movies INNER JOIN tbl_genreses ON tbl_movies.id_genre = tbl_genreses.id_genre WHERE tbl_movies.archived = false AND tbl_genreses.archived_genre = false AND tbl_movies.broadcast_date <=  CURDATE() AND tbl_movies.end_of_show >=  CURDATE()",
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

const getById = async (req, res, next) => {
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

    const id = req.params.id;

    const rows = await new Promise((resolve, reject) => {
      connection.query(
        "SELECT * FROM tbl_movies " +
          "RIGHT JOIN tbl_genreses ON tbl_movies.id_genre = tbl_genreses.id_genre " +
          "WHERE tbl_movies.archived = ? AND tbl_movies.id_movie = ?",
        [0, id],
        function (err, rows) {
          if (err) {
            reject(err);
          } else {
            resolve(rows);
          }
        }
      );
    });

    const rows_picture = await new Promise((resolve, reject) => {
      connection.query(
        "SELECT * FROM tbl_pictures WHERE archived=? AND id_movie=?",
        [0, id],
        function (err, rows) {
          if (err) {
            reject(err);
          } else {
            resolve(rows);
          }
        }
      );
    });

    const rows_actor = await new Promise((resolve, reject) => {
      connection.query(
        "SELECT * FROM tbl_actors WHERE archived=? AND id_movie=?",
        [0, id],
        function (err, rows) {
          if (err) {
            reject(err);
          } else {
            resolve(rows);
          }
        }
      );
    });

    const Rowstimes = await new Promise((resolve, reject) => {
      connection.query(
        "SELECT * FROM tbl_times WHERE archived=? AND id_movie=? AND dated BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 14 DAY)",
        [0, id],
        function (err, rows) {
          if (err) {
            reject(err);
          } else {
            resolve(rows);
          }
        }
      );
    });

    const rows_vote = await new Promise((resolve, reject) => {
      connection.query(
        "SELECT tbl_users.id_user, tbl_votes.id_vote, tbl_votes.rating, tbl_votes.comment, tbl_users.username, tbl_votes.updated_at FROM tbl_votes LEFT JOIN tbl_users ON tbl_votes.id_user = tbl_users.id_user WHERE tbl_votes.archived = ? AND tbl_votes.id_movie = ? ORDER BY tbl_votes.created_at DESC",
        [0, id],
        function (err, rows) {
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
      movies: {
        movie: rows[0],
        pictures: rows_picture,
        votes: rows_vote,
        actor: rows_actor,
        times: Rowstimes,
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

// Definisikan skema Joi untuk validasi pengguna
const movieSchema = movieValidate;

const create = async (req, res) => {
  let connection;
  try {
    const picture = req.file ? req.file.filename : null;

    // Validasi body permintaan terhadap skema
    const { error, value } = movieSchema.validate(req.body, {
      abortEarly: false,
    });

    if (error) {
      // Hapus file jika ada kesalahan validasi
      if (picture) {
        const picturePath = path.resolve(
          __dirname,
          "..",
          "public",
          "uploads",
          picture
        );
        removeFile(picturePath);
      }
      // Kumpulkan semua kesalahan validasi
      const validationErrors = error.details.map((detail) => detail.message);
      return res.status(400).json({ errors: validationErrors });
    }

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
    // Data picture
    const picture_lama = req.body.picture_lama;

    const picture_baru = req.file ? req.file.filename : null;

    const picture = picture_baru ? picture_baru : picture_lama;

    // Validasi body permintaan terhadap skema
    const { error, value } = movieSchema.validate(req.body, {
      abortEarly: false,
    });

    if (error) {
      // Hapus file jika ada kesalahan validasi
      if (picture_baru) {
        const picturePath = path.resolve(
          __dirname,
          "..",
          "public",
          "uploads",
          picture_baru
        );
        removeFile(picturePath);
      }
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
  getById,
  create,
  edit,
  destroy,
};
