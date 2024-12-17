let note, velocity, statusByte;

test = []

const canvas = document.getElementById("myCanvas");
const ctx = canvas.getContext("2d");

if (navigator.requestMIDIAccess) {
    console.log('This browser supports WebMIDI!');
} else {
    console.log('WebMIDI is not supported in this browser.');
}

navigator.requestMIDIAccess()
    .then(onMIDISuccess, onMIDIFailure);

function onMIDISuccess(midiAccess) {
    // console.log(midiAccess);
    // var inputs = midiAccess.inputs;
    // var outputs = midiAccess.outputs;

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
        console.log(statusByte, note, velocity);
        var color = statusByte == 153 ? "pink" : "blue"
        test.push(new bounce(50, 70, color, note, 0))
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

draw()