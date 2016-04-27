var margin = {top: 0, right: 20, bottom: 120, left: 40},
    width = 780 - margin.left - margin.right,
    height = 400 - margin.top - margin.bottom;

var x = d3.scale.ordinal()
    .rangeRoundBands([10, width], .1);

var y = d3.scale.linear()
    .rangeRound([height, 0]);

var color = d3.scale.ordinal()
    .range(["#537999", "#AF3737" ,"D6ABAB" ]);

var xAxis = d3.svg.axis()
    .scale(x)
    .orient("bottom");

var yAxis = d3.svg.axis()
    .scale(y)
    .orient("left")
    .tickFormat(d3.format());

var tooltip1 = d3.select("body")
    .append("div")	
    .attr("class", "tooltip")				
    .style("opacity", 0);


var chart = d3.select("#plot2")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

d3.csv("data/data3.csv", function(error, data) {
  if (error) throw error;
    console.log(data);
    
  color.domain(d3.keys(data[0]).filter(function(key) { return key !== "State"; }));

  data.forEach(function(d) {
    var y0 = 0;
    d.ages = color.domain().map(function(name) { return {name: name, y0: y0, y1: y0 += +d[name]}; });
    d.total = d.ages[d.ages.length - 1].y1;
  });

  data.sort(function(a, b) { return b.total - a.total; });

  x.domain(data.map(function(d) { return d.State; }));
  y.domain([0, d3.max(data, function(d) { return d.total; })]);

chart.append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(0," + height + ")")
    .call(xAxis)
  .selectAll("text")
    .attr("y", 0)
    .attr("x", 12)
    .attr("dy", ".3em")
    .attr("transform", "rotate(90)")
//    .attr("transform", function(d) { return "translate(2)"; })
    .style("text-anchor", "start");


chart.append("g")
      .attr("class", "y axis")
      .call(yAxis)
    .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 6)
      .attr("dy", ".7em")
      .style("text-anchor", "end")
      .text("Population");

var state = chart.selectAll(".state")
      .data(data)
    .enter().append("g")
      .attr("class", "g")
      .attr("transform", function(d) { return "translate(" + x(d.State) + ",0)"; });

  state.selectAll("rect")
      .data(function(d) { return d.ages; })
      .enter().append("rect")
      .attr("width", 28)
      .attr("y", function(d) { return y(d.y1); })
      .style("fill", function(d) { return color(d.name); })
//      .attr("height", 0)
//      .transition().duration(1500)
      .attr("height", function(d) { return y(d.y0) - y(d.y1); })
      .on("mouseover", function(d) {
             tooltip1.transition()
                 .duration(100)
                 .style("opacity", .9);
             tooltip1.html(d.state + "<br>"  + "# of " + d.name  +" cases " + d.y1)    
                 .style("left", (d3.event.pageX +14) + "px")
                 .style("top", (d3.event.pageY -14) + "px");
             })
         .on("mouseout", function(d) {
             tooltip1.transition()
                 .duration(1000)
                 .style("opacity", 0);
                })  ;

    //legend
  var legend = chart.selectAll(".legend")
      .data(color.domain().slice().reverse())
    .enter().append("g")
      .attr("class", "legend")
      .attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; });

  legend.append("rect")
      .attr("x", width -100)
        .attr("y", 150)
      .attr("width", 18)
      .attr("height", 18)
      .style("fill", color);

  legend.append("text")
      .attr("x", width - 104)
      .attr("y", 158)
      .attr("dy", ".35em")
      .style("text-anchor", "end")
      .text(function(d) { return d; });

});