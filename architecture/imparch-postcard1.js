
const canvasSketch = require('canvas-sketch');
const { renderPaths, renderGroups } = require('canvas-sketch-util/penplot');
import { hatch } from '../utils/hatch';
import {room} from './room';
const random = require('canvas-sketch-util/random');
const { createArcPath, createLinePath } = require('../utils/paths');
const poly = require('../utils/poly');
const polybool = require('polybooljs');
import { polyline } from "../utils/polyline";
import { boundingbox } from '../utils/boundingbox';
const postcards = require('../utils/postcards');

const settings = {
  dimensions: 'A4',//[ 2048, 2048 ]
  orientation: 'portrait',
  pixelsPerInch: 300,
  //scaleToView: true, 
  units: 'mm',
};

const drawPlan = (center, width) => {
  let rooms = [];
  let unit = width/12;
  let origin = room.from(center, unit);
  rooms.push(origin);

  for (let i = 0; i < 10; i++) {
    let r = random.pick(rooms);
    let s = random.pick(r.extrudableSides());
    let d = random.pick([unit/2, unit, unit*2]);
    let a = random.value() > 0.2 ? random.range(10, 30) : 0;
    let stairUnit = unit / 10;
    if (random.value() > 0.7) { r.addStairs(random.pick([1,2,3,4]), stairUnit*1.5, random.pick([stairUnit*4, stairUnit*6, stairUnit*15])); }
    let columnunit = unit / 4;
    if (random.value() > 0.7) { r.addColumnade(random.pick([2,3,4]), columnunit*1.5, columnunit, columnunit/3); }

    try {
      let e = r.extrude(s, d, a);
      if (e) { 
        rooms.push(e); 
      } 
    }
    catch(e){
      console.log(e, r,s,d,a);
    }
  }  
  
  return rooms;
}


const pushOutwards = (r, l, d) => {
  // room, line, distance
  let {m,n} = poly.lineEquationFromPoints(l[0], l[1]);
  let ld = Math.hypot(l[1][0]-l[0][0], l[1][1]-l[0][1]);
  let vd = [d*(l[1][1]-l[0][1])/ld, d*(l[1][0]-l[0][0])/ld];

  if (r.columns) {
    const avgx = (r.columns.reduce((a,b) => a + b.c[0], 0) / r.columns.length) || 0;
    const avgy = (r.columns.reduce((a,b) => a + b.c[1], 0) / r.columns.length) || 0;
    let cs = [avgx, avgy];
    let lx = (cs[1] - n) / m;
    let left = (lx > cs[0]);
    let v = left ? [vd[0], - vd[1]] : [-vd[0], vd[1]];
    let newColumns = r.columns.map(x => {return {r:x.r, c:poly.movePoint(x.c, v)}});
    r.columns = newColumns;
  }
  if (r.stairs) {
    //center for all stairs
    //let xx = r.stairs.reduce((a, b) => {console.log(a,b); return a + b[0][0] + b[1][0]}, 0);
    const avgx = (r.stairs.reduce((a, b) => a + b[0][0] + b[1][0], 0) / r.stairs.length) || 0;
    const avgy = (r.stairs.reduce((a, b) => a + b[0][1] + b[1][1], 0) / r.stairs.length) || 0;
    let cs = [avgx, avgy];
    let lx = (cs[1] - n) / m;
    let left = (lx > cs[0]);
    let v = left ? [vd[0], - vd[1]] : [-vd[0], vd[1]];
    let newStairs = r.stairs.map(s => new polyline(s).move(v).points);
    r.stairs = newStairs;
  }

}



const sketch = ({ width, height }) => {

  let plans = [];

  const prepare = (origin, w, h) => {
    let bounds = boundingbox.from([origin, postcards.reorigin([w, 0], origin), postcards.reorigin([w, h], origin), postcards.reorigin([0, h], origin)]);
    let rooms = drawPlan(bounds.center, w);
    let linkedrooms = room.linkroomlines(rooms);
    let bb = boundingbox.from(linkedrooms.points);
    rooms.forEach(r => r.move(poly.createVector(bb.center, bounds.center)));
    linkedrooms = room.linkroomlines(rooms);

    let startregion = room.toClipRegion(rooms);
    let times = random.pick([3,4,5]);
    
    for (let i = 0; i < times; i++) {
      let vertical = random.boolean();
      let divider = random.range(2,3);
      let dist = 3;
      let vertdivider = [postcards.reorigin([w/divider, 0], origin),postcards.reorigin([w-(w/divider), h], origin)];
      let hordivider = [postcards.reorigin([0, h/divider], origin),postcards.reorigin([w, h-(h/divider)], origin)];
      startregion = vertical ? startregion.splitVertically(vertdivider, bounds, [dist, dist]) : startregion = startregion.splitHorizontally(hordivider, bounds, [dist, dist]);
      rooms.forEach(r => pushOutwards(r, vertical ? vertdivider : hordivider, dist));
    }

    let lines = [];
    let arcs = [];
    rooms.forEach(r => {
      //lines.push(...r.plan());
      if (r.columns) { arcs.push(...r.columns); }
      if (r.stairs) { lines.push(...r.stairs); }
    });

    let hatches = [];
    let originalRegion = room.toClipRegion(rooms);
    let hatchregion = originalRegion.diff(startregion);
    hatchregion.regions.forEach(hh => {
      let x = hatch.inside(hh, 10, h/150);
      hatches.push(...x);
    })

    lines.push(...startregion.toLines());
    plans.push({lines, hatches, arcs});
  }

  postcards.drawSingle(prepare, width, height);
  
  return ({ context, width, height, units }) => {
    
    let planPaths = [];
    let otherPaths = [];

    const draw = (origin, w, h) => {
      plans.forEach(p => {
        p.lines.forEach(l => { planPaths.push(createLinePath(l)); })
        p.hatches.forEach(l => { otherPaths.push(createLinePath(l)); })
        p.arcs.forEach(a => { planPaths.push(createArcPath(a.c, a.r, 0, 360)); })
      });

    }

    postcards.drawSingle(draw, width, height);

    return renderGroups([planPaths, otherPaths], {
      context, width, height, units
    });
  };
};

canvasSketch(sketch, settings);