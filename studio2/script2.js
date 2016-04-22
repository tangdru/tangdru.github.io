//var margin = {t:100,r:50,b:100,l:50},
//    width = document.getElementById('.container').clientWidth - margin.l - margin.r,
//    height = document.getElementById('.container').clientHeight - margin.t - margin.b;
//
//var svg = d3.select('#plot')
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


var slider = d3.slider().axis(true).min(1947).max(2016);
var sliderLabel = d3.select("#slider")
    .append("div")
    .attr("class","sliderLabel")
    .append("text")
    .attr("x","0")
    .attr("y","0")
    .text("2016");

var tooltip = d3.select("body").append("div")	
    .attr("class", "tooltip")				
    .style("opacity", 0);

var scaleX = d3.time.scale().range([0,width]).domain([new Date(1,1, 1947), new Date(1,1,2016)]);

var scaleCirc = d3.scale.linear().domain([0,65500]).range([0,30]);
var scaleCirc2 = d3.scale.linear().domain([0,3300]).range([2,15]);

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


    // Parse timestamp in zikaTweets
    zikaTweets.forEach(function(d){
        var parseYear = new Date(d.timestamp*1000);
        d.year = parseYear.getFullYear();

    });
    
        //timeline   
//svg.selectAll('zikaTimeline')
//            .data(zikaTime)
//            .enter()
//            .append('circle')
//            .attr("class","zikaTime2")
//            .attr('cx', function(d){return scaleX(new Date(1,1,d.year))}) 
//            .attr('cy', function(d,i){return i*6})
//            .attr('r',  4)
//            .style('fill', 'rgba(155,55,55,.3)');
//    

    
//    var baseMap = svg.append( "g" );
    var projection = d3.geo.equirectangular()
                                .scale(150)
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
       
//    svg.selectAll('timeline')
//            .data(zikaTime)
//            .enter()
//            .append('circle')
//            .attr("class","zikaTime")
//            .attr('cx', function(d){ return projection([d.lng, d.lat])[0]; })
//            .attr('cy', function(d){ return projection([d.lng, d.lat])[1]; })
//            .attr('r', 3)
////            .style("stroke", 'rgba(255,255,255,1)') 
////            .style('stroke-width', .1)
//            .style('fill', 'rgba(155,55,55,.7)');


     svg.selectAll('tweets')
            .data(zikaTweets)
            .enter()
            .append('circle')
            .attr("class","zikaTweets")
            .attr('cx', function(d){ return projection([d.x, d.y])[0]; })
            .attr('cy', function(d){ return projection([d.x, d.y])[1]; })
            .attr('r', 3)
//            .style("stroke", 'rgba(255,255,255,1)')
//            .style('stroke-width', .1)
            .style('fill', 'rgba(83,121,153,.5)');
    
//          svg.selectAll('infections')
//             .data(infected)
//             .enter()
//             .append('circle')
//             .attr('cx', function(d){ return projection([d.lng, d.lat])[0]; })
//             .attr('cy', function(d){ return projection([d.lng, d.lat])[1]; })
////             .attr('r', function(d) { return scaleCirc(d.suspected); })
//             .style("stroke", 'rgba(255,255,255,1)')
//             .style('stroke-width', .1)
//             .style('fill', 'rgba(5,255,55,.5)');
       
      svg.selectAll('infections')
             .data(infected)
             .enter()
             .append('circle')
             .attr('cx', function(d){ return projection([d.lng, d.lat])[0]; })
             .attr('cy', function(d){ return projection([d.lng, d.lat])[1]; })
//             .attr('r', 5)
             .attr('r', function(d) { return scaleCirc2(d.confirmed); })
             .style("stroke", 'rgba(255,255,255,1)')
             .style('stroke-width', .3)
             .style('fill', 'rgba(175,55,55,.6)')
             .on("mouseover", function(d) {
             tooltip.transition()
                 .duration(0)
                 .style("opacity", .9);
             tooltip.html(d.state + "<br/>"  + d.confirmed)
                 .style("left", (d3.event.pageX) + "px")
                 .style("top", (d3.event.pageY - 28) + "px");
             })
         .on("mouseout", function(d) {
             tooltip.transition()
                 .duration(500)
                 .style("opacity", 0);
                })
      
      
}
    
    




function parseInfected(d){
    return {
        region: d.Region,
        country: d.Country,
        state: d.State,
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



