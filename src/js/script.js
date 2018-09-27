$("document").ready(function() {
    plotDataCanvas();
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


function condense(x, y, z) {
    var out = [];
    var istart = 0;
    var jstart = 0;
    var iend = x.length;
    var jend = y.length;
    for (i = istart; i < iend; ++i) {
        for (j = jstart; j < jend; ++j) {
            out.push({
                x: i,
                i: i,
                y: j,
                j: j,
                z: z[j][i]
            });
        }
    }
    return out;
}


function plotDataNoBinding() {
    // Clear previous plots if any
    d3.select("#chart").selectAll("canvas").remove();

    var x = d3.json("data/x.json");
    var y = d3.json("data/y.json");
    var h = d3.json("data/thickness.json");
    Promise.all([x, y, h]).then(([x, y, z]) => {
        data = condense(x, y, z);
        var min = min2d(z);
        var max = max2d(z);

        var aspectRatio = x.length / y.length;
        var height = Math.floor(y.length / 2);
        var width = Math.floor(x.length / 2);
        var scale = d3.scaleLinear()
            .domain([0, y.length])
            .range([0, height]);

        var canvas = d3.select("#chart").append("canvas")
            .attr('width', width)
            .attr('height', height);
        var context = canvas.node().getContext('2d');

        var color = d3.scaleSequential(d3.interpolateViridis)
            .domain([min, max]);
        data.forEach((d, i) => {
            context.beginPath();
            context.rect(scale(d.x), scale(d.y), scale(1), scale(1));
            context.fillStyle = color(d.z);
            context.fill();
            context.closePath();
        });
    });
}
