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


function zip3D(x, y, z) {
    var out = [];
    const xlen = x.size;
    const ylen = y.size;
    for (var i = 0; i < xlen; ++i) {
        for (var j = 0; j < ylen; ++j) {
            out.push({
                x: x.get(i),
                y: y.get(j),
                i: i,
                j: j,
                z: z.get(j, i)
            });
        }
    }
    return out;
}


function plotDataNoBinding() {
    plotSurface(data.x, data.y, data.surface, [850, 1400], [330, 1150]);
}


function plotSurface(x, y, z, xslice, yslice) {
    Promise.all([x, y, z]).then(([xx, yy, zz]) => {
        // Convert to ndarray and convert to km
        xx = nj.array(xx).divide(1000.0);
        yy = nj.array(yy).divide(1000.0);
        //zz = nj.array(zz).divide(1000.0);
        zz = nj.array(zz);
        const x = xx.slice(xslice);
        const y = yy.slice(yslice);
        const z = zz.slice(yslice, xslice);

        const margin = {top: 20, right: 60, bottom: 60, left: 70};
        const height = y.size;
        const width = x.size;
        const outerHeight = height + margin.top + margin.bottom;
        const outerWidth = width + margin.left + margin.right;

        // Clear previous plots if any
        d3.select('#chart').selectAll('canvas').remove();
        d3.select('#chart')
            .style('width', outerWidth + 'px')
            .style('height', outerHeight + 'px');
        const svg = d3.select('#chart').append('svg:svg')
            .attr('width', outerWidth)
            .attr('height', outerHeight)
            .attr('class', 'svg-plot')
            .append('g')
            .attr('transform',
                'translate(' + margin.left + ', ' + margin.top + ')');
        const canvas = d3.select('#chart').append('canvas')
            .attr('width', width)
            .attr('height', height)
            // +1 to prevent covering the left axis
            .style('margin-left', margin.left + 1 + 'px')
            .style('margin-top', margin.top + 'px')
            .attr('class', 'canvas-plot');

        rasterPlot(x, y, z, width, height, svg, canvas);
    });
}


function rasterPlot(x, y, z, canvasWidth, canvasHeight, svg, canvas) {
    const linData = zip3D(x, y, z);

    var context = canvas.node().getContext('2d');
    // Axes
    const xAxisScale = d3.scaleLinear()
        .domain([x.min(), x.max()])
        .range([0, canvasWidth])
        .nice();
    const yAxisScale = d3.scaleLinear()
        .domain([y.min(), y.max()])
        .range([canvasHeight, 0])
        .nice();
    const xAxis = d3.axisBottom(xAxisScale);
    const yAxis = d3.axisLeft(yAxisScale);
    svg.append('g')
        .attr('transform', 'translate(0, ' + canvasHeight + ')')
        .call(xAxis);
    svg.append('g')
        .call(yAxis);
    svg.append('text')
        .attr('x', `${canvasWidth / 2 - 40}`)
        .attr('y', `${canvasHeight + 40}`)
        .text('East/West (km)');
    svg.append('text')
        .attr('x', `-${canvasHeight / 2 + 30}`)
        .attr('dy', '-3.5em')
        .attr('transform', 'rotate(-90)')
        .text('North/South (km)');

    const legendWidth = 20,
        legendHeight = canvasHeight,
        legendX = canvasWidth + 10,
        legendY = 0;
    const legendColor = d3.scaleSequential(d3.interpolateViridis)
        .domain([0, 100]);
    const legendGrad = svg.append('defs')
        .append('linearGradient')
        .attr('id', 'z-legend-grad')
        .attr('x1', '0%')
        .attr('y1', '100%')
        .attr('x2', '0%')
        .attr('y2', '0%')
        .selectAll('stop')
        .data(d3.ticks(0, 100, 20))
        .enter()
        .append('stop')
        .attr('offset', (d) => { return d / 100; })
        .attr('stop-color', (d) => { return legendColor(d); });
    const legendContainer = svg.append('g');
    const legend = legendContainer.append('rect')
        .attr('x', legendX)
        .attr('y', legendY)
        .attr('width', legendWidth)
        .attr('height', legendHeight)
        .style('fill', 'url(#z-legend-grad)');
    const legendScale = d3.scaleLinear()
        .domain([z.min(), z.max()])
        .range([canvasHeight, 0]);
    const legendAxis = d3.axisRight(legendScale);
    legendContainer.append('g')
        .attr('transform', 'translate(' + (legendX + legendWidth) + ', 0)')
        .call(legendAxis);

    const color = d3.scaleSequential(d3.interpolateViridis)
        .domain([z.min(), z.max()]);
    const rectScale = d3.scaleLinear()
        .domain([0, y.size])
        .range([0, canvasHeight]);

    drawRects(linData, color, rectScale, context);
}


function drawRects(linData, color, scale, context) {
    linData.forEach((d) => {
        context.beginPath();
        context.rect(scale(d.i), scale(d.j), scale(1), scale(1));
        context.fillStyle = color(d.z);
        context.fill();
        context.closePath();
    });
}
