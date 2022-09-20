$("#login-button").click(() => {
  $("#login-form").css({ display: "inline-block" });
  $("#login-form").removeClass("fadeOut");
  $("#login-form").addClass("fadeIn");
});
$("#register-button").click(() => {
  $("#register-form").css({ display: "inline-block" });
  $("#register-form").removeClass("fadeOut");
  $("#register-form").addClass("fadeIn");
});
$("#register-form .close-svg").click(() => {
  $("#password-correction").css({ display: "none" });
  $("#register-form").removeClass("fadeIn");
  $("#register-form").addClass("fadeOut");
  setTimeout(() => {
    $("#register-form").css({ display: "none" });
  }, 500);
});
$("#login-form .close-svg").click(() => {
  $("#password-correction").css({ display: "none" });
  $("#login-form").removeClass("fadeIn");
  $("#login-form").addClass("fadeOut");
  setTimeout(() => {
    $("#login-form").css({ display: "none" });
  }, 500);
});

$("#logout-button").click(() => {
  console.log("request sent");
  fetch("/login/logout?_method=DELETE", { method: "POST" }).then(() => {
    document.location.reload();
    return false;
  });
});

function onSubmitHandlerPassword(event) {
  const passRegexChar = new RegExp("[A-Za-z]+");
  const passRegexNum = new RegExp("[0-9]+");
  const pass = $("#register-password").val();
  if (passRegexChar.test(pass) && passRegexNum.test(pass) && pass.length >= 8) {
    return true;
  } else {
    event.preventDefault();
    $("#passwordMessage").html(
      "The password must be </br> 8 characters and contain </br>one alphabet and number"
    );
    $("#password-correction").css({ display: "inline-block" });
    return false;
  }
}
