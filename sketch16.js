// overlapping squares with hatching

const canvasSketch = require('canvas-sketch');
const penplot = require('./penplot');
const utils = require('./utils');
const poly = require('./poly');

let svgFile = new penplot.SvgFile();

const settings = {
  dimensions: 'A3',
  orientation: 'portrait',
  pixelsPerInch: 300,
  scaleToView: true,
  units: 'cm',
};

const sketch = (context) => {

  let margin = -0.2;
  let elementWidth = 3;
  let elementHeight = 3;
  let columns = 7;
  let rows = 12;
  
  let drawingWidth = (columns * (elementWidth + margin)) - margin;
  let drawingHeight = (rows * (elementHeight + margin)) - margin;
  let marginLeft = (context.width - drawingWidth) / 2;
  let marginTop = (context.height - drawingHeight) / 2;
  
  let o = [];
  for (let r = 0; r < rows; r++) {
    o[r] = [];
    for (let i = 0; i < columns; i++) {
      let rot = utils.random(-90, 90);
      let space = utils.random(0.21,0.27);
      let skew1 = utils.random(-0.21,0.17);
      let skew2 = utils.random(-0.21,0.17);
      o[r].push([rot,space, skew1, skew2]);
    }
  }
  
  return ({ context, width, height, units }) => {
    svgFile = new penplot.SvgFile();

    context.fillStyle = 'white';
    context.fillRect(0, 0, width, height);
    context.strokeStyle = 'black';
    context.lineWidth = 0.01;

    let posX = marginLeft;
    let posY = marginTop;

    for (let r = 0; r < rows; r++) {
    	for (let i = 0; i < columns; i++) {
        let sposX = posX + o[r][i][2];
        let sposY = posY + o[r][i][3];
        let s =poly.createSquarePolygon(sposX, sposY, elementWidth, elementHeight);
        let lines = poly.hatchPolygon(s, o[r][i][0], o[r][i][1]);
        lines.map(l => {
          poly.drawLineOnCanvas(context, l);
          svgFile.addLine(l);
        });
        posX = posX + (elementWidth) + margin;
        svgFile.newPath();
      }

    	posX = marginLeft;
    	posY = posY + elementHeight + margin;
    }

    // let bounds = poly.createSquarePolygon(marginLeft, marginTop, drawingWidth, drawingHeight);
    // let hatchLines = poly.hatchPolygon(bounds, 30, 0.5);
    // hatchLines.map(l => {
    //     poly.drawLineOnCanvas(context, l);
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