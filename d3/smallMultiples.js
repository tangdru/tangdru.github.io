var w = d3.select('.plot').node().clientWidth,
    h = d3.select('.plot').node().clientHeight;

var globalDispatch = d3.dispatch('pickTime');


d3.csv('data/ports.csv',parse,dataLoaded);

function dataLoaded(err,rows){
    console.log(d3.max(rows,function(d){return d.container}))
    //create nested hierarchy based on stations
    var tripsByPort = d3.nest()
        .key(function(d){return d.port})
        .entries(rows);
     console.log(tripsByPort);


//    //create a <div> for each station
//    //bind trips data to each station
    var plots = d3.select('.container').selectAll('.plot')
        .data(tripsByPort);

    plots
        .enter()
        .append('div').attr('class','plot');
    
    plots
        .each(function(d,i){
//             var timeSeries = d3.timeSeries()
// //                .width(w).height(h)
//                 .timeRange([new Date(2004,0),new Date(2015,11)])
//                 .value(function(d){ return new Date(d.year,0); })
//                 .maxY(10)
//                 .binSize(d3.time.year)
// //                .on('hover',function(t){
// //                    globalDispatch.pickTime(t);
// //                });
            var cHistogram = d3.customeHistogram()
                .value(function(d){return d.container})
                .maxX(d3.max(rows,function(d){return d.container;}))

            // globalDispatch.on('pickTime.'+i, function(t){
            //     timeSeries.showValue(t);
            // });
            
            d3.select(this).datum(d.values)
                .call(cHistogram);

        })
}


function parse(d){
    return {
        ranking: d.Ranking,
        region: d.Region,
        country: d.Country,
        year: +d.Year, 
        port: d.Port,
        container: +d.Container

    }
}

//function parseDate(date){
//    var day = date.split(' ')[0].split('/'),
//        time = date.split(' ')[1].split(':');
//
//    return new Date(+day[2],+day[0]-1, +day[1], +time[0], +time[1]);
//}

