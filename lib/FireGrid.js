import { SimplexNoise } from './SimplexNoise.js';
let seed = Math.floor(Math.random() * 10000);
function random () {
  let x = Math.sin(seed++) * 10000;
  return x - Math.floor(x);
}
const simplex = new SimplexNoise({ random  });
function noise2d (i, j) {
  var n = 0;
  var level = 15; // smoothing
  n += (simplex.noise(j/level, i/level)/2 + 0.5) * 0.125;
  level  *= 3;
  n += (simplex.noise(j/level, i/level)/2 + 0.5) * 0.25;
  level  *= 2;
  n += (simplex.noise(j/level, i/level)/2 + 0.5) * 0.5;
  level  *= 2;
  n += (simplex.noise(j/level, i/level)/2 + 0.5) * 1;
  n /= 1+0.5+0.25+0.125;
  return n;
}


export class FireGrid {
  q = [];
  maxQ = 0;
  totalFuel = 0;
  totalChar = 0;
  breakSize = 30;
  breakSpan = 5;

  wind = { x: -1, y: -1 };

  constructor (width, height) {
    this.width = width;
    this.height = height;
    this.size = width * height;
    this.burning = new Array(this.size);
    this.fuel = new Array(this.size);
    this.consumed = new Array(this.size);
    this.heat = new Array(this.size);
    this.smoke = new Array(this.size);
    this.smokeBuffer = new Array(this.size);
    this.arrow = document.querySelector('#tools .wind');

    let n = 0;
    for (let row=0; row<this.height; row++) {
      for (let col=0; col<this.width; col++) {
        let fuel = Math.pow( noise2d(row, col),
          // lower for more plentiful fuel
          0.8
        );
        this.totalFuel += fuel;

        this.fuel[n] = fuel;
        this.burning[n] = false;
        this.consumed[n] = 0;
        this.heat[n] = 0;
        this.smoke[n] = 0;

        n++;
      }
    }
  }

  frame = 0;
  windspeed = 5;
  windslow = 15;

  step () {
    this.frame++;

    let windx = noise2d(this.frame/this.windslow, 0) - 0.5;
    let windy = noise2d(0, this.frame/this.windslow) - 0.5;

    //windx=windy=0.2

    let windrad = Math.atan2(windy, windx);// + Math.PI/2;
    let windmag = Math.sqrt(Math.pow(windx, 2) + Math.pow(windy, 2));

    this.wind.x = Math.floor(windx*this.windspeed);
    this.wind.y = Math.floor(windy*this.windspeed);

    this.arrow.style.transform = 'translate(0.0em,0.0em) rotate(' + windrad + 'rad)';//scaleX(' + (0.2+windmag * 0.7) + ')';
    this.arrow.style.opacity = windmag * 2;

    let n = 0;
    for (let row=0; row<this.height; row++) {
      for (let col=0; col<this.width; col++) {
        let heat = 0;
        let burning = this.burning[n];
        let fuel = this.fuel[n];
        let consumed = this.consumed[n];
        let remaining = fuel - consumed;
        
        let centerRow = row - this.wind.y;
        let centerCol = col - this.wind.x;
        let centerN = centerRow * this.width + centerCol;
        
        // expensive part
        let r = 2;//1;
        for (let neighborRow = centerRow - r; neighborRow <= centerRow + r; neighborRow++) {
          for (let neighborCol = centerCol - r; neighborCol <= centerCol + r; neighborCol++) {
            if (neighborRow < 0 || neighborRow > (this.height-1)) continue;
            if (neighborCol < 0 || neighborCol > (this.width-1)) continue;
            if (neighborRow === centerRow && neighborCol === centerCol) continue;
            let neighborN = neighborCol + neighborRow * this.width;
            let neighborBurning = this.burning[neighborN];
            if (neighborBurning) {
              let distance = Math.sqrt(Math.pow(neighborRow-centerRow,2) + Math.pow(neighborCol-centerCol,2));
              heat += (1 / Math.pow(distance, 2));
            }
          }
        }

        
        /*
        for (let neighborRow = centerRow - r; neighborRow <= centerRow + r; neighborRow++) {
          for (let neighborCol = centerCol - r; neighborCol <= centerCol + r; neighborCol++) {
            if (neighborRow < 0 || neighborRow > (this.height-1)) continue;
            if (neighborCol < 0 || neighborCol > (this.width-1)) continue;
            if (neighborRow === centerRow && neighborCol === centerCol) continue;
            let neighborN = neighborCol + neighborRow * this.width;
            this.smokeBuffer[n] = Math.min(1,
              this.smokeBuffer[n]
              + this.smoke[neighborN] * 0.1);
          }
        }
        */

        let newSmoke = 0;

        if (burning) {
          if (remaining > Math.pow(Math.random(),
            // higher for longer ember trail
            8
          ) * 0.2) {
            let consumption = Math.min(remaining,
              Math.pow(fuel *
                // lower for bigger flame front 
                0.01
              , 1) * Math.random());
            this.consumed[n] += consumption;
            this.totalChar += consumption;
          } else {
            this.q.push({row, col, burning: false});
          }
          
          //this.smokeBuffer[n] = Math.min(1, this.smokeBuffer[n] + 1);
          newSmoke = 1;
        } else  {
          if (Math.random() <
            Math.max(0, fuel-0.2 - Math.random()*0.7) *
              // higher for greater chance of ignition
              0.1
            * heat
          ) {
            this.q.push({row, col, burning: true});
          }

          //this.smokeBuffer[n] = Math.max(0, this.smoke[n] - 0.001);//.01);
          newSmoke = -0.01;
        }

        
        this.heat[n] = heat;
        
        // blowing smoke (todo: disperse)
        
        let windextra = 14;
        let xwindx = Math.ceil(windx*this.windspeed*windextra);
        let xwindy = Math.ceil(windy*this.windspeed*windextra);

        centerRow = row - xwindx;
        centerCol = col - xwindy;
        centerN = centerRow * this.width + centerCol;
        
        if (centerRow>0 && centerRow <this.height-1 && centerCol>0 && centerCol<this.width-1) {
          //this.smokeBuffer[n] = Math.min(1, this.smoke[n] + this.smoke[centerN]);
          //newSmoke += this.smoke[centerN]*0.1;
        }

        newSmoke=0;
        this.smokeBuffer[n] = Math.min(1, Math.max(0, this.smoke[n] + newSmoke));

        n++;
      }
    }

    let smokeN = this.width*100+100;
    this.smokeBuffer[smokeN] = Math.min(1, this.smokeBuffer[smokeN] + 1);

    this.tmp = this.smoke;
    this.smoke = this.smokeBuffer;
    this.smokeBuffer = this.tmp;
    
    this.drain();
  }

  drain () {
    if (this.q.length > this.maxQ) {
      this.maxQ = this.q.length;
      // console.log(this.maxQ);
    }
    this.q.forEach((change) => {
      this.burning[change.row*this.width + change.col] = change.burning;
    });
    this.q = [];
  }

  reset () {
    this.totalChar = 0;
    for (let row=0; row<this.height; row++) {
      for (let col=0; col<this.width; col++) {
        let n = this.width * row + col;
        this.burning[n] = false;
        this.consumed[n] = 0;
        this.smoke[n] = 0;
        this.smokeBuffer[n] = 0;
      }
    }
  }

  ignite (row, col) {
    this.burning[row*this.width + col] = true;
  }
  
  firebreak (row, col) {
    const rowStart = Math.max(0, row - this.breakSize);
    const rowEnd = Math.min(this.height, row + this.breakSize);
    const colStart = Math.max(0, col - this.breakSize);
    const colEnd = Math.min(this.width, col+this.breakSize);

    for (let irow=rowStart; irow<rowEnd; irow++) {
      for (let icol=colStart; icol<colEnd; icol++) {
        let offsetRow = row - irow;
        let offsetCol = col - icol;
        let remove = (
          Math.abs(offsetRow) < this.breakSpan
          || Math.abs(offsetCol) < this.breakSpan
        ) ? 1 : 0;
        let n = irow*this.width + icol;
        this.consumed[n] = Math.max(this.consumed[n], this.fuel[n] * remove * 0.9);
      }
    }
  }
}