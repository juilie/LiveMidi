import * as vizImport from '../Visualizers/index.js';

let visualizers = {};
let listeningFunction = null;

window.addEventListener('DOMContentLoaded', () => {
    const messageViewer = document.getElementById('MIDIMessage');

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
        let velocity = midiMessage.data[2];
        let note = midiMessage.data[1];
        let statusByte = midiMessage.data[0];
    
        if (statusByte !== 254 && statusByte >= 144) {
            messageViewer.innerText = `Status: ${statusByte} Note: ${note} Velocity: ${velocity}`
            listeningFunction.innerText = `Status: ${statusByte} Note: ${note} Velocity: ${velocity}`;
            listeningFunction = null;
        }
    }    
})

// Add all visualizers to the visualizers object
Object.entries(vizImport).forEach(([name, exported]) => visualizers[name] = Object.keys(exported));

// Create the visualizer selection dropdown
const visualizerSelection = document.createElement('select');
visualizerSelection.id = 'visualizerSelection';


Object.keys(visualizers).forEach(visualizer => {
    const option = document.createElement('option');
    option.value = visualizer;
    option.innerText = visualizer;
    visualizerSelection.appendChild(option);
});

document.body.appendChild(visualizerSelection);

// Expose functions to configure
const functionSelector = document.createElement('select');
visualizers[visualizerSelection.value].forEach(func => {
    if (func.includes('midiEvent_')) {
        const option = document.createElement('option');
        option.value = func;
        option.innerText = func;
        functionSelector.appendChild(option);
    }
});
document.body.appendChild(functionSelector);

// Add event button
const addButton = document.createElement('button');
addButton.innerText = 'Add Event';
addButton.addEventListener('click', () => {
    const div = document.createElement('div');
    div.innerText = `${functionSelector.value} on `;
    const midiEvent = document.createElement('span');
    const listenButton = document.createElement('button');
    listenButton.innerText = 'Listen';
    listenButton.addEventListener('click', () => {
        midiEvent.innerText = 'Listening';
        listeningFunction = midiEvent;
    });
    div.appendChild(midiEvent);
    div.appendChild(listenButton);
    document.body.appendChild(div);
});
document.body.appendChild(addButton);