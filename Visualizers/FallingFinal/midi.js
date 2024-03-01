let note, velocity, statusByte;


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
        console.log(statusByte, note, velocity);
        var color = statusByte == 153 ? "pink" : "blue"
        test.push(new bounce(30, 40, color, note, 0))
    }
}



window.addEventListener('keydown', function (e) {
    getMIDIMessage({
        data: [144, 60, 127]
    })
});