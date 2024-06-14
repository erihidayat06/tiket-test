const config = require("../library/database");
const mysql = require("mysql");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");

const pool = mysql.createPool(config);

pool.on("error", (err) => {
  console.error(err);
});

const validateUser = (body) => {
  const errors = [];
  if (!body.username || typeof body.username !== "string") {
    errors.push("Username is required and must be a string.");
  }
  if (!body.no_telp || typeof body.no_telp !== "string") {
    errors.push("Phone number is required and must be a string.");
  }
  if (!body.email || typeof body.email !== "string") {
    errors.push("Email is required and must be a string.");
  }
  if (!body.password || typeof body.password !== "string") {
    errors.push("Password is required and must be a string.");
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

    const { username, no_telp, email, password } = req.body;

    connection = await new Promise((resolve, reject) => {
      pool.getConnection((err, conn) => {
        if (err) {
          reject(err);
        } else {
          resolve(conn);
        }
      });
    });

    // Check if user already exists
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
      res.status(400).json({ message: "Username or email already exists." });
    } else {
      // Hash password with SHA-512
      const hashedPassword = crypto
        .createHash("sha512")
        .update(password)
        .digest("hex");

      const formData = {
        username: username,
        no_telp: no_telp,
        email: email,
      };

      // Insert new user
      const result = await new Promise((resolve, reject) => {
        connection.query(
          "INSERT INTO tbl_users (username, no_telp, email, password) VALUES (?,?,?,?)",
          [username, no_telp, email, hashedPassword],
          (err, result) => {
            if (err) {
              reject(err);
            } else {
              resolve(result);
            }
          }
        );
      });

      // Generate token
      const token = jwt.sign(
        { username: username, email: email },
        "your_jwt_secret", // replace with your own secret key
        { expiresIn: "1h" }
      );

      // Send success response with token
      res.status(201).json({
        status: true,
        data: formData,
        message: "User registered successfully.",
        token: token,
      });
    }
  } catch (err) {
    console.error("Error:", err);
    return res.status(500).json({
      error: "Internal Server Error",
      message: "An error occurred while processing your request.",
    });
  } finally {
    if (connection) connection.release();
  }
};

module.exports = { saveUser };
