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
      connection.query("SELECT * FROM tbl_movies", function (err, rows) {
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

const postMovie = async (req, res, next) => {
  const {
    name_film,
    picture,
    trailer,
    deskripsi,
    durasi,
    sutradara,
    rate_age,
    broadcast_date,
    end_of_show,
  } = req.body;

  if (!name_film || !picture) {
    return res.status(400).json({
      error: "Bad Request",
      message: "name_film and picture are required",
    });
  }

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

    await new Promise((resolve, reject) => {
      const query = "INSERT INTO tbl_movies SET ?";
      connection.query(
        query,
        [
          name_film,
          picture,
          trailer,
          deskripsi,
          durasi,
          sutradara,
          rate_age,
          broadcast_date,
          end_of_show,
        ],
        function (err, results) {
          connection.release();
          if (err) {
            reject(err);
          } else {
            resolve(results);
          }
        }
      );
    });

    res.json({
      message: "Movie added successfully",
      data: {
        name_film,
        picture,
        trailer,
        deskripsi,
        durasi,
        sutradara,
        rate_age,
        broadcast_date,
        end_of_show,
      },
    });
  } catch (err) {
    console.error("Error:", err);
    return res.status(500).json({
      error: "Internal Server Error",
      message: "An error occurred while processing your request",
    });
  }
};

module.exports = {
  getAll,
  postMovie,
};
