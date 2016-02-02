function setGameboySize() {
  var windowHeight = window.innerHeight;
  var gameboy = document.querySelector(".gameboy-main");

  var calculateZoom = windowHeight/(gameboy.clientHeight + 35);
  gameboy.style.transform = "scale(" + calculateZoom + ")";

}

function sizer() {
    window.addEventListener("load", setGameboySize);
    window.addEventListener("resize", setGameboySize);
}

module.exports.sizer = sizer;
