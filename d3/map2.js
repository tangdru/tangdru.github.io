//var margin = {t:100,r:50,b:100,l:50},
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
//    w = d3.select('.plot').node().clientWidth- m.l- m.r,
//    h = d3.select('.plot').node().clientHeight - m.t - m.b;
//
//var svg = d3.select('#plot').append('svg')
//    .attr('width',w+ m.l+ m.r)
//    .attr('height',h+ m.t+ m.b)
//    .append('g').attr('class','lineGraph')
//    .attr('transform','translate('+ m.l+','+ m.t+')');

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
var xMax = d3.max(data,function(d){return d.year})
//    console.log(xMax);
var xMin = d3.min(data,function(d){return d.year})
//    console.log(xMin);

//container axis    
var scaleX = d3.scale.linear().domain([xMin ,xMax]).range([0,width])
var scaleY = d3.scale.linear().domain([0,yMax]).range([height,0]);

    var axisX = d3.svg.axis()
        .orient('bottom')
        .scale(scaleX)
        .tickSize(-height,0)
        .tickFormat(function(d) {
            return d;
        });

    var axisY = d3.svg.axis()
        .orient('left')
        .scale(scaleY)
        .tickSize(-width,0);


    var portNested = d3.nest()
        .key(function(d){
            return d.port})
        .entries(data);
        console.log(portNested);    
    

//map   
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
            .attr("class","ports")
            .attr('cx', function(d){ return projection([d.lng, d.lat])[0]; })
            .attr('cy', function(d){ return projection([d.lng, d.lat])[1]; })
            .attr("r",function(d) {if (d.year==2004) {return d.containers/1000000;} else {return 0;}})
            .style("stroke", 'rgba(255,255,255,1)') 
            .style('stroke-width', .5)
            .style('fill', 'rgba(83,121,153,.3)');

    
    // Slider function
slider.on("slide",function(event,value){
        var intValue = parseInt(value); // the value have decimals. Need to parse it to a int
        sliderLabel.text(intValue);
        
        // Hide the circles which the year is larger than the slide value
        d3.selectAll(".ports").filter(function(d){
            return d.year>intValue;
        })
        .transition()
        .attr("r","0");

        // Show circles which the year is smaller or equal
        d3.selectAll(".ports")
//        .transition()
        .attr("r",function(d) {
            if (d.year-2<intValue && d.year<=intValue) {
                return d.containers/1000000; 
            } else {
                return 0;
            }
        });
    });

    d3.select("#slider")
        .append("div")
        .attr("class","sliderItem")
        .call(slider);
    
    
//draw axis 
    svg2.append('g')
        .attr('class','axis x')
        .attr('transform','translate(0,'+height+')')
        .call(axisX);
    svg2.append('g')
        .attr('class','axis y')
        .call(axisY);

    draw(portNested, scaleX, scaleY);

//draw linechart    
function draw(data, scaleX, scaleY){

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
        .datum(function(d){
            return d.values;
        })
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
        .attr("class", function(d) { //console.log(i);
            return d.key; })
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
        .attr('r', 3);
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


