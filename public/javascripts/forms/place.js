let value = 0;
let i = 1;
$("#food-options-button").click(() => {
  value = value + parseInt($("#food-options").val());
  if (value <= 0) {
    let p = document.createElement("p");
    p.classList.add("errorMessages");
    p.innerHTML = "You can't add less then 1 items!";
    $("body").prepend(p);
    value = value - parseInt($("#food-options").val());
    return;
  }
  for (; i < value + 1; i++) {
    let div = document.createElement("div");
    let label = document.createElement("label");
    let input = document.createElement("input");
    input.type = "text";
    input.name = `item${i}`;
    input.placeholder = `food item ${i}`;
    label.for = "item" + i;
    label.innerHTML = `Food Item ${i}`;
    div.appendChild(label);
    div.appendChild(input);
    document.getElementById("food-container").appendChild(div);
  }
});

function formSubmitHandler(event) {
  let submitFlag = true;
  let error = "";
  const pincodeRegex = new RegExp("[0-9]{6}");
  const urlRegex = new RegExp(
    "https?://(www.)?[-a-zA-Z0-9@:%._+~#=]{1,256}.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)"
  );
  const url = $(`input[name="photo"]`).val();
  const pincode = $(`input[name="pincode"]`).val();
  console.log(url);
  if (!urlRegex.test(url) && url.length != 0) {
    error = "Please enter a valid url for the photo";
    submitFlag = true;
  } else if (!pincodeRegex.test(pincode)) {
    error = "Please enter a valid pincode";
    submitFlag = false;
  }
  if (submitFlag) return true;
  else {
    event.preventDefault();
    let p = document.createElement("p");
    p.classList.add("errorMessages");
    p.innerHTML = error;
    $("body").prepend(p);
    return false;
  }
}
