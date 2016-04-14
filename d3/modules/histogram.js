
d3.custom.histogram = function(){
    var margin = {t:25,r:50,b:25,l:50},
        w = 500,//internal variables, can be modified later
        h = 300,
        chartW = w - margin.l - margin.r,
        chartH = h - margin.t - margin.b,
        scaleX = d3.scale.linear(),
        scaleY = d3.scale.linear(),
        dataRange = (),
        layout = d3.layout.histogram();


    function exports(_selection){
        //@param _selection -> d3 selection of <div> elements
        chartW = w - margin.l - margin.r;
        chartH = h - margin.t - margin.b;
        scaleX.range([0,chartW]);
        scaleY.range([chartH,0]);

        _selection.each(redraw);
    }

    function redraw(_data){
        //@param _data -> array of data bound to the selection
        //"this" -> the selected DOM element

        var histData = layout(_data);

        //scales and axis
        scaleX.domain(dataRange || d3.extent(_data));
        scaleY.domain([0,d3.max(histData,function(d){return d.y})]);
        var axisX = d3.svg.axis()
            .orient('bottom')
            .scale(scaleX);

        //Ensure the right DOM structure
        var svg = d3.select(this).selectAll('svg')
            .data([_data]);

        //If no <svg> previously appended, append it now
        //Also append the nested <g> element(s)
        var svgEnter = svg.enter().append('svg').attr({width:w, height:h});
        svgEnter
            .append('g').attr('class','chart histogram')
            .append('g').attr('class','axis axis-x');

        var chart = svg.select('.chart')
            .attr('transform','translate('+margin.l+','+margin.t+')');

        //Layers
        //Bars
        var bars = chart.selectAll('.bin')
            .data(histData);

        bars.enter()
            .append('rect')
            .attr('class','bin')
            .transition()
            .call(onTrans);

        bars.exit()
            .call(onExit);

        bars.transition()
            .call(onTrans);

        //axis
        chart.select('.axis-x')
            .attr('transform','translate(0,'+chartH+')')
            .transition()
            .call(axisX);

    }
    function onEnter(){
    }
    function onExit(){
        this.remove();
    }
    function onTrans(){
        this
            .attr('x', function(d){return scaleX(d.x)})
            .attr('width',function(d){return scaleX(d.x+ d.dx) - scaleX(d.x)})
            .attr('y', function(d){return scaleY(d.y)})
            .attr('height',function(d){return chartH - scaleY(d.y)});
    }

    //Getter and setter
    exports.width = function(_x){
        if(!arguments.length) return w;
        w = _x;
        return this;
    }
    exports.height = function(_x){
        if(!arguments.length) return h;
        h = _x;
        return this;
    }
    exports.bins = function(_bins){
        if(!arguments.length) return layout.bins();
        layout.bins(_bins);
        return this;
    }
    exports.range = function(_range){
        if(!arguments.length) return layout.range();
        dataRange = _range;
        layout.range(_range);
        return this;
    }

    return exports;
}
