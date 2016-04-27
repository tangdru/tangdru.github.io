
//    width = document.getElementById('canvas').clientWidth - margin.l - margin.r,
//    height = document.getElementById('canvas').clientHeight - margin.t - margin.b;
//
//var canvas = d3.select('.canvas')
//    .append('svg')
//    .attr('width', width + margin.l + margin.r)
//    .attr('height', height + margin.t + margin.b)
//    .append('g')
//    .attr('transform','translate('+margin.l+','+margin.t+')');

"use strict";

//var m = {t:50,r:100,b:50,l:100},
//    width = d3.select('.plot').node().clientWidth- m.l- m.r,
//    height = d3.select('.plot').node().clientHeight - m.t - m.b;
//
//var svg = d3.select('#plot').append('svg')
//    .attr('width',w+ m.l+ m.r)
//    .attr('height',h+ m.t+ m.b)
//    .append('g').attr('class','lineGraph')
//    .attr('transform','translate('+ m.l+','+ m.t+')');
var margin = {t:100,r:50,b:100,l:50}
var width = 800, 
    height = 300;

var svg = d3.select( "#plot" )
  .append( "svg" )
  .attr( "width", width )
  .attr( "height", height );

var svg2 = d3.select( "#plot" )
  .append( "svg" )
  .attr( "width", width )
  .attr( "height", height );

var svgPlot = d3.select('#plot')
    .append('svg')
    .attr('width', width)
    .attr('height', 20)



//slider
var slider = d3.slider().axis(true).min(2004).max(2015);
var sliderLabel = d3.select("#slider")
    .append("div")
    .attr("class","sliderLabel")
    .append("text")
    .attr("x","0")
    .attr("y","0")
    .text("2004");

var tooltip = d3.select("body").append("div")	
    .attr("class", "tooltip")				
    .style("opacity", 0);


queue()
    .defer(d3.csv, 'data/topPorts.csv', parsePorts)
    .defer(d3.json, 'data/map.json')
    .await(DataLoaded)

function DataLoaded(err, data, mapData){
    console.log(data);

// Parse timestamp 
//    ports.forEach(function(d){
//        var parseYear = new Date(d.timestamp*1000);
//        d.year = parseYear.getFullYear();
//
//    });
 
var yMax = d3.max(data,function(d){return d.containers})
//    console.log(yMax);
var yMin = d3.min(data,function(d){return d.containers})

var xMax = d3.max(data,function(d){return d.year})
//    console.log(xMax);
var xMin = d3.min(data,function(d){return d.year})
//    console.log(xMin);

var scaleCirc = d3.scale.sqrt().domain([yMin,yMax]).range([1.5,20]);

//container axis    
var scaleX = d3.scale.linear().domain([xMin ,xMax]).range([0,width])
var scaleY = d3.scale.linear().domain([0,yMax]).range([height,0]);


var axisX = d3.svg.axis()
    .orient('bottom')
    .scale(scaleX)
    .tickSize(-height,0)
    .tickFormat(function(d) {return d;});

var axisY = d3.svg.axis()
    .orient('left')
    .scale(scaleY)
    .tickSize(-width,0);


var portNested = d3.nest()
    .key(function(d){return d.port})
    .entries(data);
    console.log(portNested);    
    

map(data)
function map(data){
var projection = d3.geo.equirectangular()
    .scale(130)
    .translate([width/2, height/2])
    .precision(.1);

var geoPath = d3.geo.path().projection(projection);
    svg.append('g')
        .selectAll("path")
        .data(mapData.features)
        .enter()
        .append("path")
        .attr("fill", "#DEDDDD")
        .attr("stroke", "#ADACAC")
        .attr("d", geoPath); 
       
    svg.selectAll('timeline')
        .data(data)
        .enter()
        .append('circle')
        .attr("class","dot")
        .attr('cx', function(d){ return projection([d.lng, d.lat])[0]; })
        .attr('cy', function(d){ return projection([d.lng, d.lat])[1]; })
        .attr("r",function(d){return scaleCirc(d.containers);})
//.attr("r",function(d) {if (d.year==2004) {return scaleCirc(d.containers);} else {return 0;}})
        .style("stroke", 'rgba(255,255,255,1)') 
        .style('stroke-width', .5)
        .style('fill', 'rgba(83,121,153,.3)');
    }

//slider

slider(data)
function slider(data){
    var x = d3.scale.linear()
    .domain([0, 180])
    .range([0, width])
    .clamp(true);

var brush = d3.svg.brush()
    .x(x)
    .extent([0, 0])
    .on("brush", brushed);

var svgPlot = d3.select("body").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

svgPlot.append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(0," + height / 2 + ")")
    .call(d3.svg.axis()
      .scale(x)
      .orient("bottom")
      .tickFormat(function(d) { return d + "°"; })
      .tickSize(0)
      .tickPadding(12))
  .select(".domain")
  .select(function() { return this.parentNode.appendChild(this.cloneNode(true)); })
    .attr("class", "halo");

var slider = svg.append("g")
    .attr("class", "slider")
    .call(brush);

slider.selectAll(".extent,.resize")
    .remove();

slider.select(".background")
    .attr("height", height);

var handle = slider.append("circle")
    .attr("class", "handle")
    .attr("transform", "translate(0," + height / 2 + ")")
    .attr("r", 9);

slider
    .call(brush.event)
  .transition() // gratuitous intro!
    .duration(750)
    .call(brush.extent([70, 70]))
    .call(brush.event);

function brushed() {
  var value = brush.extent()[0];

  if (d3.event.sourceEvent) { // not a programmatic event
    value = x.invert(d3.mouse(this)[0]);
    brush.extent([value, value]);
  }

  handle.attr("cx", x(value));
  d3.select("body")
      .style("fill", d3.hsl(value, .8, .8));
}
    
    
    
    
}

    
    
//draw axis 
    svg2.append('g')
        .attr('class','axis x')
        .attr('transform','translate(0,'+height+')')
        .call(axisX);
    svg2.append('g')
        .attr('class','axis y')
        .call(axisY);

    
//draw linechart    
lineChart(portNested, scaleX, scaleY);

function lineChart(data, scaleX, scaleY){

    //Draw LINE
    var line = d3.svg.line()
        .x(function(d){ return scaleX(d.year);})
        .y(function(d){ return scaleY(d.containers);})
        .interpolate('cardinal');  //or 'basis'


    var ports = svg2.selectAll('.port') //all 50 porst
        .data(data)
        .enter()
        .append('g')
        .attr('class','port');

    ports.append('path')
        .datum(function(d){return d.values;})
        .attr('d', line)
        .attr('stroke', 'black')
        .attr('fill', 'rgba(0,0,0,0)');


    //Draw DOTS
    svg2.append("g")
        .classed("dots", true)
        .selectAll("g")
        .data(data)
        .enter()    //create 50 empty placeholders
        .append("g")
        .attr("class", function(d) {return d.key; })
        .selectAll('.dot')
        .data(function(d){ return d.values; })
        .enter()
        .append('circle')
        .attr('class', 'dot')
        .attr('cx', function(d){return scaleX(d.year);})
        .attr('cy',function(d){return scaleY(d.containers);})
        .attr("containerValue", function(d) { return d.containers; })
        .attr("r",function(d){return scaleCirc(d.containers);})
        .style('fill', 'rgba(83,121,153,.3)');
    }
    
    
}    
    






function parsePorts(d){

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


