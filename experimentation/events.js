// const actions = {
//     'noteOn': {
//         'channel1': () => console.log("noteOn ch1"),
//         'channel2': () => console.log("hello 2"),
//         // Add more channels and corresponding actions
//     },
//     'controlChange': {
//         'channel1': (value) => console.log(value),
//         // Add more channels and corresponding actions
//     }
//     // Add more MIDI event types if needed
// };

let config;

const storedConfig = JSON.parse(localStorage.getItem('midiVisualizerSettings'));
console.log(storedConfig);

function handleMidiEvent(midiEvent) {
    const eventType = midiEvent.type;
    const channel = `channel${midiEvent.channel}`;
    const action = storedConfig.events[eventType][channel] ? storedConfig.events[eventType][channel] : null;

    if (action) {
        if (midiEvent.type === 'controlChange') {
            // action(midiEvent.value); // Pass control change value if needed
        } else {
            config[action.func](...action.params);
        }
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

// startMIDI();

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

    if (statusByte > 128 && statusByte < 143){
        midiFunction = "noteOff";
        midiChannel = statusByte - 128;
    } else if (statusByte > 143 && statusByte < 159) {
        midiFunction = "noteOn";
        midiChannel = statusByte - 143;
    } else if (statusByte > 175 && statusByte < 191) {
        midiFunction = "controlChange";
        midiChannel = statusByte - 175;
    }

    handleMidiEvent({
        type: midiFunction,
        channel: midiChannel,
        note: note,
        value: velocity,
    });
}

window.addEventListener('keydown', function (e) {
    getMIDIMessage({
        data: [144, 60, 127]
    })
});