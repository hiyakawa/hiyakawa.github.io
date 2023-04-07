"use strict";

let canvas = document.getElementsByTagName("canvas")[0];
let ctx = canvas.getContext("2d");
let cWidth = canvas.width;
let cHeight = canvas.height;

let pot = {};
pot.width = 100;
pot.height = 200;
pot.xPos = (cWidth - pot.width)/2;
pot.yPos = cHeight/3;
pot.img = new Image();
pot.img.src = "pot.png";

let bees = [];

for (let i = 0; i < 16; i++) {
    let bee = {};
    bees.push(bee);
}

let counter = 0;

for (let bee of bees) {
    bee.xPos = Math.random() * cWidth;
    bee.yPos = Math.random() * cHeight;
    bee.width = 60;
    bee.height = 80;
    bee.img = new Image();

    if (counter < 4) {
        bee.xPos = 0;
        bee.yPos = Math.random() * cHeight;
        bee.img.src = "bee2.png";
    }
    else if (counter < 8) {
        bee.xPos = Math.random() * cWidth;
        bee.yPos = 0;
        bee.img.src = "bee3.png";
    }
    else if (counter < 12) {
        bee.xPos = Math.random() * cWidth;
        bee.yPos = cHeight - bee.height;
        bee.img.src = "bee3.png";
    }
    else {
        bee.xPos = cWidth - bee.width;
        bee.yPos = Math.random() * cHeight;
        bee.img.src = "bee2.png";
    }
    counter++;
}

function main() {
    window.requestAnimationFrame(animate);
}

window.onload = main;

function animate() {
    erase();

    ctx.drawImage(pot.img, pot.xPos, pot.yPos, pot.width, pot.height);

    for (let bee of bees) {
        ctx.drawImage(bee.img, bee.xPos, bee.yPos, bee.width, bee.height);
    }

    for (let bee of bees) {
        let speed = 20;
        if (pot.xPos > bee.xPos) {
            bee.xPos += Math.random() * speed;
        }
        else {
            bee.xPos -= Math.random() * speed;
        }

        if (pot.yPos > bee.yPos) {
            bee.yPos += Math.random() * speed;
        }
        else {
            bee.yPos -= Math.random() * speed;
        }
    }

    gameOver();

    window.requestAnimationFrame(animate);
}

function erase() {
    ctx.fillStyle = "#f8f8f3";
    ctx.fillRect(0, 0, cWidth, cHeight);
}

function gameOver() {
    let distance;
    for (let bee of bees) {
        distance = Math.sqrt(Math.pow((pot.xPos - bee.xPos), 2) +
                   Math.pow((pot.yPos - bee.yPos), 2));

        if (distance < pot.width / 5) {
            window.cancelAnimationFrame(animate);
            window.location.href = "gameover.html";
        }
    }
}

function handleMove(e) {
    erase();
    ctx.drawImage(pot.img, e.x - pot.width/2, e.y - pot.height/2, pot.width, pot.height);
    pot.xPos = e.x - pot.width/2;
    pot.yPos = e.y- pot.height/2;
}

document.onmousemove = handleMove;