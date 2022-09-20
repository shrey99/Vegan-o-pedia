function formSubmitHandler(event) {
  let condition = false;
  $("form > div > input").each(function (index) {
    if ($(this).val().length != 0) {
      condition = true;
      return true;
    }
  });
  if (condition) {
    return true;
  }
  console.log("condition failed");
  $("#info").text("Please fill at least one field");
  event.preventDefault();
  return false;
}
