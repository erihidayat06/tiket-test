var express = require("express");
var router = express.Router();
const multer = require("multer");
const path = require("path");
const sanitizeFilename = require("sanitize-filename");
var movie = require("../controller/movieController");
const { checkRole, verifyToken } = require("../controller/loginController");

// Configure storage options for multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./public/uploads"); // Ensure this folder exists or create it
  },
  filename: function (req, file, cb) {
    const sanitizedFilename = sanitizeFilename(file.originalname);
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + "-" + sanitizedFilename);
  },
});

// File filter to allow only certain file types
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif/;
  const extname = allowedTypes.test(
    path.extname(file.originalname).toLowerCase()
  );
  const mimetype = allowedTypes.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb("Error: Only images (JPEG, JPG, PNG, GIF) are allowed!");
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 1024 * 1024 * 5 }, // 5 MB file size limit
});

/* GET home page. */
router.get("/", movie.getAll);
router.get("/:id", movie.getById);
router.post(
  "/create",
  upload.single("picture"),
  verifyToken,
  checkRole("admin"),
  movie.create
);
router.post(
  "/edit/:id",
  upload.single("picture"),
  verifyToken,
  checkRole("admin"),
  movie.edit
);
router.post("/delete/:id", movie.destroy);

module.exports = router;
