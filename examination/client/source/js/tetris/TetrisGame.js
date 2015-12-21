"use strict";

/**
 * To create this module I have read the following guide:
 * http://gamedevelopment.tutsplus.com/tutorials/implementing-tetris-collision-detection--gamedev-852
 */

function TetrisGame(element) {
    this.element = element;
    this.field = [];
}

TetrisGame.prototype.init = function() {
    this.initField();

    this.print();
    this.render();
};

TetrisGame.prototype.render = function() {
    // Change the classes to render the blocks to user
    var trs = this.element.querySelectorAll("tr");
    var tds;
    for (var row = 0; row < this.field.length; row += 1) {
        tds = trs[row].querySelectorAll("td");
        for (var col = 0; col < this.field[row].length; col += 1) {
            if (this.field[row][col] === 1) {
                //should render class for block here
                tds[col].classList.add("tetris-block-part");
            }
        }
    }
};

TetrisGame.prototype.print = function() {
    //print the chat-template to this.element
    var template = document.querySelector("#template-tetris-application").content.cloneNode(true);

    var frag = document.createDocumentFragment();
    var tr;
    var td;

    for (var row = 0; row < this.field.length; row += 1) {
        tr = document.createElement("tr");
        for (var col = 0; col < this.field[row].length; col += 1) {
            td = document.createElement("td");
            tr.appendChild(td);
        }
        frag.appendChild(tr);
    }

    template.querySelector(".tetris-grid-body").appendChild(frag);

    this.element.querySelector(".window-content").appendChild(template);
};

TetrisGame.prototype.initField = function() {
    this.field = [
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 1, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
    ];
};

module.exports = TetrisGame;