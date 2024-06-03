const config = require("../library/database");
let mysql = require("mysql");
const fs = require("fs");
const path = require("path");
const pictureValidate = require("../model/picture");

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
        "SELECT * FROM tbl_pictures WHERE archived = ?",
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
      pictures: rows,
    });
  } catch (err) {
    console.error("Error:", err);
    return res.status(500).json({
      error: "Internal Server Error",
      message: "An error occurred while processing your request",
    });
  }
};

const pictureSchema = pictureValidate;

// Create
const create = async (req, res) => {
  let connection;
  try {
    const picture = req.file ? req.file.filename : null;
    // Validasi body permintaan terhadap skema
    const { error, value } = pictureSchema.validate(req.body, {
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

    let { name_pictures, id_movie } = value;

    let formData = {
      name_pictures: name_pictures,
      picture: picture,
      id_movie: id_movie,
    };

    // Menjalankan query untuk memasukkan data
    const result = await new Promise((resolve, reject) => {
      connection.query(
        "INSERT INTO tbl_pictures SET ?",
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
    res.json({ data: formData, pesan: "Berhasil Menambah Foto" });
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

// Edit

const edit = async (req, res) => {
  let connection;

  try {
    const picture_lama = req.body.picture_lama;

    const picture_baru = req.file ? req.file.filename : null;

    const picture = picture_baru ? picture_baru : picture_lama;

    // Validasi body permintaan terhadap skema
    const { error, value } = pictureSchema.validate(req.body, {
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
    let { name_pictures, id_movie } = value;

    let formData = {
      name_pictures: name_pictures,
      picture: picture,
      id_movie: id_movie,
    };

    const result = await new Promise((resolve, reject) => {
      connection.query(
        "UPDATE tbl_pictures SET ? WHERE id_picture =?",
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
    res.json({ data: formData, pesan: "Berhasil Edit Picture" });
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

    console.log(id);

    let formData = {
      archived: archived,
    };

    const result = await new Promise((resolve, reject) => {
      connection.query(
        "UPDATE tbl_pictures SET ? WHERE id_picture =?",
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
    res.json({ data: formData, pesan: "Berhasil Hapus Picture" });
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
