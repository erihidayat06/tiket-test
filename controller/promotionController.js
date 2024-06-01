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
      connection.query("SELECT * FROM tbl_promotions WHERE action = ?", [0], function (err, rows) {
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
      promotion: rows,
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

    let { title, image, fill } = req.body;
    let errors = false;
    let errorMessages = [];

    // Validasi input
    if (!title) {
      errors = true;
      errorMessages.push("Promo apa ni?");
    }
    if (!image) {
      errors = true;
      errorMessages.push("gambarnya yang sesuai lah");
    }
    if (!fill) {
      errors = true;
      errorMessages.push("fill nya apee?");
    }

    if (errors) {
      // Jika ada kesalahan, kirim kembali halaman formulir dengan pesan kesalahan
      res.status(400).json({ errors: errorMessages });
      return; // Menghentikan eksekusi fungsi
    }

    let formData = {
      title: title,
      image: image,
      fill: fill,
    };

    // Menjalankan query untuk memasukkan data
    const result = await new Promise((resolve, reject) => {
      connection.query("INSERT INTO tbl_promotions SET ?", formData, (err, result) => {
        if (err) {
          reject(err);
        } else {
          resolve(result);
        }
      });
    });

    // Mengirim respons sukses
    res.json({ data: formData, pesan: "Berhasil Menambah Promo" });
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
    let { title, image, fill } = req.body;
    let errors = false;
    let errorMessages = [];

    console.log(id);

    if (!title) {
      errors = true;
      errorMessages.push("Promo apa ni?");
    }
    if (!image) {
      errors = true;
      errorMessages.push("gambarnya yang sesuai lah");
    }
    if (!fill) {
      errors = true;
      errorMessages.push("fill nya apee?");
    }

    if (errors) {
      // Jika ada kesalahan, kirim kembali halaman formulir dengan pesan kesalahan
      res.json({ errors: errorMessages });
    }
    let formData = {
      title: title,
      image: image,
      fill: fill,
    };

    const result = await new Promise((resolve, reject) => {
      connection.query("UPDATE tbl_promotions SET ? WHERE id_promo =?", [formData, id], (err, result) => {
        if (err) {
          reject(err);
        } else {
          resolve(result);
        }
      });
    });
    res.json({ data: formData, pesan: "Berhasil Edit Promo" });
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
      connection.query("UPDATE tbl_promotions SET ? WHERE id_promo =?", [formData, id], (err, result) => {
        if (err) {
          reject(err);
        } else {
          resolve(result);
        }
      });
    });
    res.json({ data: formData, pesan: "Berhasil hapus promo" });
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
