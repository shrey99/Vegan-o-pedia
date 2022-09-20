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
    res.render("search/place", { queryResult: null, ...user });
  } else {
    const items = req.query;
    let sqlQuery = "";
    if (req.query.item === "") {
      sqlQuery = `select * from place where(${
        items.placeName !== "" ? `placeName="${items.placeName}" and` : ""
      } ${items.road !== "" ? `road="${items.road}" and` : ""} ${
        items.city !== "" ? `city="${items.city}" and` : ""
      } ${items.state !== "" ? `state="${items.state}" and` : ""} ${
        items.pincode !== "" ? `pincode="${items.pincode}" and` : ""
      } 0=0)`;
    } else {
      sqlQuery = `select * from place inner join place_food on place_food.placeName = place.placeName where(${
        items.placeName !== "" ? `placeName="${items.placeName}" and` : ""
      } ${items.road !== "" ? `road="${items.road}" and` : ""} ${
        items.city !== "" ? `city="${items.city}" and` : ""
      } ${items.state !== "" ? `state="${items.state}" and` : ""} ${
        items.pincode !== "" ? `pincode="${items.pincode}" and` : ""
      } ${items.item !== "" ? `food_name="${items.item}" and` : ""} 0=0)`;
    }
    const queryResult = await asyncCon.query(sqlQuery);
    res.render("search/place", { queryResult: queryResult, ...user });
  }
});

router.get("/:placeName", async (req, res) => {
  let user = { username: null };
  let didUserComment = false;
  let userObj = {};
  const isAuth = req.isAuthenticated();
  if (isAuth) {
    user = await req.user;
    const dbUserCommentSql = `select * from comment_place where(username="${user.username}" and placeName="${req.params.placeName}")`;
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
  const placeName = req.params.placeName;
  const dbPlaceSql = `select * from place where(placeName="${placeName}")`;
  const dbFoodItemsSql = `select * from place_food where(placeName="${placeName}")`;
  const dbCommentSql = `select * from comment_place where(placeName="${placeName}")`;

  const dbPlaceResponse = await asyncCon.query(dbPlaceSql);
  const dbFoodResponse = asyncCon.query(dbFoodItemsSql);
  const dbCommentResponse = asyncCon.query(dbCommentSql);
  console.log(didUserComment);
  res.render("place", {
    dbPlaceResponse: dbPlaceResponse[0],
    dbFoodResponse: await dbFoodResponse,
    dbCommentResponse: await dbCommentResponse,
    name: user.username,
    isAuth: isAuth,
    ...userObj,
  });
});

router.post("/:placeName/comment", checkAuthenticated, async (req, res) => {
  const user = await req.user;
  const addCommentSql = `insert into comment_place(username,placeName,commentPlace,rating) values("${user.username}","${req.params.placeName}","${req.body.comment}","${req.body.rating}")`;
  const dbPlaceSql = `select * from place where(placeName="${req.params.placeName}")`;
  const dbPlaceResponse = await asyncCon.query(dbPlaceSql);
  let commentNum = parseInt(dbPlaceResponse[0].commentNum) + 1;
  let rating =
    (parseFloat(dbPlaceResponse[0].rating) * (commentNum - 1) +
      parseFloat(req.body.rating)) /
    commentNum;
  console.log(rating);
  console.log(commentNum);
  await asyncCon.query(
    `update place set rating=${
      Math.round(rating) == 0 ? 1 : Math.round(rating)
    }, commentNum=${Math.round(commentNum)} where(placeName="${
      req.params.placeName
    }")`
  );
  const dbResponse = await asyncCon.query(addCommentSql);
  res.redirect("/place/" + req.params.placeName);
});

router.put("/:placeName/comment", checkAuthenticated, async (req, res) => {
  const user = await req.user;
  const dbPlaceSql = `select * from place where(placeName="${req.params.placeName}")`;
  const dbPlaceResponse = await asyncCon.query(dbPlaceSql);
  const oldComment = await asyncCon.query(
    `select * from comment_place where(placeName="${req.params.placeName}" and username="${user.username}")`
  );
  let rating =
    (parseFloat(dbPlaceResponse[0].rating) *
      (dbPlaceResponse[0].commentNum - 1) +
      parseFloat(req.body.rating) -
      parseFloat(oldComment[0].rating)) /
    dbPlaceResponse[0].commentNum;
  console.log(rating);
  await asyncCon.query(
    `update place set rating=${
      Math.round(rating) == 0 ? 1 : Math.round(rating)
    } where(placeName="${req.params.placeName}")`
  );
  const commentUpdateSql = `update comment_place set commentPlace="${req.body.comment}",rating=${req.body.rating} where(username="${user.username}" and placeName="${req.params.placeName}")`;
  try {
    await asyncCon.query(commentUpdateSql);
  } catch (err) {
    console.log(err);
    res.redirect(`/place/${req.params.placeName}`);
  }
  console.log(commentUpdateSql);
  res.redirect(`/place/${req.params.placeName}`);
});

//edit routes

router.get("/:placeName/edit", checkAuthenticated, async (req, res) => {
  const user = await req.user;
  const placeSql = `select * from place where(placeName = "${req.params.placeName}")`;
  const itemsSql = `select food_name from place_food where(placeName = "${req.params.placeName}")`;
  try {
    const placeDetails = await asyncCon.query(placeSql);
    const itemDetails = asyncCon.query(itemsSql);
    res.render("forms/place_edit.pug", {
      placeDetails: placeDetails[0],
      itemDetails: await itemDetails,
      name: user.username,
    });
  } catch (err) {
    console.log(err);
    res.redirect("/users");
  }
});

router.put("/:placeName/edit", checkAuthenticated, async (req, res) => {
  console.log(req.body);
  let error = false;
  let sqlUpdateQuery = "update place set ";
  const propArray = [];
  const itemArray = [];
  for (const key in req.body) {
    if (key[0] == "f") continue;
    if (key[0] == "i") {
      itemArray.push(
        req.body[key][0] == "" ? req.body[key][1] : req.body[key][0]
      );
    } else {
      if (req.body[key] != "" && req.body[key] != "0") {
        propArray.push([key, req.body[key]]);
      }
    }
  }
  console.log(itemArray);
  if (propArray.length > 0) {
    sqlUpdateQuery += `${propArray[0][0]}="${propArray[0][1]}"`;
    propArray.splice(0, 1);
    propArray.forEach((element) => {
      console.log(element);
      sqlUpdateQuery += `,${element[0]}="${element[1]}"`;
    });
  }
  sqlUpdateQuery += ` where (placeName="${req.params.placeName}")`;
  console.log(sqlUpdateQuery);
  try {
    await asyncCon.query(sqlUpdateQuery);
  } catch (err) {
    console.log(err);
    error = true;
  }
  try {
    const deleteSql = `delete from place_food where (placeName="${req.params.placeName}")`;
    await asyncCon.query(deleteSql);
    const promises = itemArray.map((element) => {
      let itemSql = `insert into place_food(food_name,placeName) values("${element}","${req.params.placeName}")`;
      return asyncCon.query(itemSql);
    });
    Promise.all(promises);
  } catch (err) {
    error = true;
    console.log(err);
  }
  let query = "";
  if (error) {
    query = querystring.stringify({
      error: "Few Items where not updated",
    });
  } else {
    query = querystring.stringify({
      success: "Successfully Updated the place",
    });
  }
  res.redirect("/users?" + query);
});

router.delete("/:placeName", checkAuthenticated, async (req, res) => {
  const sqlComments = `delete from comment_place where(placeName="${req.params.placeName}")`;
  const sqlFood = `delete from place_food where(placeName="${req.params.placeName}")`;
  const sqlPlace = `delete from place where(placeName="${req.params.placeName}")`;
  try {
    const removeFromDependentTable = [
      asyncCon.query(sqlComments),
      asyncCon.query(sqlFood),
    ];
    Promise.all(removeFromDependentTable);
  } catch (err) {
    console.log(err);
    console.log("error in removing from dependent table");
    const query = querystring.stringify({
      error: "Failed to delete the place",
    });
    res.redirect("/users?" + query);
  }
  try {
    await asyncCon.query(sqlPlace);
    const query = querystring.stringify({
      success: "Successfully deleted the place",
    });
    res.redirect("/users?" + query);
  } catch (err) {
    console.log(err);
    const query = querystring.stringify({
      error: "Failed to deleted the place",
    });
    res.redirect("/users?" + query);
  }
});

function checkAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  return res.redirect("/");
}

module.exports = router;
