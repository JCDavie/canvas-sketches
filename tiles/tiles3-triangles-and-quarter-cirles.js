// tiles with quarter-circle

const canvasSketch = require('canvas-sketch');
const penplot = require('../utils/penplot');
const utils = require('../utils/random');
const poly = require('../utils/poly');

let svgFile = new penplot.SvgFile();

let lines = [];
let arcs = [];

const settings = {
  dimensions: 'A4',
  orientation: 'portrait',
  pixelsPerInch: 300,
  scaleToView: true,
  units: 'cm'
};

const sketch = context => {
  let margin = 0;
  let elementWidth = 3;
  let elementHeight = 3;
  let columns = 6;
  let rows = 6;

  let drawingWidth = columns * (elementWidth + margin) - margin;
  let drawingHeight = rows * (elementHeight + margin) - margin;
  let marginLeft = (context.width - drawingWidth) / 2;
  let marginTop = (context.height - drawingHeight) / 2;

  let o = [];
  for (let r = 0; r < rows; r++) {
    o[r] = [];
    for (let i = 0; i < columns; i++) {
      let corner = utils.getRandomInt(4, 0);
      let isRound = utils.getRandomInt(2, 0);
      //console.log(corner);
      o[r].push({
        corner,
        draw01: true,
        draw12: true,
        draw23: true,
        draw30: true,
        isRound
      });
    }
  }

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < columns; c++) {
      switch (o[r][c].corner) {
        // 0 1
        // 3 2
        case 0:
          if (r > 0 && (o[r - 1][c].corner === 2 || o[r - 1][c].corner === 3)) {
            o[r][c].draw01 = false;
          }
          if (c > 0 && (o[r][c - 1].corner === 1 || o[r][c - 1].corner === 2)) {
            o[r][c].draw30 = false;
          }
          break;
        case 1:
          if (r > 0 && (o[r - 1][c].corner === 2 || o[r - 1][c].corner === 3)) {
            o[r][c].draw01 = false;
          }
          if (
            c < columns - 1 &&
            (o[r][c + 1].corner === 0 || o[r][c + 1].corner === 3)
          ) {
            o[r][c].draw12 = false;
          }
          break;
        case 2:
          if (
            c < columns - 1 &&
            (o[r][c + 1].corner === 0 || o[r][c + 1].corner === 3)
          ) {
            o[r][c].draw12 = false;
          }
          if (
            r < rows - 1 &&
            (o[r + 1][c].corner === 1 || o[r + 1][c].corner === 0)
          ) {
            o[r][c].draw23 = false;
          }
          break;
        case 3:
          if (r < rows - 1 && (o[r + 1][c].corner === 0 || o[r + 1][c].corner === 1)) {
            o[r][c].draw23 = false;
          }
          if (c > 0 && (o[r][c - 1].corner === 1 || o[r][c - 1].corner === 2)) {
            o[r][c].draw30 = false;
          }
          break;
        default:
          break;
      }
    }
  }

  console.dir(o);

  return ({ context, width, height, units }) => {
    svgFile = new penplot.SvgFile();
    lines = [];
    arcs = [];
    poly.init(context);

    const drawCircle = (cx, cy, radius) => {
      context.beginPath();
      context.arc(cx, cy, radius, 0, Math.PI * 2);
      context.stroke();

      //svgFile.addCircle(cx, cy, radius);
    };

    const drawArc = (cx, cy, radius, sAngle, eAngle) => {
      context.beginPath();
      context.arc(
        cx,
        cy,
        radius,
        (Math.PI / 180) * sAngle,
        (Math.PI / 180) * eAngle
      );
      context.stroke();

      //svgFile.addArc(cx, cy, radius, sAngle, eAngle);
    };

    const drawTile = (x, y, side, rnd, padding = 0) => {
      //console.log({x, y, side, corner});
      // let s = poly.createSquarePolygon(x,y, side, side);
      // poly.drawPolygonOnCanvas(context, s);
      // squareGroup1.push(s);
      let corner = rnd.corner;

      let zeroCorner = [x + padding, y + padding],
        oneCorner = [x + side - padding, y + padding],
        twoCorner = [x + side - padding, y + side - padding],
        threeCorner = [x + padding, y + side - padding];

      let drawline1 = true;
      let drawline2 = true;

      let cx = x + padding, // case 0
        cy = y + padding,
        startAngle = 0,
        triangleX1 = -1,
        triangleY1 = 0,
        triangleX2 = 0,
        triangleY2 = -1,
        p0 = zeroCorner,
        p1 = oneCorner,
        p2 = threeCorner;
      // p0p1 = 01
      drawline1 = rnd.draw01;
      // p0p2 = 30
      drawline2 = rnd.draw30;

      // 0 1
      // 3 2
      switch (corner) {
        case 1:
          cx = x + side - padding;
          cy = y + padding;
          startAngle = 90;
          triangleX1 = 1;
          triangleY1 = 0;
          triangleX2 =0;
          triangleY2 = -1;
          p0 = oneCorner;
          p1 = zeroCorner;
          p2 = twoCorner;
          // p0p1 = 01
          drawline1 = rnd.draw01;
          // p0p2 = 12
          drawline2 = rnd.draw12;
          break;
        case 2:
          cx = x + side - padding;
          cy = y + side - padding;
          startAngle = 180;
          triangleX2 = 1;
          triangleY2 = 0;
          triangleX1 = 0;
          triangleY1 = 1;
          p0 = twoCorner;
          p1 = oneCorner;
          p2 = threeCorner;
          // p0p1 = 12
          drawline1 = rnd.draw12;
          // p0p2 = 23
          drawline2 = rnd.draw23;
          break;
        case 3:
          cx = x + padding;
          cy = y + side - padding;
          startAngle = 270;
          triangleX1 = -1;
          triangleY1 = 0;
          triangleX2 = 0;
          triangleY2 = 1;
          p0 = threeCorner;
          p1 = twoCorner;
          p2 = zeroCorner;
          // p0p1 = 23
          drawline1 = rnd.draw23;
          // p0p2 = 30
          drawline2 = rnd.draw30;
          break;
        default:
          break;
      }

      if (drawline1) {
        let l1 = [p0, p1];
        poly.drawLineOnCanvas(l1);
        lines.push(l1);
      }
      if (drawline2) {
        let l2 = [p0, p2];
        poly.drawLineOnCanvas(l2);
        lines.push(l2);
      }

      let endAngle = startAngle + 90;

      let radius = side - padding * 2;
      let divide = 10;
      let step = radius / divide;
      let triangleLine = [p1,p2];

      for (let s = 1; s <= divide; s++) {
        if (rnd.isRound) {
          drawArc(cx, cy, s * step, startAngle, endAngle);
          if (s < divide) {
            arcs.push({ cx, cy, radius: s * step, startAngle, endAngle });
          } else {
            arcs.push({ cx, cy, radius: s * step, startAngle, endAngle });
          }
        }
        
      }
      for (let m = 0; m<divide; m++) {
        if (!rnd.isRound) {
          let diff = m * step;
          let pStart = [[p1[0] + triangleX1 * diff],[p1[1] + triangleY1 * diff]];
          let pEnd = [[p2[0] + triangleX2 * diff],[p2[1] + triangleY2 * diff]];
          poly.drawLineOnCanvas([pStart,pEnd]);
          
        }
      }
    };

    context.fillStyle = 'white';
    context.fillRect(0, 0, width, height);
    context.strokeStyle = 'black';
    context.lineWidth = 0.02;

    let posX = marginLeft;
    let posY = marginTop;

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < columns; c++) {
        drawTile(posX, posY, elementWidth, o[r][c], margin);
        posX = posX + elementWidth + margin;
      }

      posX = marginLeft;
      posY = posY + elementHeight + margin;
    }
    lines.forEach(l => {
      svgFile.addLine(l);
    });
    arcs.forEach(a => {
      svgFile.addArc(a.cx, a.cy, a.radius, a.startAngle, a.endAngle);
    });
    svgFile.newPath();

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
        extension: '.svg'
      }
    ];
  };
};

canvasSketch(sketch, settings);
