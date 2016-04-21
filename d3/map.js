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

var width = 800, 
    height = 300;

var svg = d3.select( "#plot" )
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

function DataLoaded(err, ports, mapData){
    console.log(ports);

    // Parse timestamp 
//    ports.forEach(function(d){
//        var parseYear = new Date(d.timestamp*1000);
//        d.year = parseYear.getFullYear();
//
//    });

    
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
            .data(ports)
            .enter()
            .append('circle')
            .attr("class","ports")
            .attr('cx', function(d){ return projection([d.lng, d.lat])[0]; })
            .attr('cy', function(d){ return projection([d.lng, d.lat])[1]; })
            .attr("r",function(d) {if (d.year==2004) {return d.containers/1000000;} else {return 0;}})
    
            .style("stroke", 'rgba(255,255,255,1)') 
            .style('stroke-width', .5)
    
//            .style('fill', colorRange([   function(d)return d.region); ]))
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
     
}


function parsePorts(d){
    return {
        ranking: d.Ranking,
        port: d.Port,
        region: d.Region,
        year: +d.Year,
        lat: +d.Latitude,
        lng: +d.Longitude,
        containers: +d.Container
    }
}

