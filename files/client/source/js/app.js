"use strict";

var buttonClick = require("./buttonclick");
var gameboyResize = require("./gameboyResize");
var powerOn = require("./poweron");

buttonClick.aandb();
gameboyResize.sizer();
powerOn.startUp();

var Tetris = require("./tetris/TetrisApplication");

var t = new Tetris();
t.init();
