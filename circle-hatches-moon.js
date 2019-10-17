// test for circle-line intersection

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

  let margin = 0.2;
  let elementWidth = 1;
  let elementHeight = 1;
  let columns = 1;
  let rows = 1;
  
  let drawingWidth = (columns * (elementWidth + margin)) - margin;
  let drawingHeight = (rows * (elementHeight + margin)) - margin;
  let marginLeft = (context.width - drawingWidth) / 2;
  let marginTop = (context.height - drawingHeight) / 2;
  
  // let o = [];
  // for (let r = 0; r < rows; r++) {
  //   o[r] = [];
  //   for (let i = 0; i < columns; i++) {
  //     let rot = utils.getRandomInt(4,0) * 90;//utils.random(0, 360);
  //     let size = utils.random(45, 270);
  //     let quarter = utils.getRandomInt(4,1);
  //     o[r].push([rot, size, quarter]);
  //   }
  // }
  
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

    
    let bb = {xmin:margin, ymin:margin, xmax:width-margin, ymax:height-margin};

    let circles = [];
    circles.push({center: poly.point(width/3, height/3), r: width/4, hatchAngle: 20, hatchSpace: 0.2, innerOuter: 4/5, innerCenter: poly.point((width/3)+2, (height/3)+2)});

    circles.forEach(c => {

      let x = poly.hatchDonut(c.center, c.r, c.r * c.innerOuter, c.hatchAngle, c.hatchSpace, c.innerCenter);
      x.forEach(l => { 
        let clippedLine = poly.clipLineToBB(l, bb);
        if (clippedLine) { 
          poly.drawLineOnCanvas(context, clippedLine);
          let p1 = [clippedLine[0][0] || clippedLine[0].x, clippedLine[0][1] || clippedLine[0].y];
          let p2 = [clippedLine[1][0] || clippedLine[1].x, clippedLine[1][1] || clippedLine[1].y];
          svgFile.addLine([p1, p2]);
         }
      });

      svgFile.newPath();
    });

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
