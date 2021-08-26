export class FireGridView {

  constructor (width, height, el) {
    this.width = width;
    this.height = height;
    this.ctx = el.getContext('2d', { alpha: false });
    this.id = this.ctx.createImageData(width, height);
  }

  firstDone = false;

  render (model) {
    var n = 0;
    for (var row=0; row<this.height; row++) {
      for (var col=0; col<this.width; col++) {
        var burning = model.burning[n];
        var consumed = model.consumed[n]
        var heat = model.heat[n];
        var fuel = model.fuel[n];
        var smoke = model.smoke[n];
        var remaining = fuel - consumed;
        let color = 'white';
        let r, g, b;

        if (burning) {
          let h2 = heat * remaining;
          r = h2 + 190;
          g = h2 * 30;
          b = h2 * 10;
          let rate = Math.pow(Math.min(1, remaining * 1), 0.01);
          r = Math.max(r, 32);
          g = Math.max(g, 16);
          b = Math.max(b, 16);
          r *= rate;
          g *= rate;
          b *= rate;
        } else {
          r = 45 + 140 * remaining;
          g = 40 + 160 * remaining;
          b = 40 + 70 * remaining;

          r *= (1-consumed*0.4 + 0.1*fuel);
          g *= (1-consumed*0.4);
          b *= (1-consumed*0.4);
          var poster = 6;
          r = Math.floor(r/poster)*poster;
          g = Math.floor(g/poster)*poster;
          b = Math.floor(b/poster)*poster;
        }

        let smokeDensity = 40;
        r = Math.max(0, r - smokeDensity*smoke);
        g = Math.max(0, g - smokeDensity*smoke);
        b = Math.max(0, b - smokeDensity*smoke);

        // put image data
        let idn = n * 4;
        this.id.data[idn + 0] = r;
        this.id.data[idn + 1] = g;
        this.id.data[idn + 2] = b;
        this.id.data[idn + 3] = 255;
        n++;
      }
    }

    this.ctx.putImageData(this.id, 0, 0);

    if (!this.firstDone) this.firstDone = true;
  }
}
