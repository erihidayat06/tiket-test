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
      connection.query(
        "SELECT * FROM tbl_movies WHERE action = false",
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

    let {
      name_film,
      picture,
      trailer,
      deskripsi,
      durasi,
      sutradara,
      rate_age,
      broadcast_date,
      end_of_show,
      id_genre,
    } = req.body;
    let errors = false;
    let errorMessages = [];

    // Validasi input
    if (!name_film) {
      errors = true;
      errorMessages.push("Woy nama lu siapa?");
    }
    if (!picture) {
      errors = true;
      errorMessages.push("Masukan picture yang sesuai");
    }
    if (!trailer) {
      errors = true;
      errorMessages.push("Masukan trailer yang sesuai");
    }
    if (!deskripsi) {
      errors = true;
      errorMessages.push("Masukan deskripsi yang sesuai");
    }
    if (!durasi) {
      errors = true;
      errorMessages.push("Masukan durasi yang sesuai");
    }
    if (!sutradara) {
      errors = true;
      errorMessages.push("Masukan sutradara yang sesuai");
    }
    if (!rate_age) {
      errors = true;
      errorMessages.push("Masukan rate usia yang sesuai");
    }
    if (!broadcast_date) {
      errors = true;
      errorMessages.push("Masukan tanggal broadcast yang sesuai");
    }
    if (!end_of_show) {
      errors = true;
      errorMessages.push("kapan film ini selsai");
    }
    if (!id_genre) {
      errors = true;
      errorMessages.push("masukan id genre ");
    }

    if (errors) {
      // Jika ada kesalahan, kirim kembali halaman formulir dengan pesan kesalahan
      res.status(400).json({ errors: errorMessages });
      return; // Menghentikan eksekusi fungsi
    }

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
    let {
      name_film,
      picture,
      trailer,
      deskripsi,
      durasi,
      sutradara,
      rate_age,
      broadcast_date,
      end_of_show,
      id_genre,
    } = req.body;
    let errors = false;
    let errorMessages = [];

    console.log(id);
    if (!name_film) {
      errors = true;
      errorMessages.push("Woy nama lu siapa?");
    }
    if (!picture) {
      errors = true;
      errorMessages.push("Masukan picture yang sesuai");
    }
    if (!trailer) {
      errors = true;
      errorMessages.push("Masukan trailer yang sesuai");
    }
    if (!deskripsi) {
      errors = true;
      errorMessages.push("Masukan deskripsi yang sesuai");
    }
    if (!durasi) {
      errors = true;
      errorMessages.push("Masukan durasi yang sesuai");
    }
    if (!sutradara) {
      errors = true;
      errorMessages.push("Masukan sutradara yang sesuai");
    }
    if (!rate_age) {
      errors = true;
      errorMessages.push("Masukan rate usia yang sesuai");
    }
    if (!broadcast_date) {
      errors = true;
      errorMessages.push("Masukan tanggal broadcast yang sesuai");
    }
    if (!end_of_show) {
      errors = true;
      errorMessages.push("kapan film ini selsai");
    }
    if (!id_genre) {
      errors = true;
      errorMessages.push("masukan id genre ");
    }

    if (errors) {
      // Jika ada kesalahan, kirim kembali halaman formulir dengan pesan kesalahan
      res.json({ errors: errorMessages });
    }
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
