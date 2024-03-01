import * as eventHandler from '../event.js';

console.log(eventHandler);
const functions = {
  render: render,
  seriously: seriously
}
eventHandler.startMIDI(functions);

export function render() {
  console.log("hello Viz");
}

export function seriously(color, size) {
  console.log(`seriously ${color} ${size}`);
}

export let x = "variable";

export {default as config} from './config.js';