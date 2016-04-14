var w = d3.select('.plot').node().clientWidth,
    h = d3.select('.plot').node().clientHeight;

var globalDispatch = d3.dispatch('pickTime');


d3.csv('data/topPorts.csv',parse,dataLoaded);

function dataLoaded(err,topPorts){
    console.log(topPorts);
    
var countries = d3.nest()
    .key(function(d){return d.country})
    .entries(topPorts);
     console.log(countries);
    
var cfilter = crossfilter(topPorts);

    
var portsByCountry = cfilter.dimension(function(d){return d.country});
    portsInChina = portsByCountry.filter("China").top(Infinity);
    console.log("Ports in China", portsInChina.length);
    
    portsInSingapore = portsByCountry.filter("Singapore").top(Infinity);
    console.log("Ports in Singapore", portsInSingapore.length);
    
    portsInSouthKorea = portsByCountry.filter("South Korea").top(Infinity);
    console.log("Ports in South Korea", portsInSouthKorea.length);
    
    portsInUnAE = portsByCountry.filter("United Arab Emirates").top(Infinity);
    console.log("Ports in United Arab Emirates", portsInUnAE.length);
    
    portsInVietnam = portsByCountry.filter("Vietnam").top(Infinity);
    console.log("Ports in Vietnam", portsInVietnam.length);
    
    

    
    
    
    
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