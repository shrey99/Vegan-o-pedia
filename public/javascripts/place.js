let editButtonFlag = true;
$("#edit-button").on("click", () => {
  if (editButtonFlag) {
    $("#edit-form").removeClass("fadeOut");
    $("#edit-form").addClass("fadeIn");
    $("#edit-form").css({ display: "inline-block" });
    editButtonFlag = !editButtonFlag;
  } else {
    $("#edit-form").removeClass("fadeIn");
    $("#edit-form").addClass("fadeOut");
    setTimeout(() => {
      $("#edit-form").css({ display: "none" });
    }, 500);
    editButtonFlag = !editButtonFlag;
  }
});
