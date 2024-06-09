const config = require("../library/database");
const mysql = require("mysql");
const crypto = require("crypto");

const pool = mysql.createPool(config);

pool.on("error", (err) => {
  console.error(err);
});

const validateUser = (body) => {
  const errors = [];
  if (!body.username || typeof body.username !== "string") {
    errors.push("Username diperlukan dan harus berupa string.");
  }
  if (!body.no_telp || typeof body.no_telp !== "string") {
    errors.push("Nomor telepon diperlukan dan harus berupa string.");
  }
  if (!body.email || typeof body.email !== "string") {
    errors.push("Email diperlukan dan harus berupa string.");
  }
  if (!body.password || typeof body.password !== "string") {
    errors.push("Password diperlukan dan harus berupa string.");
  }
  if (!body.role || typeof body.role !== "string") {
    errors.push("Role diperlukan dan harus berupa string.");
  }
  return errors;
};

const saveUser = async (req, res) => {
  let connection;

  try {
    const validationErrors = validateUser(req.body);

    if (validationErrors.length > 0) {
      return res.status(400).json({ errors: validationErrors });
    }

    const { username, no_telp, email, password, role } = req.body;

    connection = await new Promise((resolve, reject) => {
      pool.getConnection((err, conn) => {
        if (err) {
          reject(err);
        } else {
          resolve(conn);
        }
      });
    });

    // Periksa apakah pengguna sudah ada
    const userExists = await new Promise((resolve, reject) => {
      connection.query(
        "SELECT * FROM tbl_users WHERE username = ? OR email = ?",
        [username, email],
        (err, results) => {
          if (err) {
            reject(err);
          } else {
            resolve(results.length > 0);
          }
        }
      );
    });

    if (userExists) {
      res.status(400).json({ message: "Username atau email sudah ada" });
    } else {
      // Hash password dengan SHA-512
      const hashedPassword = crypto
        .createHash("sha512")
        .update(password)
        .digest("hex");

      const formData = {
        username: username,
        no_telp: no_telp,
        email: email,
        role: role,
      };

      // Masukkan pengguna baru
      const result = await new Promise((resolve, reject) => {
        connection.query(
          "INSERT INTO tbl_users (username, no_telp, email, password, role) VALUES (?,?,?,?,?)",
          [username, no_telp, email, hashedPassword, role],
          (err, result) => {
            if (err) {
              reject(err);
            } else {
              resolve(result);
            }
          }
        );
      });

      // Kirim respons sukses
      res.json({ data: formData, message: "User berhasil didaftarkan" });
    }
  } catch (err) {
    console.error("Error:", err);
    return res.status(500).json({
      error: "Internal Server Error",
      message: "Terjadi kesalahan saat memproses permintaan Anda",
    });
  } finally {
    if (connection) connection.release();
  }
};

module.exports = { saveUser };
