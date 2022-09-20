var express = require("express");
var router = express.Router();
const flash = require("express-flash");
const { asyncCon, con } = require("../db");
const bcrypt = require("bcrypt");

router.use(flash());

//setting up passport
//passport setup
const passport = require("passport");

// const initializePassport = require("../passport-config");
// initializePassport(passport, async (username) => {
//   const result = await asyncCon.query(
//     `select * from user where username="${username}"`
//   );
//   stringifiedResult = JSON.parse(JSON.stringify(result));
//   if (stringifiedResult[0]) {
//     console.log(stringifiedResult[0].username);
//     return stringifiedResult[0];
//   } else {
//     return null;
//   }
// });

router.post("/register", async (req, res) => {
  const hashedPassword = await bcrypt.hash(req.body.password, 10);
  sql = `insert into user values("${req.body.username}","${hashedPassword}")`;
  try {
    await asyncCon.query(sql);
    res.redirect(`/?success=you are successfully registered`);
  } catch (err) {
    console.log(err);
    res.redirect(`/?error=Registration failed. try another username`);
  }
});

router.post(
  "/login",
  passport.authenticate("local", {
    successRedirect: "/users",
    failureRedirect: "/",
    failureFlash: true,
  })
);

router.delete("/logout", (req, res) => {
  req.logout();
  res.redirect("/");
});

module.exports = router;
