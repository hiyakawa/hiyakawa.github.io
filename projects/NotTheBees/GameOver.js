"use strict";

let canvas = document.getElementsByTagName("canvas")[0];
let ctx = canvas.getContext("2d");
let cWidth = canvas.width;
let cHeight = canvas.height;

let frame = {};
frame.width = 418;
frame.height = 640;
frame.xPos = (cWidth - frame.width) / 2;
frame.yPos = (cHeight - frame.height) / 2;
frame.img = new Image();
frame.img.src = "frame2.webp";
frame.img.onload = function() {
    ctx.font = "30px Georgia";
    ctx.fillText("CLICK",   (cWidth/2)-42, (cHeight/2)-60);
    ctx.fillText("TO",      (cWidth/2)-17, (cHeight/2)-20);
    ctx.fillText("RESTART", (cWidth/2)-63, (cHeight/2)+20);
    ctx.fillText("GAME",    (cWidth/2)-40, (cHeight/2)+60);
}

function main() {
    document.body.style.backgroundColor = "#f8f8f3";
    ctx.drawImage(frame.img, frame.xPos, frame.yPos, frame.width, frame.height);
}

window.onload = main;

function handleClick(e) {
    window.location.href = "index.html";
}

document.onclick = handleClick;