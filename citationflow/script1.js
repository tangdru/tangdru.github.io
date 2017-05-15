

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
var globalDispatch = d3.dispatch('changetime','changeCellType', 'articlehover', 'articleclick');

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
$('.information').on('click', function(d){
  d3.selectAll('.layer').classed('clicked', false)
})

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


var color = ["#b8414d", "#c48291", "#cc773e", "#307d7f", "#7e4d92", "#be98c6", "#87abbe", "#68923e", "#b8d28b", "#d2a643"];
//var color = ["#7e4d92", "#be98c6", "#cc773e", "#b8414d", "#b8d28b", "#68923e", "#307d7f", "#87abbe","#d2a643", "#c48291"]; //I did a dirty fix here, I think the colors didn't line up because the list isn't in alphabetical order yet. so once that happens, we can go back to the other color.

globalDispatch.on('changeCellType',function(array){
  d3.selectAll(".axis").remove();
  drawstream(array, "cell_type");
  drawPoints(array)

})


globalDispatch.on('articlehover',function(d){

  var uniq = unidToUniq.get(d.key)

  var articleId = uniqToArticle.get(uniq)
 // console.log(articleId)
  var title = articleToTitle.get(articleId);
  var abstract = articleToAbstract.get(articleId)
  var authors = articleToAuthors.get(articleId)
  var volume = articleToVolume.get(articleId)
  var issue = articleToIssue.get(articleId)
  var issue_date = articleToIssueDate.get(articleId)
  d3.selectAll('.line').classed('selectedLine', false)

  var selectedLine = d3.selectAll('.line').filter(function(e){

    return e.id == articleId;
  })

  selectedLine.classed('selectedLine', true);



  d3.select("#title").html(title);
  d3.select("#abstract").html(abstract);
  d3.select("#issue-info").html("Issue " + issue + " Vol " + volume);
  d3.select("#authors").html(authors);
  d3.select(".info-scroll").classed("active-info", true);
  // d3.select(this).attr("opacity", .3)

})


globalDispatch.on('articleclick',function(d){

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
  d3.select("#issue-info").html("Issue " + issue + " Vol " + volume);
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





//should we move this below the sortAlpha function so we can use it on this also, I saw you turned some things on and off, so not sure what part of the code you're working on. 
    var author_names = [];
    authorNest = d3.nest()
      .key(function(d){ return d.author })
      .entries(authorList)

      authorNest.forEach(function(d){
          author_names.push(d.key)
      })

    author_names.sort()

    cellValues = d3.nest()
      .key(function(d){ return d.cell_type})
      .entries(cellData)

      //this is for drop-down menu
      var cell_types = [];
      cellValues.forEach(function(d){
        cell_types.push(d.key)
      })
      cell_types= cell_types.sort()


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
      species.sort()
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
    // y.domain([0,20000]);
    y.domain([0, d3.max(streamData, function(d) { return d.y0 + d.y; })]);


  var stream = d3.select('#container').selectAll(".layer")
        .data(layers);

   var streamEnter = stream.enter()
      .append("path")
      .classed("layer", true)
      .on('mouseover', function(d){

        d3.selectAll('.layer').classed('hover', false);
        d3.select(this).classed('hover', true);
        var layers = d3.selectAll('.layer');

        if ((layers).classed('clicked')==true){

        }
        else{
            globalDispatch.articlehover(d);

        }

      })

      .on("click", function(d){
        d3.selectAll('.layer').classed('myactive', false);
        d3.selectAll('.layer').classed('clicked', true);
        d3.select(this).classed('myactive', true)
        globalDispatch.articleclick(d);
      })
 
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




  var plotExit = plots.exit().remove();

  plotExit.transition()

    plot.append("g")
        .attr("class", "y axis")
        .attr("transform", "translate(" + width2 + ", 0)")
        .call(yAxis2.orient("right"));

}








