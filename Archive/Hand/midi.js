let note, velocity, statusByte;

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
    console.log(statusByte, note, velocity);

    if (statusByte >= 144 && statusByte <= 159 && statusByte !== 254) {

        switch (statusByte) {
            case 146:
                break;
            case 147:
                break;
        
            default:
                break;
        }
    }
}