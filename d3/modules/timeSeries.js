d3.timeSeries = function(){

    var _dis = d3.dispatch('hover','showValue');

	var w = 800,
		h = 600,
		m = {t:15,r:20,b:25,l:20},
		layout = d3.layout.histogram(),
		chartW = w - m.l - m.r,
		chartH = h - m.t - m.b,
		timeRange = [new Date(), new Date()], //default timeRange
        binSize = d3.time.year,
		maxY = 11, 
		scaleX = d3.time.scale().range([0,chartW]).domain(timeRange),
		scaleY = d3.scale.linear().range([chartH,0]).domain([0,maxY]),
		valueAccessor = function(d){ return d;},
        container = function(d){return d.container;};
    
	
	function exports(_selection){
		
        var bins = binSize.range(timeRange[0],timeRange[1]);
        bins.unshift(timeRange[0]);
        bins.push(timeRange[1]);

        layout
            .range(timeRange)
            .bins(bins);

		chartW = w - m.l - m.r,
		chartH = h - m.t - m.b;

		scaleX.range([0,chartW]).domain(timeRange);
		scaleY.range([chartH,0]).domain([0,maxY]);

		_selection.each(draw);
	}

	function draw(d){
        
        var _d = layout(d);
        console.log(_d);
        
        var bisect = d3.bisector(function(d){return d.x}).left;

		var line = d3.svg.line()
			.x(function(d){ return scaleX(d.x.getTime() + d.dx/2)}) //this is the problem,
			.y(function(d){ return scaleY(d.container)})
			.interpolate('basis');
		var area = d3.svg.area()
			.x(function(d){ return scaleX(d.x.getTime() + d.dx/2)})
			.y0(chartH)
			.y1(function(d){ return scaleY(d.container)})
			.interpolate('basis');
        var axisX = d3.svg.axis()
            .orient('bottom')
            .scale(scaleX)
            .ticks(d3.time.year);

		//append and update DOM
		//Step 1: does <svg> element exist? If it does, update width and height; if it doesn't, create <svg>
		var svg = d3.select(this).selectAll('svg')
			.data([d]);

		var svgEnter = svg.enter().append('svg')
		svgEnter.append('g').attr('class','area').attr('transform','translate('+m.l+','+m.t+')').append('path');
		svgEnter.append('g').attr('class','line').attr('transform','translate('+m.l+','+m.t+')').append('path');
		svgEnter.append('g').attr('class','axis').attr('transform','translate('+m.l+','+(m.t+chartH)+')');

        var tooltipEnter = svgEnter.append('g').attr('class','tool-tip');
        tooltipEnter.append('circle').attr('class','tool-tip-circle').attr('r',2);
        tooltipEnter.append('text').attr('class','tool-tip-text').attr('text-anchor','middle').attr('dy',-5);

        svgEnter.append('rect').attr('class','mouse-target').attr('transform','translate('+m.l+','+m.t+')')
            .attr('width',chartW)
            .attr('height',chartH)
            .style('fill-opacity',0)
            .on('mousemove', function(){
                var xy = d3.mouse(this),
                    t = scaleX.invert(xy[0]);

                _dis.hover(t);
            });


        svg.attr('width',w).attr('height',h);

		//Step 2: create layers of DOM individually
		//2.1 line graph
		svg.select('.line')
			.select('path')
			.datum(_d)
			.attr('d',line);
		//2.2 area
		svg.select('.area')
			.select('path')
			.datum(_d)
			.attr('d',area);
        //2.3 horizontal axis
        svg.select('.axis')
            .call(axisX);

        //show value based on argument t
        _dis.on('showValue',function(t){
           var index = bisect(_d, t),
               v = _d[index];

           var xPos = scaleX(v.x.getTime() + v.dx),
               yPos = scaleY(v.y);

            svg.select('.tool-tip').attr('transform','translate('+ (m.l+xPos) +','+ (m.t+yPos)+')')
                .select('.tool-tip-text').text(v.y);
        });

	}

	//Getter and setter
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
	exports.timeRange = function(_r){
		if(!arguments.length) return timeRange;
		timeRange = _r;
		return this;
	}
	exports.value = function(_v){
		if(!arguments.length) return layout.value();
		valueAccessor = _v;
		layout.value(_v);
		return this;
	}
	exports.maxY = function(_y){
		if(!arguments.length) return maxY;
		maxY = _y;
		return this;
	}
    exports.binSize = function(_b){
        //@param _b: d3.time.interval
        if(!arguments.length) return binSize;
        binSize = _b;
        return this;
    }
    exports.container = function(_c){
        if(!arguments.length) return container;
        container = _c;
        return this;
        
    }

    d3.rebind(exports, _dis, 'on', 'showValue');

	return exports;
}