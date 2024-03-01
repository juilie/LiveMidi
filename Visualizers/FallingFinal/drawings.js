import * as eventHandler from '../../configurator/eventHandler.js';

const canvas = document.getElementById("myCanvas");
const ctx = canvas?.getContext("2d");

const img = document.getElementById("ctLogo");
let test = []

export const functions = {
    notePlayed: notePlayed
}

eventHandler.startMIDI(functions);

function normalize(min, max, val) {
    return (val - min) / (max - min)
}

function bounce(width, height, x, y, type) {
    this.type = type;
    this.width = width;
    this.height = height;
    this.x = normalize(11, 121, x) * innerWidth;
    this.y = y;
    this.speedX = 0;
    this.speedY = 0;
    this.gravity = 0.6;
    this.gravitySpeed = 0;
    this.bounce = 0.4;
    this.update = function (ctx) {
        ctx.drawImage(img, this.x, this.y, this.width, this.height)
    }
    this.newPos = function (ctx) {
        this.gravitySpeed += this.gravity;
        this.x += this.speedX;
        this.y += this.speedY + this.gravitySpeed;
        this.hitBottom(ctx);
    }
    this.hitBottom = function (ctx) {
        var rockbottom = ctx.canvas.height - this.height;
        if (this.y > rockbottom) {
            this.y = rockbottom;
            this.gravitySpeed = -(this.gravitySpeed * this.bounce);
        }
    }
}

function draw() {
    ctx.canvas.width = window.innerWidth
    ctx.canvas.height = window.innerHeight

    ctx.fillStyle = 'rgba(0,0,0,1.0)';
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    test.forEach(noteTest => {
        noteTest.newPos(ctx)
        noteTest.update(ctx)
    });

    window.requestAnimationFrame(draw)
}

export function notePlayed() {
    test.push(new bounce(30, 40, 50, 0))
}

canvas && draw();

export {
    default as config
}
from './config.js';