// test for circle-line intersection

const canvasSketch = require('canvas-sketch');
const penplot = require('../utils/penplot');
const poly = require('../utils/poly');

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
  
  return ({ context, width, height, units }) => {
    svgFile = new penplot.SvgFile();
    poly.init(context);

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
          poly.drawLineOnCanvas(clippedLine);
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
