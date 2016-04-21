d3.customeHistogram = function(){

    var w = 960,
        h = 600,
        m = {t:15,r:20,b:25,l:20},
        layout = d3.layout.histogram(),
        chartW = w - m.l - m.r,
        chartH = h - m.t - m.b,
//        timeRange = [new Date(), new Date()],  //fix
        maxY = 10,
        maxX = 10000;
        scaleX = d3.scale.linear().range([0,chartW]).domain([0,maxX]),
        scaleY = d3.scale.linear().range([chartH,0]).domain([0,maxY]),
        valueAccessor = function(d){ return d;}
//        container = function(d){return d.container;};  //fix
    
    
    function exports(_selection){
        chartW = w - m.l - m.r,
        chartH = h - m.t - m.b;

        scaleX.range([0,chartW]).domain([0,maxX]);
        scaleY.range([chartH,0]).domain([0,maxY]);

        _selection.each(draw);
        
    }

    function draw(d){
        console.log(d)
        var _d = layout(d)
        console.log(_d)
        
        var line = d3.svg.line()
            .x(function(d){ return scaleX(d.x + d.dx/2)})
            .y(function(d){ return scaleY(d.y)})
            .interpolate('basis');

        var area = d3.svg.area()
            .x(function(d){ return scaleX(d.x + d.dx/2)})
            .y0(chartH)
            .y1(function(d){ return scaleY(d.y)})
            .interpolate('basis');

        var axisX = d3.svg.axis()
            .orient('bottom')
            .scale(scaleX);

        var svg = d3.select(this).selectAll('svg')
            .data([d]);

        var svgEnter = svg.enter().append('svg');
        svgEnter.append('g').attr('class','area').attr('transform','translate('+m.l+','+m.t+')').append('path');
        svgEnter.append('g').attr('class','line').attr('transform','translate('+m.l+','+m.t+')').append('path');
        svgEnter.append('g').attr('class','axis').attr('transform','translate('+m.l+','+(m.t+chartH)+')');

        svg.attr('width',w).attr('height',h);

        svg.select('.area')
            .select('path')
            .datum(_d)
            .attr('d',area);

        svg.select('.line')
            .select('path')
            .datum(_d)
            .attr('d',line);

        svg.select('.axis')
            .call(axisX);
    }

    exports.width = function(_v){
        if(!arguments.length) return w;
        w = _v;
        return this;
    }
    exports.height = function(_v){
        if(!arguments.length) return h;
        h = _v;
        return this;
    }

    exports.maxX = function(_y){
        if(!arguments.length) return maxX;
        maxX = _y;
        return this;
    }

    exports.value = function(_v){
        if(!arguments.length) return layout.value();
        valueAccessor = _v;
        layout.value(_v);
        return this;
    }
    
        exports.container = function(_c){
        if(!arguments.length) return container;
        container = _c;
        return this;
        
    }

    return exports;
    
}