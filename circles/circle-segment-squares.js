// circles with segment missing
// paths are split
// extra layer of hatching

const canvasSketch = require('canvas-sketch');
const penplot = require('../utils/penplot');
const utils = require('../utils/random');
const poly = require('../utils/poly');

let svgFile = new penplot.SvgFile();

const settings = {
  dimensions: 'A4',
  orientation: 'portrait',
  pixelsPerInch: 300,
  scaleToView: true,
  units: 'cm',
};

const sketch = (context) => {

  let margin = 0.2;
  let elementWidth = 2.2;
  let elementHeight = 2.2;
  let columns = 6;
  let rows = 10;
  
  let drawingWidth = (columns * (elementWidth + margin)) - margin;
  let drawingHeight = (rows * (elementHeight + margin)) - margin;
  let marginLeft = (context.width - drawingWidth) / 2;
  let marginTop = (context.height - drawingHeight) / 2;
  
  let o = [];
  for (let r = 0; r < rows; r++) {
    o[r] = [];
    for (let i = 0; i < columns; i++) {
      let rot = utils.getRandomInt(4,0) * 90;//utils.random(0, 360);
      let size = utils.random(45, 270);
      let quarter = utils.getRandomInt(4,1);
      o[r].push([rot, size, quarter]);
    }
  }
  
  return ({ context, width, height, units }) => {
    svgFile = new penplot.SvgFile();

    const drawCircle = (cx, cy, radius) => {
  
      context.beginPath();
      context.arc(cx, cy, radius, 0, Math.PI * 2);
      context.stroke();
    
      svgFile.addCircle(cx, cy, radius);
    }
    
    const drawArc = (cx, cy, radius, sAngle, eAngle) => {
      context.beginPath();
      context.arc(cx, cy, radius, (Math.PI / 180) * sAngle, (Math.PI / 180) * eAngle);
      context.stroke();
    
      svgFile.addArc(cx, cy, radius, sAngle, eAngle);
    }

    context.fillStyle = 'white';
    context.fillRect(0, 0, width, height);
    context.strokeStyle = 'black';
    context.lineWidth = 0.01;

    let posX = marginLeft;
    let posY = marginTop;

    let radius = elementWidth / 2;
    let divide = 15
    let step = radius / divide;

    for (let r = 0; r < rows; r++) {
    	for (let i = 0; i < columns; i++) {
            for (let s = 0; s < (divide); s++) {
            drawArc(posX + radius, posY + radius, s * step, o[r][i][0], o[r][i][0] + 270);
            }
    		posX = posX + (elementWidth) + margin;
        }

        svgFile.newPath();
        
    	posX = marginLeft;
    	posY = posY + elementHeight + margin;
    }

    // uncomment for hatched background
    // poly.init(context);
    // let bounds = poly.createSquarePolygon(marginLeft, marginTop, drawingWidth, drawingHeight);
    // let hatchLines = poly.hatchPolygon(bounds, 30, 0.1);
    // hatchLines.map(l => {
    //     poly.drawLineOnCanvas( l);
    //     svgFile.addLine(l);
    // });

    return [
      // Export PNG as first layer
      context.canvas,
      // Export SVG for pen plotter as second layer
      {
        data: svgFile.toSvg({
          width,
          height,
          units
        }),
        extension: '.svg',
      }
    ];
  };
};

canvasSketch(sketch, settings);
