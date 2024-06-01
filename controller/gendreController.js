const config = require("../library/database");
let mysql = require("mysql");
const genreValidate = require("../model/genre");

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
        "SELECT * FROM tbl_genreses WHERE archived_genre = ?",
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

    return res.status(200).json({
      status: true,
      message: "List Data Posts",
      data: rows,
    });
  } catch (err) {
    console.error("Error:", err);
    return res.status(500).json({
      error: "Internal Server Error",
      message: "An error occurred while processing your request",
    });
  }
};

const gendreSchema = genreValidate;

const create = async (req, res) => {
  let connection;
  try {
    // Validasi body permintaan terhadap skema
    const { error, value } = gendreSchema.validate(req.body, {
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

    let { name_genre } = value;

    let formData = {
      name_genre: name_genre,
    };

    // Menjalankan query untuk memasukkan data
    const result = await new Promise((resolve, reject) => {
      connection.query(
        "INSERT INTO tbl_genreses SET ?",
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

const edit = async (req, res) => {
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
    let { name_genre } = req.body;
    let errors = false;
    let errorMessages = [];

    console.log(id);

    if (!name_genre) {
      errors = true;
      errorMessages.push("Woy nama lu siapa?");
    }

    if (errors) {
      // Jika ada kesalahan, kirim kembali halaman formulir dengan pesan kesalahan
      res.json({ errors: errorMessages });
    }
    let formData = {
      name_genre: name_genre,
    };

    const result = await new Promise((resolve, reject) => {
      connection.query(
        "UPDATE tbl_genreses SET ? WHERE id_genre =?",
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
    res.json({ data: formData, pesan: "Berhasil Edit produk" });
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
    let archived_genre = true;

    console.log(id);

    let formData = {
      archived_genre: archived_genre,
    };

    const result = await new Promise((resolve, reject) => {
      connection.query(
        "UPDATE tbl_genreses SET ? WHERE id_genre = ?",
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
    res.json({ data: formData, pesan: "Berhasil Edit produk" });
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
