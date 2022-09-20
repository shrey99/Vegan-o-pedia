function formSubmitHandler(event) {
  let condition = false;
  $("form > div > input").each(function (index) {
    if ($(this).val().length != 0) {
      condition = true;
      return true;
    }
  });
  if ($("form > div > select").val() != 0) {
    condition = true;
    return true;
  }
  if (condition) {
    return true;
  }
  $("#info").text("Please fill at least one field");
  event.preventDefault();
  return false;
}
