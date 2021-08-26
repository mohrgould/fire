import { FireGrid } from './lib/FireGrid.js';
import { FireGridView } from './lib/FireGridView.js';
import { FireGridControl } from './lib/FireGridControl.js';

const width = 375;
const height = 375;
const scale = 2;

const container = document.querySelector('#grid');
const canvas = document.createElement('canvas');
canvas.width = width;
canvas.height = height;
canvas.id = 'fire-grid';
container.appendChild(canvas);

/*
const target = document.createElement('div');
target.className = 'target';
container.appendChild(target);
*/

const dom = {
  grid: document.querySelector('#fire-grid'),
  target: document.querySelector('#grid .target'),
  reset: document.querySelector('#reset-button'),
  burned: document.querySelector('#burned div'),
  burnedAmount: document.querySelector('#burned div'),
  toolIgnite: document.querySelector('#tools .ignite'),
  toolFirebreak: document.querySelector('#tools .firebreak'),
};

const toolModes = {
  ignite: 0,
  firebreak: 1,
}

let toolMode = toolModes.ignite;
updateTools();
dom.toolIgnite.addEventListener('click', function () {
  toolMode = toolModes.ignite;
  updateTools();
});
dom.toolFirebreak.addEventListener('click', function () {
  toolMode = toolModes.firebreak;
  updateTools();
});
function updateTools () {
  if (toolMode === toolModes.ignite) {
    dom.toolIgnite.classList.add('selected');
    dom.toolFirebreak.classList.remove('selected');
  } else if (toolMode === toolModes.firebreak) {
    dom.toolIgnite.classList.remove('selected');
    dom.toolFirebreak.classList.add('selected');
  }
}

const fireGrid = new FireGrid(width, height);
const fgView = new FireGridView(width, height, dom.grid);
const fgControl = new FireGridControl(fireGrid, fgView);

let lastTime = +new Date();

function handleMouse (event) {
  const rect = dom.grid.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;

  //const x = event.layerX;
  //const y = event.layerY;  
  const row = Math.floor(y/scale);// scale);
  const col = Math.floor(x/scale);// scale);

  if (toolMode === toolModes.ignite) {
    fgControl.ignite(row, col);
  } else if (toolMode === toolModes.firebreak) {
    fgControl.firebreak(row, col);
  }
}

dom.grid.addEventListener('click', handleMouse);

dom.reset.addEventListener('click', () => {
  fgControl.reset();
});

function step () {
  const now = +new Date();
  const duration = now - lastTime;
  lastTime = now;
  fgControl.step(duration);
  const width = String(Math.round(fgControl.burned * 100)) + '%';
  dom.burnedAmount.style.width = width;
  dom.burned.innerHTML = width;
  window.requestAnimationFrame(step);
}
step();