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

var width = 960, 
    height = 560;

var svg = d3.select( "#plot" )
  .append( "svg" )
  .attr( "width", width )
  .attr( "height", height );

// slider 1
// var slider = d3.slider().min(1945).max(2020).ticks(10).showRange(false).value(1947);
// // Render the slider in the div
// d3.select('#slider').call(slider);

var slider = d3.slider().axis(true).min(1945).max(2020);
var sliderLabel = d3.select("#slider")
    .append("div")
    .attr("class","sliderLabel")
    .append("text")
    .attr("x","0")
    .attr("y","0")
    .text("Default");

var tooltip = d3.select("body").append("div")	
    .attr("class", "tooltip")				
    .style("opacity", 0);


queue()
    .defer(d3.csv, 'data/infected_24march2016.csv', parseInfected)
    .defer(d3.csv, 'data/zikaTimeline.csv', parseTimeline)
    .defer(d3.json, 'data/zika.json')
    .defer(d3.json, 'data/map.json')
    .await(DataLoaded)

function DataLoaded(err, infected, zikaTime, zikaTweets, mapData){
    console.log(zikaTime);
   // console.log(infected);
    console.log(zikaTweets);

    // Parse timestamp in zikaTweets
    zikaTweets.forEach(function(d){
        var parseYear = new Date(d.timestamp*1000);
        d.year = parseYear.getFullYear();

    });

    
//    var baseMap = svg.append( "g" );
    var projection = d3.geo.equirectangular()
                                .scale(200)
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
            .data(zikaTime)
            .enter()
            .append('circle')
            .attr("class","zikaTime")
            .attr('cx', function(d){ return projection([d.lng, d.lat])[0]; })
            .attr('cy', function(d){ return projection([d.lng, d.lat])[1]; })
            .attr('r', 4)
//            .style("stroke", 'rgba(255,255,255,1)') 
//            .style('stroke-width', .1)
            .style('fill', 'rgba(155,55,55,.7)');
    
    
     svg.selectAll('tweets')
            .data(zikaTweets)
            .enter()
            .append('circle')
            .attr("class","zikaTweets")
            .attr('cx', function(d){ return projection([d.x, d.y])[0]; })
            .attr('cy', function(d){ return projection([d.x, d.y])[1]; })
            .attr('r', 2)
            .style("stroke", 'rgba(255,255,255,1)')
            .style('stroke-width', .1)
            .style('fill', 'rgba(83,121,153,.5)');
//     
//      svg.selectAll('infections')
//             .data(infected)
//             .enter()
//             .append('circle')
//             .attr('cx', function(d){ return projection([d.lng, d.lat])[0]; })
//             .attr('cy', function(d){ return projection([d.lng, d.lat])[1]; })
//             .attr('r', function(d) { return d.confirmed/60; })
//             .style("stroke", 'rgba(255,255,255,1)')
//             .style('stroke-width', .1)
//             .style('fill', 'rgba(175,55,55,.5)')
//             .on("mouseover", function(d) {
//             tooltip.transition()
//                 .duration(200)
//                 .style("opacity", .9);
//             tooltip.html(d.state + "<br/>"  + d.confirmed)
//                 .style("left", (d3.event.pageX) + "px")
//                 .style("top", (d3.event.pageY - 28) + "px");
//             })
//         .on("mouseout", function(d) {
//             div.transition()
//                 .duration(500)
//                 .style("opacity", 0);
//         })

    
    // Slider function

    slider.on("slide",function(event,value){
        var intValue = parseInt(value); // the value have decimals. Need to parse it to a int
        sliderLabel.text(intValue);
        
        // Hide the circles which the year is larger than the slide value
        d3.selectAll(".zikaTime, .zikaTweets").filter(function(d){
            return d.year>intValue;
        })
            .transition()
            .attr("r","0");

        // Show circles which the year is smaller or equal
        d3.selectAll(".zikaTime, .zikaTweets").filter(function(d){
            return d.year<=intValue;
        })
            .transition()
            .attr("r",function(){
                if(d3.select(this).attr("class")=="zikaTime")
                    return 3;
                else
                    return 2;
            });
    });

    d3.select("#slider")
        .append("div")
        .attr("class","sliderItem")
        .call(slider);
     
}


function parseInfected(d){
    return {
        region: d.Region,
        country: d.Country,
        state: d.State,
        lat: +d.lat,
        lng: +d.lng,
        confirmed: +d.confirmed
    }
}

function parseTimeline(d){
    return {
        year: +d.year,
        month: d.month,
        country: d.country,
        state: d.State,
        lat: +d.lat,
        lng: +d.lng,
        infections: +d.zika
    }
}

