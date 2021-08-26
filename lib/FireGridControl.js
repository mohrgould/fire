export class FireGridControl {

  burned = 0;
  breakSize = 10;
  
  constructor (model, view) {
    this.view = view;
    this.model = model;

    this.dom = {
      fps: {
        model: document.querySelector('#fps .model'),
        view: document.querySelector('#fps .view'),
      },
    };
  }

  step () {
    const startTime = +new Date();
    this.model.step();
    const modelTime = +new Date();
    const modelDur = modelTime - startTime;
    this.burned = this.model.totalChar / this.model.totalFuel;
    this.view.render(this.model);
    const viewDur = +new Date() - modelTime;

    this.showFPS(modelDur, viewDur);
  }

  showFPS (modelDur, viewDur) {
    this.dom.fps.model.innerHTML = modelDur;
    this.dom.fps.view.innerHTML = viewDur;
  }

  reset () {
    this.model.reset();
  }

  ignite (row, col) {
    this.model.ignite(row, col);
  }

  firebreak (row, col) {
    this.model.firebreak(row, col);
  }
}
