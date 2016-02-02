function aandb() {
  var abutton = document.querySelector(".a-button");
  var bbutton = document.querySelector(".b-button");
  var start = document.querySelector(".start");
  var updown = document.querySelector(".up-down-btn");
  var left = document.querySelector(".left-part");
  var right = document.querySelector(".right-part");
  var up = document.querySelector(".up-part");
  var down = document.querySelector(".down-part");
  var leftright = document.querySelector(".left-right-btn");
  var shadowDown = "0px 0px 0px 0px rgba(160, 0, 20, 1)";

  function buttonColor(upordown) {
    return "10px solid rgba(87, 71, 71, " + upordown + ")";
  }

  function abColor(upordown) {
    return "rgba(87, 71, 71, " + upordown + ")";
  }

  function shadowColor(up) {
    return "" + up + "px 3px 0px 0px rgba(160, 0, 20, 1)";
  }


  window.addEventListener("keydown", function(event) {

    switch (event.keyCode) {
      case 40:
        down.style.boxShadow = shadowDown;
        updown.children[2].style.borderTop = buttonColor(0.85);
        break;

      case 38:
        up.style.boxShadow = shadowDown;
        updown.children[0].style.borderBottom = buttonColor(0.85);
        break;

      case 39:
        right.style.boxShadow = shadowDown;
        leftright.children[1].style.borderLeft = buttonColor(0.85);
        break;

      case 37:
        left.style.boxShadow = shadowDown;
        leftright.children[0].style.borderRight = buttonColor(0.85);
        break;

      case 13:
        start.classList.add("start-button-no-shadow");
        break;

      case 66:
        bbutton.classList.add("b-button-no-shadow");
        bbutton.firstElementChild.style.color = abColor(0.85);
        break;

      case 65:
        abutton.classList.add("a-button-no-shadow");
        abutton.firstElementChild.style.color = abColor(0.85);
        break;
    }

  });

  window.addEventListener("keyup", function(event) {

    switch (event.keyCode) {
      case 40:
        down.style.boxShadow = shadowColor(2);
        updown.children[2].style.borderTop = buttonColor(0.55);
        break;

      case 38:
        up.style.boxShadow = shadowColor(4);
        updown.children[0].style.borderBottom = buttonColor(0.55);
        break;

      case 39:
        right.style.boxShadow = shadowColor(2);
        leftright.children[1].style.borderLeft = buttonColor(0.55);
        break;

      case 37:
        left.style.boxShadow = shadowColor(3);
        leftright.children[0].style.borderRight = buttonColor(0.55);
        break;

      case 13:
        start.classList.remove("start-button-no-shadow");
        break;

      case 66:
        bbutton.classList.remove("b-button-no-shadow");
        bbutton.firstElementChild.style.color = abColor(0.55);
        break;

      case 65:
        abutton.classList.remove("a-button-no-shadow");
        abutton.firstElementChild.style.color = abColor(0.55);
        break;
    }

  });

}

module.exports.aandb = aandb;
