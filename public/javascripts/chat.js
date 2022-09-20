$(".users").on("click", function () {
  console.log("here");
  const user = $(this).text();
  $("#current-user").text(user);
});

$("#send-button").click("click", function () {
  console.log("here");
  alert(`message sent ${$("#message").val()}`);
});
