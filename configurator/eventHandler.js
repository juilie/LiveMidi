let config;

const storedConfig = JSON.parse(localStorage.getItem('midiVisualizerSettings'));

function handleMidiEvent(midiEvent) {
    const eventType = midiEvent.type;
    const channel = `channel${midiEvent.channel}`;
    const action = storedConfig.events[eventType][channel] ? storedConfig.events[eventType][channel] : null;

    if (action) {
            config[action.func](...action.params, midiEvent);
    }
}

if (navigator.requestMIDIAccess) {
    console.log('This browser supports WebMIDI!');
} else {
    console.log('WebMIDI is not supported in this browser.');
}

export function startMIDI(sketchConfig) {
    config = sketchConfig;
    navigator.requestMIDIAccess()
        .then(onMIDISuccess, onMIDIFailure);
}

function onMIDISuccess(midiAccess) {
    for (var input of midiAccess.inputs.values()) {
        input.onmidimessage = getMIDIMessage;
    }
}

function onMIDIFailure() {
    console.log('Could not access your MIDI devices.');
}

function getMIDIMessage(midiMessage) {
    let velocity = midiMessage.data[2];
    let note = midiMessage.data[1];
    let statusByte = midiMessage.data[0];

    let midiFunction = "";
    let midiChannel;

    if (statusByte > 127 && statusByte < 144){
        midiFunction = "noteOff";
        midiChannel = statusByte - 127;
    } else if (statusByte > 143 && statusByte < 159) {
        midiFunction = "noteOn";
        midiChannel = statusByte - 143;
    } else if (statusByte > 175 && statusByte < 191) {
        midiFunction = "controlChange";
        midiChannel = statusByte - 175;
    }

midiFunction &&
    handleMidiEvent({
        type: midiFunction,
        channel: midiChannel,
        note: note,
        value: velocity,
    });
}

// window.addEventListener('keydown', function (e) {
//     getMIDIMessage({
//         data: [144, 60, 127]
//     })
// });