"use strict";

var m = {t:50,r:100,b:50,l:100},
    w = d3.select('.plot').node().clientWidth- m.l- m.r,
    h = d3.select('.plot').node().clientHeight - m.t - m.b;

var plot = d3.select('.plot')
    .append('svg')
    .attr('width',w+ m.l+ m.r)
    .attr('height',h+ m.t+ m.b)
    .append('g').attr('class','lineGraph')
    .attr('transform','translate('+ m.l+','+ m.t+')');

d3.csv('data/topPorts.csv',parse,dataLoaded);

function dataLoaded(err,rows){
    var yMax = d3.max(rows,function(d){return d.containers})
    console.log(yMax);
    var xMax = d3.max(rows,function(d){return d.year})
    console.log(xMax);
    var xMin = d3.min(rows,function(d){return d.year})
    console.log(xMin);

    //Scale and axes
    //var scales = {};
    //scales.x = d3.scale.linear().domain([xMin,xMax]).range([0,w/2]),
    var scaleX = d3.scale.linear().domain([xMin ,xMax]).range([0,w])
    var scaleY = d3.scale.linear().domain([0,yMax]).range([h,0]);

    var axisX = d3.svg.axis()
        .orient('bottom')
        .scale(scaleX)
        .tickSize(-h,0)
        .tickFormat(function(d) {
            return d;
        });

    var axisY = d3.svg.axis()
        .orient('left')
        .scale(scaleY)
        .tickSize(-w,0);


    var portNested = d3.nest()
        .key(function(d){
            return d.port})
        .entries(rows);
        console.log(portNested);


    //DRAWING

    //Draw axes once
    plot.append('g')
        .attr('class','axis x')
        .attr('transform','translate(0,'+h+')')
        .call(axisX);
    plot.append('g')
        .attr('class','axis y')
        .call(axisY);

    draw(portNested, scaleX, scaleY);
}

function draw(data, scaleX, scaleY){

    console.log(data.length);
    
    //Draw dots
    plot.append("g")
        .classed("dots", true)
        .selectAll("g")
        .data(data)
        .enter()    //create 50 empty placeholders
        .append("g")
        .attr("class", function(d, i) { console.log(i); return d.key; })
        .selectAll('.dot')
        .data(function(d){ return d.values; })
        .enter()
        .append('circle')
        .attr('class', 'dot')
        .attr('cx', function(d){
            return scaleX(d.year);
        })
        .attr('cy',function(d){
            return scaleY(d.containers);
        })
        .attr("containerValue", function(d) { return d.containers; })
        .attr('r', 4)
        .style("stroke", 'rgba(255,255,255,1)') 
        .style('stroke-width', .5)
        .style('fill', 'rgba(83,121,153,.3)');

}

function parse(d){

    return {
        ranking: +d.Ranking,
        port: d.Port,
        country: d.Country,
        region: d.Region,
        year: +d.Year,
        containers: +d.Container,
        longitude: +d.Longitude,
        latitude: +d.Latitude
    }
}