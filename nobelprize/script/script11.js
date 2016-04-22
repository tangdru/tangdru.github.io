/**
 * Created by tangdru on 12/15/15.
 */



var margin = {t:50,r:50,b:50,l:50};
var width = document.getElementById('plot').clientWidth - margin.r - margin.l,
    height = document.getElementById('plot').clientHeight - margin.t - margin.b;
//console.log(height)

var plot = d3.select('#plot')
    .append('svg')
    .attr('class','canvas').attr('width',width+margin.r+margin.l)
    .attr('height',height + margin.t + margin.b)
    .attr('transform','translate('+margin.l+','+margin.t+')');


var allData = [];

//buttons
var whatToPlot =d3.map();
whatToPlot.set('current_whatToPlot', ['nestedData1']);
whatToPlot_init = whatToPlot.get('current_whatToPlot');

d3.selectAll('.dataset_switch').on('click', function () {
    var dataToPlot = d3.select(this).attr('id');
    if (dataToPlot == "nestedData1") {
        whatToPlot.set('current_whatToPlot', ['nestedData1']);
        draw('nestedData1');
    }
    if (dataToPlot == "nestedData2") {
        whatToPlot.set('current_whatToPlot', ['nestedData2']);
        draw('nestedData2');
    }
    if (dataToPlot == "nestedData3") {
        whatToPlot.set('current_whatToPlot', ['nestedData3']);
        draw('nestedData3');
    }
    if (dataToPlot == "nestedData4") {
        whatToPlot.set('current_whatToPlot', ['nestedData4']);
        draw('nestedData4');
    }
    if (dataToPlot == "nestedData5") {
        whatToPlot.set('current_whatToPlot', ['nestedData5']);
        draw('nestedData5');
    }
    if (dataToPlot == "nestedData6") {
        whatToPlot.set('current_whatToPlot', ['nestedData6']);
        draw('nestedData6');
    }
    if (dataToPlot == "nestedData7") {
        whatToPlot.set('current_whatToPlot', ['nestedData7']);
        draw('nestedData7');
    }
});

//var div = d3.select("plot").append("div")
//    .attr("class", "tooltip")
//    .style("opacity", 0);


//Import
function forQueue(){
    queue()
        .defer(d3.csv, 'data/nobelPrizes_cleaned.csv', parseCountry)
        .defer(d3.csv,'data/countryMetadata.csv',parseCountryMetadata)
        .await(dataLoaded);
}
forQueue();


function dataLoaded(err,dataset,countryMetadata) {
    //nest original data,
    var nestedData1 = d3.nest()
        .key(function (d) {
            return d.ctry
        })
        .key(function (d) {
            return d.yr
        })
        .rollup(function (leaves) {
            return {
                prizes: leaves,
                total: leaves.length
            }
        })
        .entries(dataset);
    //console.log(nestedData1);
    console.log(countryMetadata);


    //chemistry data
    var filterChem = dataset.filter(function(chemistry){
        return chemistry.prizeName == 'Chemistry';
    })
    //console.log(filterPeace);
    var nestedData2 = d3.nest()
        .key(function (d) {
            return d.ctry
        })
        .key(function (d) {
            return d.yr
        })
        .rollup(function (leaves) {
            return {
                prizes: leaves,
                total: leaves.length
            }
        })
        .entries(filterChem);
    //console.log(nestedData2);


    //econmics data
    var filterEcon = dataset.filter(function(economics){
        return economics.prizeName == 'Economics';
    })
    //console.log(filterPeace);
    var nestedData3 = d3.nest()
        .key(function (d) {
            return d.ctry
        })
        .key(function (d) {
            return d.yr
        })
        .rollup(function (leaves) {
            return {
                prizes: leaves,
                total: leaves.length
            }
        })
        .entries(filterEcon);
    //console.log(nestedData3);


    //literature data
    var filterLit = dataset.filter(function(literature){
        return literature.prizeName == 'Literature';
    })
    //console.log(filterPeace);
    var nestedData4 = d3.nest()
        .key(function (d) {
            return d.ctry
        })
        .key(function (d) {
            return d.yr
        })
        .rollup(function (leaves) {
            return {
                prizes: leaves,
                total: leaves.length
            }
        })
        .entries(filterLit);
    //console.log(nestedData4);


    //medicine data
    var filterMed = dataset.filter(function(medicine){
        return medicine.prizeName == 'Medicine';
    })
    //console.log(filterPeace);
    var nestedData5 = d3.nest()
        .key(function (d) {
            return d.ctry
        })
        .key(function (d) {
            return d.yr
        })
        .rollup(function (leaves) {
            return {
                prizes: leaves,
                total: leaves.length
            }
        })
        .entries(filterMed);
    //console.log(nestedData5);


    //peace data
    var filterPeace = dataset.filter(function(peace){
        return peace.prizeName == 'Peace';
    })
    //console.log(filterPeace);
    var nestedData6 = d3.nest()
        .key(function (d) {
            return d.ctry
        })
        .key(function (d) {
            return d.yr
        })
        .rollup(function (leaves) {
            return {
                prizes: leaves,
                total: leaves.length
            }
        })
        .entries(filterPeace);
    //console.log(nestedData6);


    //physics data
    var filterPhysics = dataset.filter(function(physics){
        return physics.prizeName == 'Physics';
    })
    //console.log(filterPeace);
    var nestedData7 = d3.nest()
        .key(function (d) {
            return d.ctry
        })
        .key(function (d) {
            return d.yr
        })
        .rollup(function (leaves) {
            return {
                prizes: leaves,
                total: leaves.length
            }
        })
        .entries(filterPhysics);
    //console.log(nestedData7);

    allData.push({'nestedData1': nestedData1,'nestedData2': nestedData2,'nestedData3': nestedData3,'nestedData4': nestedData4,
        'nestedData5': nestedData5,'nestedData6': nestedData6, 'nestedData7': nestedData7
    })

    countryMap = d3.map();
    for (i = 0; i < countryMetadata.length; i++) {
        countryMap.set(countryMetadata[i].ctry, countryMetadata[i].index);
    }
    console.log(countryMap);


    //
    //countryIndex = countryMap.get(dataset[i].ctry);
    //console.log(countryIndex);



    draw('nestedData1');
}

//draw
function draw(DataKey){

    allDataEntries = d3.entries(allData[0]);
    allDataEntriesMap = d3.map(allDataEntries, function(d) { return d.key; });
    data = allDataEntriesMap.get(DataKey);

    //tooltip
    var div = d3.select("body").append("div")
        .attr("class", "tooltip")
        .style("opacity", 0);

    //var data = allData[DataKey];
    var scaleX = d3.scale.linear().domain([1900,2015]).range([100,width*.8]),
        scaleY = d3.scale.linear().domain([0,20]).range([height,0]);
    var lineGenerator = d3.svg.line()
        .interpolate('basis');
    var years = d3.range(1900,2016,1); //See: https://github.com/mbostock/d3/wiki/Arrays#d3_range
    //console.log(years);

    //draw country lines
    var total_n = data.value.length

    //console.log(total_n)
    //console.log("data", data, allDataEntries)
    var ctryLines = plot.selectAll('.country')
        .data(data.value,function (d){return d.key});  //can't get object constancy to work

    var ctryLinesEnter = ctryLines
        .enter()
        .append('g')
        .attr('class','country') //this results in 57 <path> elements
        .each(function(d){
            //console.log(d); //just so you see what the data looks like
            //d3.select(this)
        })
        //.call(attachTooltip)


    ctryLinesEnter
        .append('path')
        .attr('d', function(d,i){
        var prizes = d3.map(d.values, function(d){return d.key});

        ctryLines.attr('transform', function(d,i){ //use map countryMeta to reference the i everytime so position doesn't change
            return 'translate('+(i*width/total_n*270)/width+ ','+((height) - i*(height/total_n)/1.05)+')';
        });


        lineGenerator
            .x(function(el){
                //!!!!!!!!!!!!!!!Here is the important part!!!!!!!!!!!
                //el --> a number, ranging from 1900 to 2015
                return scaleX(el)
            })

            .y(function(el){
                //again, el --> a number ranging from 1900 to 2015
                //we use that number to look up the corresponding prizes for that year, if any
                if(!prizes.get(el)) return 0;
                return (prizes.get(el)).values.total*-5 ;
            })

        return lineGenerator(years);

    })

    ctryLinesEnter.append('text')
        .text(function(d){return d.key;})

    var ctryLinesExit = ctryLines.exit()
        .transition().duration(150)
        .style("opacity", .20)
        .remove();



    ctryLines.select('path').attr('d', function(d,i){
        var prizes = d3.map(d.values, function(d){return d.key});

        lineGenerator
            .x(function(el){
                //!!!!!!!!!!!!!!!Here is the important part!!!!!!!!!!!
                //el --> a number, ranging from 1900 to 2015
                return scaleX(el)
            })

            .y(function(el){
                //again, el --> a number ranging from 1900 to 2015
                //we use that number to look up the corresponding prizes for that year, if any
                if(!prizes.get(el)) return 0;
                return (prizes.get(el)).values.total*-5 ;
            })

        return lineGenerator(years);

    })

    //function mousemove() {
    //    var x0 = x.invert(d3.mouse(this)[0]),
    //        i = bisectDate(data, x0, 1),
    //        d0 = data[i - 1],
    //        d1 = data[i],
    //        d = x0 - d0.date > d1.date - x0 ? d1 : d0;
    //    focus.select("circle.y")
    //        .attr("transform",
    //            "translate(" + x(d.date) + "," +
    //            y(d.close) + ")");
    //}




     .on('mouseover',function(d){
                console.log(d)
                div.transition()
                    .duration(10)
                    .style("opacity",.9)
                div .html(d.key)//+', '+####)
                    .style("left", (d3.event.pageX) + "px")
                    .style("top", (d3.event.pageY - 30) + "px");
            })
                .on("mouseout", function(d) {
                    div.transition()
                        .duration(400)
                        .style("opacity", 0);

                });



}


function parseCountry(d){return {
    yr:+d['year']!='..'?+d['year']:undefined,
    ctry: d['country']!='..'?d['country']:undefined,
    prizeName: d['prize']!='..'?d['prize']:undefined,
    name:d['name']!='..'?d['name']:undefined
}
}



function parseCountryMetadata(d){
    return {
        ctry: d.country,
        index: d.index
    }
}