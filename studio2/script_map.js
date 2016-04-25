var margin = {top: 100, right: 20, bottom: 50, left:20},
    width = 880 - margin.left - margin.right,
    height = 480 - margin.top - margin.bottom;


var chart1 = d3.select( "#plot1" )
  .append( "svg" )
  .attr( "width", width )
  .attr( "height", height );

//var svg2 = d3.select( "#plot2" )
//  .append( "svg" )
//  .attr( "width", width )
//  .attr( "height", height );
//

//var slider = d3.slider().axis(true).min(1947).max(2016);
//var sliderLabel = d3.select("#slider")
//    .append("div")
//    .attr("class","sliderLabel")
//    .append("text")
//    .attr("x","0")
//    .attr("y","0")
//    .text("2016");

var tooltip1 = d3.select("body")
    .append("div")	
    .attr("class", "tooltip")				
    .style("opacity", 0);

var scaleX = d3.time.scale().range([0,width]).domain([new Date(1,1, 1947), new Date(1,1,2016)]);

var scaleCirc = d3.scale.linear().domain([0,65500]).range([0,30]);
var scaleCirc2 = d3.scale.sqrt().domain([0,3300]).range([2,20]);


queue()
    .defer(d3.csv, 'data/infected_24march2016.csv', parseInfected)
    .defer(d3.csv, 'data/zikaTimeline.csv', parseTimeline)
    .defer(d3.json, 'data/zika.json')
    .defer(d3.json, 'data/zika_binned.json')
    .defer(d3.json, 'data/map.json')
    .await(DataLoaded)

function DataLoaded(err, infected, zikaTime, zikaTweets, zikaTweetsHr, mapData){
    console.log(zikaTime);
    console.log(infected);
//    console.log(zikaTweets);
//    console.log(zikaTweetsHr);

//map
    var projection = d3.geo.equirectangular()
                                .scale(150)
                                .translate([width/2, height/2])
                                .precision(.1);

    var geoPath = d3.geo.path().projection(projection);
        chart1.append('g')
            .selectAll("path")
            .data(mapData.features)
            .enter()
            .append("path")
            .attr("fill", "#DEDDDD")
            .attr("stroke", "#ADACAC")
            .attr("d", geoPath); 
       


//tweets
     chart1.selectAll('tweets')
            .data(zikaTweets)
            .enter()
            .append('circle')
            .attr("class","zikaTweets")
            .attr('cx', function(d){ return projection([d.x, d.y])[0]; })
            .attr('cy', function(d){ return projection([d.x, d.y])[1]; })
            .attr('r', 3)
            .style('fill', 'rgba(83,121,153,.5)');

//confirmed infections    
      chart1.selectAll('infections')
             .data(infected)
             .enter()
             .append('circle')
             .attr('cx', function(d){ return projection([d.lng, d.lat])[0]; })
             .attr('cy', function(d){ return projection([d.lng, d.lat])[1]; })
             .attr('r', function(d) { return scaleCirc2(d.confirmed); })
             .style("stroke", 'rgba(255,255,255,1)')
             .style('stroke-width', .3)
             .style('fill', 'rgba(175,55,55,.6)')
             .on("mouseover", function(d) {
             tooltip1.transition()
                 .duration(100)
                 .style("opacity", .9);
             tooltip1.html(d.state + "<br>"  + "# of Infected cases " + d.confirmed)    
                 .style("left", (d3.event.pageX +14) + "px")
                 .style("top", (d3.event.pageY -14) + "px");
             })
         .on("mouseout", function(d) {
             tooltip1.transition()
                 .duration(1000)
                 .style("opacity", 0);
                })  
      
}


    

function parseInfected(d){
    return {
        region: d.Region,
        country: d.Country,
        state: d.Location,
        lat: +d.lat,
        lng: +d.lng,
        confirmed: +d.confirmed,
        suspected: +d.suspected
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



