var express = require("express");
var router = express.Router();
const { asyncCon } = require("../db");

/* GET users listing. */
router.get("/", checkAuthenticated, async function (req, res, next) {
  const user = await req.user;
  const placeSearchResult = await asyncCon.query(
    `select * from place where(username = "${user.username}" )`
  );

  const reciepieSearchQuery = await asyncCon.query(
    `select * from reciepies where(username = "${user.username}")`
  );
  let dbObject = { success: null, error: null };
  if (req.query.success) {
    dbObject = { ...dbObject, success: req.query.success };
  } else if (req.query.error) {
    dbObject = { ...dbObject, error: req.query.error };
  }
  res.render("users", {
    name: user.username,
    ...dbObject,
    queryPlaceObject: placeSearchResult,
    placeCount: placeSearchResult.length,
    reciepieSearchQuery: reciepieSearchQuery,
  });
});

router.get("/chat", (req, res) => {
  res.render("chat.pug");
});

function checkAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  return res.redirect("/");
}

module.exports = router;
