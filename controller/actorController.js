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
      connection.query("SELECT * FROM tbl_actors WHERE action = ?", [0], function (err, rows) {
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
      actors: rows,
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

    let { name_actor, cast, id_movie } = req.body;
    let errors = false;
    let errorMessages = [];

    // Validasi input
    if (!name_actor) {
      errors = true;
      errorMessages.push("Woy nama lu siapa?");
    }
    if (!cast) {
      errors = true;
      errorMessages.push("Woy lu cast apa?");
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
      name_actor: name_actor,
      cast: cast,
      id_movie: id_movie,
    };

    // Menjalankan query untuk memasukkan data
    const result = await new Promise((resolve, reject) => {
      connection.query("INSERT INTO tbl_actors SET ?", formData, (err, result) => {
        if (err) {
          reject(err);
        } else {
          resolve(result);
        }
      });
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
    let { name_actor, cast, id_movie } = req.body;
    let errors = false;
    let errorMessages = [];

    console.log(id);

    if (!name_actor) {
      errors = true;
      errorMessages.push("Woy nama lu siapa?");
    }
    if (!cast) {
      errors = true;
      errorMessages.push("Woy nama lu siapa?");
    }
    if (!id_movie) {
      errors = true;
      errorMessages.push("Woy nama lu siapa?");
    }

    if (errors) {
      // Jika ada kesalahan, kirim kembali halaman formulir dengan pesan kesalahan
      res.json({ errors: errorMessages });
    }
    let formData = {
      name_actor: name_actor,
      cast: cast,
      id_movie: id_movie,
    };

    const result = await new Promise((resolve, reject) => {
      connection.query("UPDATE tbl_actors SET ? WHERE id_actor =?", [formData, id], (err, result) => {
        if (err) {
          reject(err);
        } else {
          resolve(result);
        }
      });
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
    let action = true;
    let errors = false;
    let errorMessages = [];

    console.log(id);

    let formData = {
      action: action,
    };

    const result = await new Promise((resolve, reject) => {
      connection.query("UPDATE tbl_actors SET ? WHERE id_actor =?", [formData, id], (err, result) => {
        if (err) {
          reject(err);
        } else {
          resolve(result);
        }
      });
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
