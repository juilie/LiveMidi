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
        console.log(input);
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
        if(statusByte === 150) {
            let town = ""
            switch (note) {
                case 36:
                    town = "Greenfield"
                    break;
                case 38:
                    town = "Deerfield"
                    break;
                case 40:
                    town = "Westfield"
                    break;
                case 42:
                    town = "Northfield"
                    break;
                case 44:
                    town = "Northampton"
                    break;
                case 46:
                    town = "Westhampton"
                    break;
                case 48:
                    town = "Southampton"
                    break;
                case 50:
                    town = "Eastampton"
                    break;
                case 52:
                    town = "Florence"
                    break;
                case 54:
                    town = "Orange"
                    break;
                case 56:
                    town = "Hatfield"
                    break;
                case 58:
                    town = "Hadley"
                    break;
                case 60:
                    town = "Amherst"
                    break;
                case 62:
                    town = "Great Falls"
                    break;
                case 64:
                    town = "Shelburne Falls"
                    break;
                case 66:
                    town = "Millers Falls"
                    break;
                case 68:
                    town = "Montague"
                    break;
                case 70:
                    town = "Bernardston"
                    break;
                default:
                    break;
            }
            window.world.addFont_(window.loadedFont, town)
        } else{
        switch (statusByte) {
            case 153:
                window.tunnel.addRing()
                break;
            case 144:
                window.tunnel.addRing()
                break;
            case 145:
                window.tunnel.addShape()
                break;
            
            case 146:
                window.tunnel.addCone()
                break;
            case 147:
                window.tunnel.addTorus()
                break;
            case 148:
                window.tunnel.addOcta()
                break;
            case 149:
                window.tunnel.addCube()
                break;
        
            default:
                window.tunnel.addShape()
                break;
        }
    }
    }
}