import * as visualization from './pretendViz/pretendViz.js';
import * as visualizationtwo from './secondViz/index.js';

let visualizers = [visualization, visualizationtwo];
let mainDiv = document.getElementsByTagName('main')[0];
let configurationJson = {};
let listeningFunction = null;

console.log(visualizers[0].render());
// Create the visualizer selection dropdown
const visualizerSelection = document.createElement('select');
visualizerSelection.id = 'visualizerSelection';


visualizers.forEach(visualizer => {
    const option = document.createElement('option');
    option.value = visualizer.config.name;
    option.innerText = visualizer.config.name;
    visualizerSelection.appendChild(option);
});

mainDiv.appendChild(visualizerSelection);

// Expose functions to configure
const functionSelector = document.createElement('select');
selectSketch(visualizers[0]);
mainDiv.appendChild(functionSelector);

// Add event button
createAddButton();

function createAddButton() {
    const addButton = document.createElement('button');

    addButton.innerText = 'Add Event';
    addButton.addEventListener('click', () => {
        const selectedFunction = functionSelector.value;
        const selectedVisualizer = visualizers.find(visualizer => visualizer.config.name === visualizerSelection.value);
        const params = selectedVisualizer.config.functions[selectedFunction].parameters;
        console.log(params);

        const div = document.createElement('div');
        div.classList.add('event');
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

        const channelSelector = document.createElement('select');
        channelSelector.classList.add('channelSelector');
        for(let i = 1; i <= 16; i++) {
            const option = document.createElement('option');
            option.value = i;
            option.innerText = i;
            channelSelector.appendChild(option);
        }
        div.appendChild(channelSelector);

        const actionSelector = document.createElement('select');
        actionSelector.classList.add('actionSelector');
        const actions = ['noteOn', 'noteOff', 'controlChange'];
        actions.forEach(action => {
            const option = document.createElement('option');
            option.value = action;
            option.innerText = action;
            actionSelector.appendChild(option);
        });
        div.appendChild(actionSelector);
        for(let param in params) {
            const input = document.createElement('input');
            input.classList.add('parameter');
            input.type = params[param].type;
            input.placeholder = param;
            div.appendChild(input);
        }
        mainDiv.appendChild(div);
    });

    mainDiv.appendChild(addButton);
}

visualizerSelection.addEventListener('change', (e) => {
    const selectedVisualizer = visualizers.find(visualizer => visualizer.config.name === e.target.value);
    selectSketch(selectedVisualizer);
});

function selectSketch(sketch) {
    functionSelector.innerHTML = '';
    configurationJson = {};
    
    Object.entries(sketch).forEach(([name, exported]) => {
        if (typeof exported !== 'function') return;
        const option = document.createElement('option');
        option.value = name;
        option.innerText = name;
        functionSelector.appendChild(option);
    });
}

function getConfiguration() {
    const events = Array.from(document.getElementsByClassName('event'));
    const configuration = {
        events: {}
    };
    events.forEach(event => {
        const channelSelector = event.getElementsByClassName('channelSelector')[0];
        const actionSelector = event.getElementsByClassName('actionSelector')[0];
        const parameters = Array.from(event.getElementsByClassName('parameter'));
        parameters.forEach((parameter, i) => {
            parameters[i] = parameter.value || parameter.placeholder
            if (parameter.type === 'number') {
                parameters[i] = Number(parameters[i]);
            } else if (parameter.type === 'color') {
                parameters[i] = Number(`0x${parameter.value.substr(1)}`)
            } else if (parameter.type === 'checkbox') {
                parameters[i] = parameter.checked;
            }
        });
        console.log(parameters);
        
        const findFunction = visualizers.find(visualizer => visualizer.config.name === visualizerSelection.value)[functionSelector.value];
        console.log(findFunction);
        if (!configuration.events[actionSelector.value]) {
            configuration.events[actionSelector.value] = {};
        }
        // configuration.events[actionSelector.value][`channel${channelSelector.value}`] = () => {findFunction(...parameters)};
        configuration.events[actionSelector.value][`channel${channelSelector.value}`] = {
            func: functionSelector.value,
            params: parameters
        };

    });
    return configuration;
}

// Create the configuration button
const configurationButton = document.createElement('button');
configurationButton.innerText = 'Configure';
configurationButton.addEventListener('click', () => {
    configurationJson = getConfiguration();
    console.log(configurationJson);
    console.log(JSON.stringify(configurationJson));
    localStorage.setItem('midiVisualizerSettings', JSON.stringify(configurationJson));
});
document.body.appendChild(configurationButton);

const startButton = document.createElement('button');
startButton.innerText = 'Start';
startButton.addEventListener('click', () => {
    const selectedVisualizer = visualizers.find(visualizer => visualizer.config.name === visualizerSelection.value);
    window.location.href = `./${selectedVisualizer.config.name}`;
});
document.body.appendChild(startButton);