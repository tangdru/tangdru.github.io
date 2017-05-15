

var m = {t:20, r:50, b:30, l:20},
    m2 = {t:20, r:50, b:30, l:0},
    width = d3.select('#stream').node().clientWidth - m.l - m.r,
    height = d3.select('#stream').node().clientHeight - m.t - m.b,
    width2 = d3.select('#singleAxis').node().clientWidth - m2.l - m2.r,
    height2 = d3.select('#singleAxis').node().clientHeight - m.t - m.b;


 var svg = d3.select("#stream").append("svg:svg")
    .attr("width", width + m.l + m.r)
    .attr("height", height + m.t + m.b)
    .attr("id", "container")
    .attr("class", "svg")
    .attr("transform", "translate(" + m.l + "," + m.t + ")");

 var plot = d3.select("#singleAxis").append("svg:svg")
    .attr("width", width2 + m2.l + m2.r)
    .attr("height", height2 + m2.t + m2.b)
    .attr('transform','translate('+ m2.l+','+ m.t+')');

var dispatch = d3.dispatch('catchange', 'yearchange', 'group_mouse', 'single_mouse', 'group_off');

//Global dispatcher
var globalDispatch = d3.dispatch('changetime','changeCellType', 'articlehover');

//Crossfilter
var articles;

var parseDate = d3.time.format("%y").parse;

var x = d3.scale.linear()
    .range([m.l, width]);

var y = d3.scale.linear()
    .range([height-m.b, m.t]);


    
var DataByCategory = [];

var DataByYear = [];
var _Data = [];
var cellData = [];
var catToId = d3.map();
var speciesData = [];
var articleToSpecies = d3.map();
uniqToArticle = d3.map();
articleToTitle = d3.map();
articleToAbstract = d3.map();
articleToAuthors = d3.map();
articleToVolume = d3.map();
articleToIssue = d3.map();
articleToIssueDate = d3.map();
unidToUniq = d3.map();


d3_queue.queue()
  .defer(d3.csv, "data/10yr_data.csv", function(d) {
    // Loop through all of the columns, and for each column
    // make a new row
    Object.keys(d).forEach( function(colname) {
      // Ignore 'State' and 'Value' columns
      if(colname == "ID" 
        || colname =="total"
        || colname == "Year" 
        || colname == "Title" 
        || colname == "Authors" 
        || colname == "Journal"
        || colname == "Volume" 
        || colname == "Issue" 
        || colname == "Page start"
        || colname == "Page end"
        || colname == "Document Type"
        || colname == "Issue Date" 
        || colname == "Abstract" 
        || colname == "Species" 
        || colname == "Cell Type") {
        return
      }
      _Data.push({
        id: +d.ID,
        pub_year: +d["Year"],
        title: d["Title"],
        authors: d.Authors,
        journal: d.Journal,
        volume: +d["Volume"],
        issue: d.Issue,
        page_start: d["Page start"],
        page_end: d["Page end"],
        doc_type: d["Document Type"],
        issue_date: d["Issue Date"],
        abstract: d["Abstract"],
        species: d["Species"],
        cell_type: d["Cell Type"],
        total:+d.total,
        value: +d[colname], 
        year: colname
      });
    });
  return d;

  })
  .await(dataLoaded);



var articleNest;
var categoryNest;
var categoryIdNest;
var nest;
var catArray;
var authorList = [];
var authorNest;
var colorMap = d3.map();


var color = ["#db7f33", "#be98c6", "#c74f55", "#61989e", "#6a4478", "#c48c91", "#aeced3", "#5a7c4a", "#e0b446", "#a4bc95"];
//var color = ["#"]

globalDispatch.on('changeCellType',function(array){
  d3.selectAll(".axis").remove();
  drawstream(array, "cell_type");
  drawPoints(array)

})


globalDispatch.on('articlehover',function(d){

  var uniq = unidToUniq.get(d.key)
  var articleId = uniqToArticle.get(uniq)
  var title = articleToTitle.get(articleId);
  var abstract = articleToAbstract.get(articleId)
  var authors = articleToAuthors.get(articleId)
  var volume = articleToVolume.get(articleId)
  var issue = articleToIssue.get(articleId)
  var issue_date = articleToIssueDate.get(articleId)

  d3.select("#title").html(title);
  d3.select("#abstract").html(abstract);
  d3.select("#volume").html(volume);
  d3.select("#issue").html(issue);
  d3.select("#authors").html(authors);
  d3.select(".info-scroll").classed("active-info", true);
  d3.select(this).attr("oapcity", .3)

})
//----------------------------------------------------------------------------------
var minYear;
var maxYear;
var minCite;
var maxCite;
  function dataLoaded(err){


    //parse the list of categories into separate strings
    var cell_type=[];
    _Data.forEach(function(d){
      d.cell_type = d.cell_type.toLowerCase();
      var cell_typestr = d.cell_type;
      cell_type = cell_typestr.split(", ");
      d.cell_type = cell_type;
      var authorStr = d.authors;
      author = authorStr.split("., ");
      d.authors = author;

      d.species = d.species.toLowerCase();
      var speciesStr = d.species;
      species = speciesStr.split(", ");
      d.species = species;
         d.year = +d.year;

    })
      maxYear = d3.max(_Data, function(e) { return e.year});
      minYear = d3.min(_Data, function(e) { return e.year});
      maxCite = d3.max(_Data, function(e) { return e.total});
      minCite = d3.min(_Data, function(e) { return e.total});

    _Data.forEach(function(d){
      var authors_ = d.authors;
      var cell_type = d.cell_type;
      var species = d.species;
      cell_type.forEach(function(e){
        cellData.push({title: d.title, cell_type: e, year: d.year, id: d.id, value: d.value, pub_year:d.pub_year, species:d.species, uniq:e+d.id, total:d.total, issue:d.issue, issue_date:d.issue_date, volume:d.volume, abstract:d.abstract, authors:d.authors})
      })
      species.forEach(function(e){
        speciesData.push(e)
      })
      authors_.forEach(function(e){
        authorList.push({author:e})
      })
    })

    cellData.forEach(function(d){
      uniqToArticle.set(d.cell_type+d.id, d.id)
      articleToSpecies.set(d.id, d.species)
      articleToTitle.set(d.id, d.title)
      articleToAbstract.set(d.id, d.abstract)
      articleToVolume.set(d.id, d.volume)
      articleToIssue.set(d.id, d.issue)
      articleToIssueDate.set(d.id, d.issue_date)
      articleToAuthors.set(d.id, d.authors)
    })

// console.log(minYear, maxYear)
 //crossfilter and dimensions
    articles = crossfilter(cellData);
    var articleByCellType = articles.dimension(function(d){return d.cell_type});
        articleByYear = articles.dimension(function(d){return d.pub_year});
        articleBySpecies = articles.dimension(function(d){ return d.species});
        articleByAuthor = articles.dimension(function(d){ return d.authors});

    //Module 3: dropdown
    d3.select('.cell_type').on('change',function(){
        if(!this.value) articleByCellType.filter(null);
        else {articleByCellType.filter(this.value);}
        globalDispatch.changeCellType(articleByCellType.top(Infinity));
    })

    d3.select('.year').on('change',function(){
        if(!this.value){articleByYear.filter(null);}
        else {articleByYear.filter(this.value);}
        globalDispatch.changeCellType(articleByYear.top(Infinity));
    })

    d3.select('.species').on('change',function(){
       var va = this.value;
    //   console.log(va)
        if(va=="all"){articleBySpecies.filter(null);}
        else{
        articleBySpecies.filter(function(d){
          var type = d;
          var contains = type.includes(va)
            if (contains == true){
              return true;
            } 
          });
        }
        globalDispatch.changeCellType(articleBySpecies.top(Infinity));
    })

    d3.select('.names').on('change',function(){
       var va = this.value;

        if(va=="all"){articleByAuthor.filter(null);}
        else{
        articleByAuthor.filter(function(d){
          var type = d;
          var contains = type.includes(va)
            if (contains == true){
              return true;
            } 
          });
        }
        globalDispatch.changeCellType(articleByAuthor.top(Infinity));
      })






    var author_names = [];
    authorNest = d3.nest()
      .key(function(d){ return d.author })
      .entries(authorList)

      authorNest.forEach(function(d){
          author_names.push(d.key)
      })


function sortAlpha(a, b){
  return d3.ascending
}



    cellValues = d3.nest()
      .key(function(d){ return d.cell_type})
      .entries(cellData)

      //this is for drop-down menu
      var cell_types = [];
      cellValues.forEach(function(d){
        cell_types.push(d.key)
      })
      cell_types= cell_types.sort(sortAlpha)
    //cats is each category that will be mapped to a color
    cell_types.forEach(function(d, i){
      var cellname = d;
      var color_value = color[i]
      colorMap.set(cellname, color_value)
    })

    specValues = d3.nest()
      .key(function(d){ return d})
      .entries(speciesData)

      //this is for drop-down menu
      var species = [];
      specValues.forEach(function(d){
        species.push(d.key)
      })

    yearValues = d3.nest()
      .key(function(d){ return d.pub_year})
      .entries(cellData)

    //   //this is for drop-down menu
      var years = [];
      yearValues.forEach(function(d){
        years.push(d.key)
      })


    d3.select('.cell_type').selectAll('options').data(cell_types).enter()
        .append('option')
        .html(function(d){ return d })
        .attr('value', function(d){ return d});

    d3.select('.species').selectAll('options').data(species).enter()
        .append('option')
        .html(function(d){ return d })
        .attr('value', function(d){ return d});

    d3.select('.year').selectAll('options').data(years).enter()
        .append('option')
        .html(function(d){ return d })
        .attr('value', function(d){ return d});
  


    d3.select('.names').selectAll('options').data(author_names).enter()
        .append('option')
        .html(function(d){ return d })
        .attr('value', function(d){ return d});




  drawPoints(cellData);
  drawstream(cellData, "cell_type");
}




  var xAxis, yAxis, stack, area;
 



  function drawstream(data, field){

  function sortDate(a, b) {
      return b.year - a.year;
  }


  data.sort(sortDate)



    uniqNest = d3.nest()
      .key(function(d){ return d.uniq})
      .key(function(d){ return d.cell_type})
      .key(function(d){ return d.year})
      .rollup(function(leaves){ return d3.sum(leaves, function(d){ return d.value})})
      .entries(data)
    
      var streamData = [];

      var UI =0;

      uniqNest.forEach(function(d){



        UI = UI+1;
        d.UI = UI;
        var key = d.key;
        var values = d.values;
        var id = uniqToArticle.get(key)

        var species = articleToSpecies.get(id)

        values.forEach(function(e_){

          var ctKey = e_.key;
          var ctVal = e_.values;

          ctVal.forEach(function(f_){
            streamData.push({iniq: key, unid: UI, year:f_.key, citations:f_.values, cell_type:ctKey, species:species})
          })

        })
      })


    uniqNest.forEach(function(d){
      unidToUniq.set(d.UI, d.key)
    })

    nest = d3.nest()
      .key(function(d){ return d.unid })

    xAxis = d3.svg.axis()
        .scale(x)
        .orient("bottom")
        .tickFormat(d3.format("d"))

    yAxis = d3.svg.axis()
        .scale(y);

    stack = d3.layout.stack()
        .offset("zero")
        .values(function(d) { return d.values; }) //values is of categoryNest
        .x(function(e) { return e.year; })
        .y(function(e) { return e.citations; });

    area = d3.svg.area()
        .interpolate("cardinal")
        .x(function(d) { return x(d.year); })
        .y0(function(d) { return y(d.y0); })
        .y1(function(d) { return y(d.y0 + d.y); });


    var layers = stack(nest.entries(streamData));

    //x.domain(d3.extent(data, function(d) { return d.year; }));
    x.domain([minYear, maxYear])
    y.domain([0,17000]);
    //y.domain([0, d3.max(streamData, function(d) { return d.y0 + d.y; })]);


  var stream = d3.select('#container').selectAll(".layer")
        .data(layers);

   var streamEnter = stream.enter()
      .append("path")
      .classed("layer", true)
      .on('mouseover', function(d){
        d3.selectAll('.layer').classed('hover', false);
        d3.select(this).classed('hover', true);
         globalDispatch.articlehover(d);
      });

  var streamExit = stream.exit().remove();

  streamExit.transition()

    stream
      .transition()
      .attr("d", function(d) { return area(d.values); })
      .style("fill", function(d){  
        var color =  colorMap.get(""+d.values[0][field])
        return color;
      });


    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + (height-m.b) + ")")
        .call(xAxis);

    svg.append("g")
        .attr("class", "y axis")
        .attr("transform", "translate(" + width + ", 0)")
        .call(yAxis.orient("right"));



  }

var yline = d3.scale.linear().range([height2-m.b, m.t])
var yAxis2;


var plot_brush = d3.svg.brush()
    .y(yline)
    .extent([0, 1])
    .on("brush", plot_brushed);

function drawPoints(data){

yline.domain([minCite, maxCite]);
yAxis2 = d3.svg.axis().scale(yline);

  var plots = plot.selectAll(".line")
    .data(data)

  var plotEnter = plots.enter()
    .append('line')
    .attr('class', 'line')
    .attr('x1', m.l)
    .attr('x2', width2)
    .attr('y1', function(d){ return yline(d.total)})
    .attr('y2', function(d){ return yline(d.total)})


    // plot.append("g")
    //     .attr("class", "y brush")
    //     .call(plot_brush)
    //     .selectAll("rect")
    //     .attr("x", m.l)
    //     .attr("width", width2)
    //     .attr("class", "brush")



  var plotExit = plots.exit().remove();

  plotExit.transition()

    plot.append("g")
        .attr("class", "y axis")
        .attr("transform", "translate(" + width2 + ", 0)")
        .call(yAxis2.orient("right"));

}

function plot_brushed() {
        yline.domain(plot_brush.empty() ? yline.domain() : plot_brush.extent());







        // scales.x.domain(timeline_brush.empty() ? scales.x2.domain() : timeline_brush.extent());
        // focus.select(".timeline_line").attr("d", timeline_line);
        // focus.select(".x.axis").call(xAxis);
        // var s = timeline_brush.extent();


        // selected = contextPoints.selectAll(".focus_points")
        //     .attr("cx",function(d){ return scales.x(d.newDate)})
        //     .attr("cy", function(d){ return scales.y(d.total_victims)})
        //     .classed("selected", function (d){ return s[0] <= d.newDate && d.newDate <= s[1]; });

        // nonselected = focusPoints.selectAll(".focus_points")
        //     .attr("cx",function(d){ return scales.x(d.newDate)})
        //     .attr("cy", function(d){ return scales.y(d.total_victims)})
        //     .classed("nonselected", function (d){ return s[0] >= d.newDate && d.newDate >= s[1]; });





}












