var express = require("express");
const querystring = require("querystring");
var router = express.Router();
const { asyncCon } = require("../db");

//get request for searching

router.get("/search", async (req, res) => {
  let user = { name: null };
  const isAuth = req.isAuthenticated();
  if (isAuth) {
    let reqUser = await req.user;
    user = { name: reqUser.username };
  }
  if (Object.keys(req.query).length == 0) {
    res.render("search/reciepie", { queryResult: null, ...user });
  } else {
    const items = req.query;
    let sqlQuery = "";
    sqlQuery = `select * from reciepies where(${
      items.reciepies_name !== ""
        ? `reciepies_name="${items.reciepies_name}" and`
        : ""
    }  ${items.rating != "0" ? `rating="${items.rating}" and` : ""} 0=0)`;
    console.log(sqlQuery);
    const queryResult = await asyncCon.query(sqlQuery);
    console.log(queryResult);
    res.render("search/reciepie", { queryResult: queryResult, ...user });
  }
});

router.get("/:reciepies_name", async (req, res) => {
  let user = { username: null };
  let didUserComment = false;
  let userObj = {};
  const isAuth = req.isAuthenticated();
  if (isAuth) {
    user = await req.user;
    const dbUserCommentSql = `select * from comment_recipies where(username="${user.username}" and reciepies_name="${req.params.reciepies_name}")`;
    try {
      const dbUserCommentResponse = await asyncCon.query(dbUserCommentSql);
      if (dbUserCommentResponse.length > 0) {
        didUserComment = true;
        userObj = {
          dbUserCommentResponse: dbUserCommentResponse[0],
          didUserComment: didUserComment,
        };
      }
    } catch (err) {
      console.log(err);
    }
  }
  const reciepies_name = req.params.reciepies_name;
  const dbReciepiesSql = `select * from reciepies where(reciepies_name="${reciepies_name}")`;
  const dbCommentSql = `select * from comment_recipies where(reciepies_name="${reciepies_name}")`;
  console.log(dbReciepiesSql);
  const dbReciepiesResponse = await asyncCon.query(dbReciepiesSql);
  const dbCommentResponse = await asyncCon.query(dbCommentSql);
  console.log(dbCommentResponse);
  res.render("reciepie", {
    dbReciepiesResponse: dbReciepiesResponse[0],
    dbCommentResponse: await dbCommentResponse,
    name: user.username,
    isAuth: isAuth,
    ...userObj,
  });
});

router.post(
  "/:reciepies_name/comment",
  checkAuthenticated,
  async (req, res) => {
    const user = await req.user;
    const addCommentSql = `insert into comment_recipies(username,reciepies_name,commentRecipies,rating) values("${user.username}","${req.params.reciepies_name}","${req.body.comment}","${req.body.rating}")`;
    const dbReciepiesSql = `select * from reciepies where(reciepies_name="${req.params.reciepies_name}")`;
    const dbReciepiesResponse = await asyncCon.query(dbReciepiesSql);
    let commentNum = parseInt(dbReciepiesResponse[0].commentNum) + 1;
    let rating =
      (parseFloat(dbReciepiesResponse[0].rating) * (commentNum - 1) +
        parseFloat(req.body.rating)) /
      commentNum;
    console.log(rating);
    console.log(commentNum);
    await asyncCon.query(
      `update reciepies set rating=${
        Math.round(rating) <= 0 ? 1 : Math.round(rating)
      }, commentNum=${Math.round(commentNum)} where(reciepies_name="${
        req.params.reciepies_name
      }")`
    );
    const dbResponse = await asyncCon.query(addCommentSql);
    res.redirect("/reciepie/" + req.params.reciepies_name);
  }
);

router.put("/:reciepies_name/comment", checkAuthenticated, async (req, res) => {
  const user = await req.user;
  const dbReciepieSql = `select * from reciepies where(reciepies_name="${req.params.reciepies_name}")`;
  const dbReciepieResponse = await asyncCon.query(dbReciepieSql);
  const oldComment = await asyncCon.query(
    `select * from comment_recipies where(reciepies_name="${req.params.reciepies_name}" and username="${user.username}")`
  );
  let rating =
    (parseFloat(dbReciepieResponse[0].rating) *
      dbReciepieResponse[0].commentNum +
      parseFloat(req.body.rating) -
      parseFloat(oldComment[0].rating)) /
    dbReciepieResponse[0].commentNum;
  console.log(rating);
  await asyncCon.query(
    `update reciepies set rating=${
      Math.round(rating) <= 0 ? 1 : Math.round(rating)
    } where(reciepies_name="${req.params.reciepies_name}")`
  );
  const commentUpdateSql = `update comment_recipies set commentRecipies="${req.body.comment}",rating=${req.body.rating} where(username="${user.username}" and reciepies_name="${req.params.reciepies_name}")`;
  try {
    await asyncCon.query(commentUpdateSql);
  } catch (err) {
    console.log(err);
    res.redirect(`/reciepie/${req.params.reciepies_name}`);
  }
  console.log(commentUpdateSql);
  res.redirect(`/reciepie/${req.params.reciepies_name}`);
});
router.delete("/:reciepies_name", checkAuthenticated, async (req, res) => {
  const sqlComments = `delete from comment_recipies where(reciepies_name="${req.params.reciepies_name}")`;
  const sqlReciepe = `delete from reciepies where(reciepies_name="${req.params.reciepies_name}")`;
  let query = "";
  try {
    await asyncCon.query(sqlComments);
    await asyncCon.query(sqlReciepe);
  } catch (err) {
    console.log(err);
    query = querystring.stringify({
      error: "Can not delete recipie",
    });
  }
  console.log(query);
  if (query == "") {
    query = querystring.stringify({
      success: "reciepie deleted successfully",
    });
  }
  console.log(query);
  res.redirect("/users?" + query);
});

function checkAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  return res.redirect("/");
}

module.exports = router;
