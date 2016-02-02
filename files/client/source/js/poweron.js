function startUp() {
  var redled = document.querySelector(".power-led");

  window.addEventListener("load", function() {
    redled.style.opacity = "1";
  });
}

module.exports.startUp = startUp;
