'use strict';

const nj = require('numjs');


const datadir = 'data/';
const datafiles = [
    'bed.json',
    //'smb.json',
    'surface.json',
    //'t2m.json',
    'thickness.json',
    'VX.json',
    'VY.json',
    'x.json',
    'y.json'
];

var data = {};
// Chart container IDs
const CHART_00_ID = '#chart00';
const CHART_01_ID = '#chart01';
const CHART_02_ID = '#chart02';
const CHART_03_ID = '#chart03';
const CHART_04_ID = '#chart04';
const CHART_MARGIN = {top: 20, right: 100, bottom: 60, left: 70};
const CHART_CMAP = d3.interpolateViridis;


/** Window for the Northeast Greenland Ice Stream */
const NEGIS_SLICES_MAIN = {
    x: [850, 1400],
    y: [330, 1150]
};


/** Used for generating unique id values */
const idCounters = {
    'legendId': 0
};


/** Generates a unique id value for the given type key */
function uniqueId(counterKey) {
    if (!idCounters.hasOwnProperty(counterKey)) {
        idCounters[counterKey] = 0;
    }
    return idCounters[counterKey]++;
}


/**
 * Loads the project using async Promises.
 *
 * The data for a given promise can be accessed using the Promise.then
 * method.
 */
function loadData() {
    for (var i = 0; i < datafiles.length; ++i) {
        var vname = datafiles[i].split('.')[0].toLowerCase();
        data[vname] = d3.json(datadir + datafiles[i]);
    }
}


/**
 * Zip data into flat array for working with D3.
 */
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


function main(x, y, bed, surface, thickness, vx, vy) {
    plotChart00(x, y, surface);
    plotChart01(x, y, surface);
}


function plotChart00(x, y, surface) {
    plotSurface(x, y, surface, CHART_MARGIN, CHART_00_ID,
        'Surface Elevation (MSL)', CHART_CMAP, 0.21);
}


function plotChart01(x, y, surface) {
    const xx = x.slice(NEGIS_SLICES_MAIN.x);
    const yy = y.slice(NEGIS_SLICES_MAIN.y);
    const zz = surface.slice(NEGIS_SLICES_MAIN.y, NEGIS_SLICES_MAIN.x);
    plotSurface(xx, yy, zz, CHART_MARGIN, CHART_01_ID,
        'Surface Elevation (MSL)', CHART_CMAP, 0.75);
}


/**
 * Plot a 3D surface data as a 2D raster.
 *
 * @param cmap The sequential color interpolator to use.
 * @param scale The scale factor to scale the data with. Default 1:1.
 */
function plotSurface(x, y, z, margin, chartId, legendText, cmap, scale=1) {
    // Scaling for display of data as pixels.
    var max = Math.max(x.size, y.size);
    const dataScale = d3.scaleLinear()
        .domain([0, max])
        .range([0, Math.floor(max * scale)]);
    const height = dataScale(y.size);
    const width = dataScale(x.size);
    const outerHeight = height + margin.top + margin.bottom;
    const outerWidth = width + margin.left + margin.right;

    // Clear previous plots if any
    const chartContainer = d3.select(chartId);
    chartContainer.selectAll('canvas').remove();
    chartContainer
        .style('width', outerWidth + 'px')
        .style('height', outerHeight + 'px');
    const svg = chartContainer.append('svg:svg')
        .attr('width', outerWidth)
        .attr('height', outerHeight)
        .attr('class', 'svg-plot')
        .append('g')
        .attr('transform',
            'translate(' + margin.left + ', ' + margin.top + ')');
    const canvas = chartContainer.append('canvas')
        .attr('width', width)
        .attr('height', height)
        // +1 to prevent covering the left axis
        .style('margin-left', margin.left + 1 + 'px')
        .style('margin-top', margin.top + 'px')
        .attr('class', 'canvas-plot');

    rasterPlot(x, y, z, width, height, svg, canvas, legendText, cmap,
            dataScale);
}


/**
 * Draws the raster data on the canvas and adds a legend and axes.
 */
function rasterPlot(x, y, z, canvasWidth, canvasHeight, svg, canvas,
        legendText, cmap, dataScale) {
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
    // X axis text
    svg.append('text')
        .attr('x', (canvasWidth / 2) - 40)
        .attr('y', canvasHeight + 40)
        .text('East/West (km)');
    // Y axis text
    svg.append('text')
        // Flip x and y and use negative  due to rotation
        .attr('x', -((canvasHeight / 2) + 30))
        .attr('dy', '-3.5em')
        .attr('transform', 'rotate(-90)')
        .text('North/South (km)');

    const legendColor = d3.scaleSequential(cmap);
    const legendScale = d3.scaleLinear();
    addLegend(z, canvasWidth, canvasHeight, legendScale, legendColor, svg,
        legendText);

    const color = d3.scaleSequential(cmap)
        .domain([z.min(), z.max()]);

    drawRects(linData, color, dataScale, context);
}


/**
 * Add a vertical legend to the right side of the plot as an SVG group.
 */
function addLegend(z, plotWidth, plotHeight, legendScale, legendColor, svg,
        legendText) {
    const legendWidth = 20,
        legendHeight = plotHeight,
        legendX = plotWidth + 10,
        legendY = 0;
    legendColor.domain([0, 100]);
    const gradId = 'z-legend-grad-' + uniqueId('legendId');
    const legendGrad = svg.append('defs')
        .append('linearGradient')
        .attr('id', gradId)
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
        .style('fill', `url(#${gradId})`);
    legendScale
        .domain([z.min(), z.max()])
        .range([plotHeight, 0]);
    const legendAxis = d3.axisRight(legendScale);
    legendContainer.append('g')
        .attr('transform', 'translate(' + (legendX + legendWidth) + ', 0)')
        .call(legendAxis);
    legendContainer.append('text')
        .attr('x', -((legendHeight / 2) + 30))
        .attr('y', legendX + legendWidth + 60)
        .attr('transform', 'rotate(-90)')
        .text(legendText);
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


$('document').ready(function() {
    loadData();
    Promise.all(
        [
            data.x,
            data.y,
            data.bed,
            data.surface,
            data.thickness,
            data.vx,
            data.vy
        ])
        .then(([x, y, bed, surface, thickness, vx, vy]) => {
            x = nj.float64(x).divide(1000.0);
            y = nj.float64(y).divide(1000.0);
            bed = nj.float64(bed);
            surface = nj.float64(surface);
            thickness = nj.float64(thickness);
            vx = nj.float64(vx);
            vy = nj.float64(vy);
            main(x, y, bed, surface, thickness, vx, vy);
        });
});
