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
      connection.query("SELECT * FROM tbl_pictures WHERE action = ?", [0], function (err, rows) {
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
      picture: rows,
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

    let { name_pictures, picture, id_movie } = req.body;
    let errors = false;
    let errorMessages = [];

    // Validasi input
    if (!name_pictures) {
      errors = true;
      errorMessages.push("nama foto ini apa");
    }
    if (!picture) {
      errors = true;
      errorMessages.push("fotoaapa");
    }
    if (!id_movie) {
      errors = true;
      errorMessages.push("movie lu  apa?");
    }

    if (errors) {
      // Jika ada kesalahan, kirim kembali halaman formulir dengan pesan kesalahan
      res.status(400).json({ errors: errorMessages });
      return; // Menghentikan eksekusi fungsi
    }

    let formData = {
      name_pictures: name_pictures,
      picture: picture,
      id_movie: id_movie,
    };

    // Menjalankan query untuk memasukkan data
    const result = await new Promise((resolve, reject) => {
      connection.query("INSERT INTO tbl_pictures SET ?", formData, (err, result) => {
        if (err) {
          reject(err);
        } else {
          resolve(result);
        }
      });
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
    let { name_pictures, picture, id_movie } = req.body;
    let errors = false;
    let errorMessages = [];

    console.log(id);

    if (!name_pictures) {
      errors = true;
      errorMessages.push("nama foto ini apa");
    }
    if (!picture) {
      errors = true;
      errorMessages.push("fotoaapa");
    }
    if (!id_movie) {
      errors = true;
      errorMessages.push("movie lu  apa?");
    }

    if (errors) {
      // Jika ada kesalahan, kirim kembali halaman formulir dengan pesan kesalahan
      res.json({ errors: errorMessages });
    }
    let formData = {
      name_pictures: name_pictures,
      picture: picture,
      id_movie: id_movie,
    };

    const result = await new Promise((resolve, reject) => {
      connection.query("UPDATE tbl_pictures SET ? WHERE id_picture =?", [formData, id], (err, result) => {
        if (err) {
          reject(err);
        } else {
          resolve(result);
        }
      });
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
    let action = true;
    let errors = false;
    let errorMessages = [];

    console.log(id);

    let formData = {
      action: action,
    };

    const result = await new Promise((resolve, reject) => {
      connection.query("UPDATE tbl_pictures SET ? WHERE id_picture =?", [formData, id], (err, result) => {
        if (err) {
          reject(err);
        } else {
          resolve(result);
        }
      });
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
