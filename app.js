if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
const flash = require("express-flash");
const session = require("express-session");
const passport = require("passport");
const methodOverride = require("method-override");

var indexRouter = require("./routes/index");
var usersRouter = require("./routes/users");
var loginRouter = require("./routes/login");
const formRouter = require("./routes/forms");
const placeRouter = require("./routes/place");
const reciepieRouter = require("./routes/reciepie");
var app = express();

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "pug");
app.use(flash());
app.use(methodOverride("_method"));
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
  })
);
app.use(passport.initialize());
app.use(passport.session());

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

//setting up authentication

const initializePassport = require("./passport-config");
initializePassport(passport, async (username) => {
  const result = await asyncCon.query(
    `select * from user where username="${username}"`
  );
  stringifiedResult = JSON.parse(JSON.stringify(result));
  if (stringifiedResult[0]) {
    console.log(stringifiedResult[0].username);
    return stringifiedResult[0];
  } else {
    return null;
  }
});

//setting up the routers

app.use("/", indexRouter);
app.use("/login", loginRouter);
app.use("/users", usersRouter);
app.use("/forms", formRouter);
app.use("/place", placeRouter);
app.use("/reciepie", reciepieRouter);

//database debug code

const { asyncCon } = require("./db");
// database.query("select * from user", (err, result) => {
//   if (err) {
//     console.log("Error in my knowledge of node-mysql");
//     console.log(err);
//   }
//   console.log("No error?");
//   console.log(JSON.stringify(result));
// });

asyncCon
  .query("select * from user")
  .then(
    (results) => {
      console.log(JSON.stringify(results));
    },
    (err) => {
      return asyncCon.close().then(() => {
        throw err;
      });
    }
  )
  .catch((err) => {
    throw err;
  });

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
  res.render("error.ejs");
});

app.listen(3000, () => {
  console.log("The server is online!");
});
