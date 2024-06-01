var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
var session = require("express-session");
const app = express();
const cors = require("cors");

app.use(cors());

const port = 5000;

var movieRouter = require("./routes/movies");

var sessionRouter = require("./routes/session");
var gendreRouter = require("./routes/gendre");
var indexRouter = require("./routes/index");
var usersRouter = require("./routes/users");
var transactionRouter = require("./routes/transaction");
var registerRouter = require("./routes/register");
var loginRouter = require("./routes/login");

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "jade");

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use(
  session({
    secret: "iniadalahrahasiamu",
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 60 * 60 * 1000 },
  })
);

app.use("/", indexRouter);

app.use("/api/movie", movieRouter);

app.use("/api/gendre", gendreRouter);

app.use("/api/users", usersRouter);
app.use("/api/transaction", transactionRouter);
app.use("/api/register", registerRouter);
app.use("/api/login", loginRouter);
app.use("/api/session", sessionRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});
module.exports = app;
