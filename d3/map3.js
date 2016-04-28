var margin = {
        t: 20,
        r: 300,
        b: 100,
        l: 100
    },
    width = innerWidth - margin.l - margin.r,
    height = innerHeight - margin.t - margin.b;

var svg1 = d3.select('#plot').append('svg')
    .attr('width', width + margin.l + margin.r)
    .attr('height', height + margin.t + margin.b)
    .append('g').attr('class', 'lineGraph')
    .attr('transform', 'translate(' + margin.l + ',' + margin.t + ')');

var svg2 = d3.select('#plot2').append('svg')
    .attr('width', width + margin.l + margin.r)
    .attr('height', height + margin.t + margin.b)
    .append('g').attr('class', 'lineGraph')
    .attr('transform', 'translate(' + margin.l + ',' + margin.t + ')');

// var svg3 = d3.select('#plot').append('svg')
//     .attr('width', width + margin.l + margin.r)
//     .attr('height', height + margin.t + margin.b)
//     .append('g').attr('class', 'lineGraph')
//     .attr('transform', 'translate(' + margin.l + ',' + margin.t + ')');


//brush
var slider = d3.slider().axis(true).min(2004).max(2015);
var sliderLabel = d3.select("#slider")
    .append("svg")
    .attr("x", "0")
    .attr("y", "0");



// var tooltip = d3.select("body").append("div")
//     .attr("class", "tooltip")
//     .style("opacity", 0);


queue()
    .defer(d3.csv, 'data/topPorts.csv', parsePorts)
    .defer(d3.json, 'data/map.json')
    .await(DataLoaded)

function DataLoaded(err, data, mapData) {
    console.log(data);


    var yMax = d3.max(data, function(d) {
        return d.containers
    })

    var yMin = d3.min(data, function(d) {
        return d.containers
    })

    var xMax = d3.max(data, function(d) {
        return d.year
    })

    var xMin = d3.min(data, function(d) {
        return d.year
    })


    var scaleCirc = d3.scale.sqrt().domain([yMin, yMax]).range([1.5, 20]);

    //container axis
    var scaleX = d3.scale.linear().domain([xMin, xMax]).range([0, width])
    var scaleY = d3.scale.linear().domain([0, yMax]).range([height, 0]);


    var axisX = d3.svg.axis()
        .orient('bottom')
        .scale(scaleX)
        .tickSize(-height, 0)
        .tickFormat(function(d) {
            return d;
        });

    var axisY = d3.svg.axis()
        .orient('left')
        .scale(scaleY)
        .tickSize(-width, 0);


    var portNested = d3.nest()
        .key(function(d) {
            return d.port
        })
        .entries(data);
    console.log(portNested);


    map(data)

    function map(data) {
        var projection = d3.geo.equirectangular()
            .scale(170)
            .translate([width / 2, height / 2])
            .precision(.1);

        var geoPath = d3.geo.path().projection(projection);
        svg1.append('g')
            .selectAll("path")
            .data(mapData.features)
            .enter()
            .append("path")
            .attr("fill", "#DEDDDD")
            .attr("stroke", "#ADACAC")
            .attr("d", geoPath);

        var nodes = svg1.selectAll('locations')
            .data(data);

        var nodesEnter = nodes.enter()
            .append('circle')
            .classed('dot', true)
            .attr('cx', function(d) {
                return projection([d.lng, d.lat])[0];
            })
            .attr('cy', function(d) {
                return projection([d.lng, d.lat])[1];
            })
            .style("stroke", 'rgba(255,255,255,1)')
            .style('stroke-width', .5)
            .style('fill', 'rgba(83,121,153,.2)')
            // .attr("r", 3)
            // .transition().duration(600)
            .attr("r", function(d) {
                if (d.year == 2004)
                    return scaleCirc(d.containers);
            });
        nodes.exit()
            .transition().duration(200)
            .attr("r", 0)
            .remove();
    }

    slider.on("slide", function(event, value) {
        var intValue = parseInt(value); // the value have decimals. Need to parse it to a int
        // sliderLabel.text(intValue);

        // Hide the circles which the year is larger than the slide value
        d3.selectAll(".dot").filter(function(d) {
                return d.year > intValue;
            })
            .transition().duration(100)
            .attr("r", "0");

        // Show circles which the year is smaller or equal
        d3.selectAll(".dot")
            .transition().duration(200)
            .attr("r", function(d) {
                if (d.year - 2 < intValue && d.year <= intValue) {
                    return scaleCirc(d.containers);
                } else {
                    return 0;
                }
            });
    });

    d3.select("#slider")
        .append("div")
        .attr("class", "sliderItem")
        .call(slider);


    //draw axis
    svg2.append('g')
        .attr('class', 'axis x')
        .attr('transform', 'translate(0,' + height + ')')
        .call(axisX);
    svg2.append('g')
        .attr('class', 'axis y')
        .call(axisY);


    //draw linechart
    lineChart(portNested, scaleX, scaleY);

    function lineChart(data, scaleX, scaleY) {

        //Line Generator
        var line = d3.svg.line()
            .x(function(d) {
                return scaleX(d.year);
            })
            .y(function(d) {
                return scaleY(d.containers);
            })
            .interpolate('cardinal'); //or 'basis'


        var ports = svg2.selectAll('.port') //all 50 porst
            .data(data)
            .enter()
            .append('g')
            .attr('class', 'port');

        ports.append('path')
            .datum(function(d) {
                return d.values;
            })
            .attr('d', line)
            .attr('stroke', 'gray')
            .attr('fill', 'rgba(0,0,0,0)');

        var portG = svg2.selectAll('.portSize')
            .data(data)
            .enter()
            .append("g")
            .classed("postSize", true);

        portG.selectAll("circle")
            .data(function(d) {
                return d.values;
            })
            .enter()
            .append('circle')
            .classed('dot', true)
            .attr("r", 5)
            .attr('cx', function(d) {
                return scaleX(d.year);
            })
            .attr('cy', function(d) {
                return scaleY(d.containers);
            })
            .style("stroke", 'rgba(255,255,255,1)')
            .style('stroke-width', .5)
            .style('fill', 'rgba(83,121,153,.2)');

        // .transition().duration(600)
        // .attr("r", function(d) {
        //     return scaleCirc(d.containers);
        // });


        ports.append("text")
            .datum(function(d) {
                return {
                    name: d.key,
                    value: d.values[d.values.length - 1],
                    rank: d.values[d.values.length - 1].ranking
                };
            })
            .attr("transform", function(d) {
                return "translate(" + scaleX(d.value.year) + "," + scaleY(d.value.containers) + ")";
            })
            .attr("x", 10)
            .attr("dy", ".35em")
            .text(function(d) {
                return d.rank + "     " + d.name;
            });
    }


}



function parsePorts(d) {

    return {
        ranking: +d.Ranking,
        port: d.Port,
        country: d.Country,
        region: d.Region,
        year: +d.Year,
        containers: +d.Container,
        lng: +d.Longitude,
        lat: +d.Latitude
    }
}
