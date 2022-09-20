$("#restaurants-button").click(function () {
  console.log("here");
  $(".places-container").css({ transform: "translateX(0)" });
  $(".recipies-container").css({ transform: "translateX(100%)" });
});

$("#reciepies-button").click(function () {
  $(".recipies-container").css({ transform: "translateX(0)" });
  $(".places-container").css({ transform: "translateX(-100%)" });
});

$("#restaurants-button").click(function () {
  $("#restaurants-button").addClass("active");
  $("#reciepies-button").removeClass("active");
});

$("#reciepies-button").click(function () {
  $("#reciepies-button").addClass("active");
  $("#restaurants-button").removeClass("active");
});
