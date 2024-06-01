const config = require("../library/database");
let mysql = require("mysql");
var bcrypt = require("bcrypt");
const Joi = require("joi");
let pool = mysql.createPool(config);

pool.on("error", (err) => {
  console.error(err);
});

// Definisikan skema Joi untuk validasi pengguna
const userSchema = Joi.object({
  username: Joi.string().alphanum().min(3).max(30).required().messages({
    "string.alphanum": "Username hanya boleh berisi karakter alfanumerik.",
    "string.min": "Username harus terdiri dari setidaknya 3 karakter.",
    "string.max": "Username tidak boleh lebih dari 30 karakter.",
    "any.required": "Username wajib diisi.",
  }),
  no_telp: Joi.string()
    .pattern(/^[0-9]+$/)
    .min(10)
    .max(15)
    .required()
    .messages({
      "string.pattern.base": "Nomor telepon hanya boleh berisi angka.",
      "string.min": "Nomor telepon harus terdiri dari setidaknya 10 digit.",
      "string.max": "Nomor telepon tidak boleh lebih dari 15 digit.",
      "any.required": "Nomor telepon wajib diisi.",
    }),
  email: Joi.string()
    .email({ tlds: { allow: false } })
    .required()
    .messages({
      "string.email": "Email tidak valid.",
      "any.required": "Email wajib diisi.",
    }),
  password: Joi.string().min(6).required().messages({
    "string.min": "Password harus terdiri dari setidaknya 6 karakter.",
    "any.required": "Password wajib diisi.",
  }),
  role: Joi.string().valid("admin", "user", "guest").required().messages({
    "any.only": "Role harus salah satu dari 'admin', 'user', 'guest'.",
    "any.required": "Role wajib diisi.",
  }),
});

const saveUser = async (req, res) => {
  let connection; // Definisikan variabel koneksi di awal fungsi

  try {
    // Validasi body permintaan terhadap skema
    const { error, value } = userSchema.validate(req.body, {
      abortEarly: false,
    });

    if (error) {
      // Kumpulkan semua kesalahan validasi
      const validationErrors = error.details.map((detail) => detail.message);
      return res.status(400).json({ errors: validationErrors });
    }

    const { username, no_telp, email, password, role } = value;

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
      // Hash password sebelum menyimpan
      let hashedPassword = bcrypt.hashSync(password, bcrypt.genSaltSync(10));

      let formData = {
        username: username,
        no_telp: no_telp,
        email: email,
        role: role,
      };

      // Masukkan pengguna baru
      const result = await new Promise((resolve, reject) => {
        connection.query(
          "INSERT INTO tbl_users (username, no_telp, email, password, role) VALUES (?,?,?,?,?) ",
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

module.exports = {
  saveUser,
};
