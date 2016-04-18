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
//

var width = 960, 
    height = 560;

var svg = d3.select( "#plot2" )
  .append( "svg" )
  .attr( "width", width )
  .attr( "height", height );

var scaleX = d3.time.scale().range([new Date(1,1, 1980), new Date(1,1,2016)])
queue()
    .defer(d3.csv, 'data/zikaTimeline.csv', parseTimeline)
    .await(DataLoaded)

function DataLoaded(err, zikaTime){
    console.log(zikaTime);

svg.selectAll('.zikaTime')
            .data(zikaTime)
            .enter()
            .append('circle')
            .attr("class","zikaTime")
            .attr('cx', function(d){return scaleX(new Date(1,1,d.year))}) 
            .attr('cy', 100)
            .attr('r', function(d){return d.infections})
            .style('fill', 'rgba(155,55,55,.7)');
    
        };
    
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

