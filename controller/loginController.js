const config = require("../library/database");
const SECRET_KEY = "hsgayah1223"; // Ganti dengan secret key yang aman
const jwt = require("jsonwebtoken");
const mysql = require("mysql");
const loginValidate = require("../model/login");

const pool = mysql.createPool(config);

pool.on("error", (err) => {
  console.error(err);
});

const loginSchema = loginValidate;

const login = (req, res) => {
  // Validasi body permintaan terhadap skema
  const { error, value } = loginSchema.validate(req.body, {
    abortEarly: false,
  });

  if (error) {
    // Kumpulkan semua kesalahan validasi
    const validationErrors = error.details.map((detail) => detail.message);
    return res.status(400).json({ errors: validationErrors });
  }
  const { email, password } = value;

  if (email && password) {
    pool.getConnection((err, connection) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ pesan: "Terjadi kesalahan server." });
      }
      connection.query(
        `SELECT * FROM tbl_users WHERE email = ? AND password = SHA2(?,512)`,
        [email, password],
        (error, results) => {
          connection.release(); // Release the connection when done

          if (error) {
            console.error(error);
            return res.status(500).json({ pesan: "Terjadi kesalahan server." });
          }

          if (results.length > 0) {
            // Generate JWT token
            const token = jwt.sign(
              {
                userid: results[0].id_user,
                username: results[0].username,
                email: results[0].email,
                no_telp: results[0].no_telp,
                role: results[0].role,
              },
              SECRET_KEY,
              { expiresIn: "1h" } // Token expires in 1 hour
            );

            // Set session variables (optional)
            req.session.loggedin = true;
            req.session.userid = results[0].id_user;
            req.session.username = results[0].username;

            return res.json({
              pesan: "Berhasil",
              token: token,
            });
          } else {
            return res
              .status(401)
              .json({ pesan: "Email atau password salah." });
          }
        }
      );
    });
  } else {
    return res.status(400).json({ pesan: "Email dan password diperlukan." });
  }
};

const verifyToken = (req, res, next) => {
  const token = req.headers["authorization"];

  if (!token) {
    return res.status(403).json({ pesan: "Token tidak disediakan." });
  }

  jwt.verify(token.split(" ")[1], SECRET_KEY, (err, decoded) => {
    if (err) {
      return res.status(401).json({ pesan: "Token tidak valid." });
    }
    req.decoded = decoded;
    next();
  });
};

const checkRole = (role) => {
  return (req, res, next) => {
    if (req.decoded.role !== role) {
      return res
        .status(403)
        .json({ pesan: `Akses ditolak untuk role ${req.decoded.role}.` });
    }
    next();
  };
};

const logout = (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ pesan: "Terjadi kesalahan server." });
    }
    res.json({ pesan: "Berhasil logout." });
  });
};

module.exports = {
  login,
  logout,
  verifyToken,
  checkRole,
};
