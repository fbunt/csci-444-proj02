'use strict';

const nj = require('numjs');


const datadir = 'data/';
const datafiles = [
    'bed.json',
    'smb.json',
    'surface.json',
    't2m.json',
    'thickness.json',
    'x.json',
    'y.json'
];

var data = {};


function loadData() {
    for (var i = 0; i < datafiles.length; ++i) {
        var vname = datafiles[i].split('.')[0];
        data[vname] = d3.json(datadir + datafiles[i]);
    }
}


$('document').ready(function() {
    loadData();
    plotDataNoBinding();
});


function max2d(data) {
    return Math.max.apply(null, data.map(function(row) {
        return Math.max.apply(null, row);
    }));
}


function min2d(data) {
    return Math.min.apply(null, data.map(function(row) {
        return Math.min.apply(null, row);
    }));
}


function zipData(x, y, z) {
    var out = [];
    var istart = 0;
    var jstart = 0;
    var iend = x.length;
    var jend = y.length;
    for (var i = istart; i < iend; ++i) {
        for (var j = jstart; j < jend; ++j) {
            out.push({
                x: x[i],
                y: y[j],
                i: i,
                j: j,
                z: z[j][i]
            });
        }
    }
    return out;
}


function plotDataNoBinding() {
    plotData(data.x, data.y, data.surface);
}


function plotData(x, y, z) {
    Promise.all([x, y, z]).then(([x, y, z]) => {
        var lindata = zipData(x, y, z);
        var min = min2d(z);
        var max = max2d(z);
        var height = Math.floor(y.length / 2);
        var width = Math.floor(x.length / 2);
        var scale = d3.scaleLinear()
            .domain([0, y.length])
            .range([0, height]);

        // Clear previous plots if any
        d3.select('#chart').selectAll('canvas').remove();
        var canvas = d3.select('#chart').append('canvas')
            .attr('width', width)
            .attr('height', height);
        var context = canvas.node().getContext('2d');

        var color = d3.scaleSequential(d3.interpolateViridis)
            .domain([min, max]);
        lindata.forEach((d) => {
            context.beginPath();
            context.rect(scale(d.i), scale(d.j), scale(1), scale(1));
            context.fillStyle = color(d.z);
            context.fill();
            context.closePath();
        });
    });
}


function plotDataWithBinding() {

}
