let note, velocity, statusByte;

let fallingLogos = []

const canvas = document.createElement("canvas");
document.body.appendChild(canvas)
const ctx = canvas.getContext("2d");

if (navigator.requestMIDIAccess) {
    console.log('This browser supports WebMIDI!');
} else {
    console.log('WebMIDI is not supported in this browser.');
}

navigator.requestMIDIAccess()
    .then(onMIDISuccess, onMIDIFailure);

function onMIDISuccess(midiAccess) {
    for (var input of midiAccess.inputs.values()) {
        input.onmidimessage = getMIDIMessage;
    }
}

function onMIDIFailure() {
    console.log('Could not access your MIDI devices.');
}

function getMIDIMessage(midiMessage) {
    velocity = midiMessage.data[2];
    note = midiMessage.data[1];
    statusByte = midiMessage.data[0];

    if (statusByte >= 144 && statusByte <= 159 && statusByte !== 254) {
        var color = statusByte == 153 ? "pink" : "blue"
        fallingVisualizer.midiEvent_createBouncer(color, note)
    }
}

const fallingVisualizer = {
    draw: function draw() {
        ctx.canvas.width = window.innerWidth
        ctx.canvas.height = window.innerHeight
    
        ctx.fillStyle = 'rgba(0,0,0,1.0)';
        ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    
        fallingLogos.forEach(noteTest => {
            noteTest.newPos(ctx)
            noteTest.update(ctx)
        });
    
        window.requestAnimationFrame(draw)
    },

    bouncer: function bounce(width, height, color, x, y, noteRange) {
        this.width = width;
        this.height = height;
        this.normalize = function normalize(min, max, val) {
            return (val - min) / (max - min);
        }
        this.x = this.normalize(noteRange[0], noteRange[1], x) * innerWidth;
        this.y = y;    
        this.speedX = 0;
        this.speedY = 0;    
        this.gravity = 0.6;
        this.gravitySpeed = 0;
        this.bounce = 0.4;
        this.update = function(ctx) {
            ctx.fillStyle = color;
            ctx.drawImage(img, this.x, this.y, this.width, this.height)
        }
    
        this.newPos = function(ctx) {
            this.gravitySpeed += this.gravity;
            this.x += this.speedX;
            this.y += this.speedY + this.gravitySpeed;
            this.hitBottom(ctx);
        }
        this.hitBottom = function(ctx) {
            var rockbottom = ctx.canvas.height - this.height;
            if (this.y > rockbottom) {
                this.y = rockbottom;
                this.gravitySpeed = -(this.gravitySpeed * this.bounce);
            }
        }
    },

    range_NoteRange: [0, 127],

    midiEvent_createBouncer: function createBouncer(color, note) {
        this.fallingLogos.push(new this.bouncer(30, 40, color, note, 0, this.range_NoteRange))
    },

    fallingLogos: [],

    initialize: function initialize() {
        this.fallingLogos = [];

    }
}

const img = document.getElementById("ctLogo");

// window.onload = fallingVisualizer.draw();

export default fallingVisualizer;