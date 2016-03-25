// self-invoking anonymous function, but doesn't use jQuery
(window.onload = function() {
  // Setting document and chart properties
  var margin = {top: 50, right: 50, bottom: 50, left: 50};
  var width = 900 - margin.left - margin.right;
  var height = 500 - margin.top - margin.bottom;
  
  var barGraph = d3.select('#bar-graph');
  
  var xScale = d3.scale.ordinal().rangeRoundBands([0, width], .1);
  var yScale = d3.scale.linear().range([height, 0]); // flipped to draw the height bottom -> up
  
  var xAxis = d3.svg.axis().scale(xScale).orient('bottom');
  var yAxis = d3.svg.axis().scale(yScale).orient('left');
  
  // Creating an SVG canvas
  var svg = barGraph.append('svg')
              .attr('width', width + margin.left + margin.right)
              .attr('height', height + margin.top + margin.bottom)
              .append('g')
                .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

  // Grabbing the data
  var map = {};
  d3.csv('data/cereal.csv', function(d) {
      if (d.Manufacturer in map) {
        var newCals = map[d.Manufacturer].totalCals + (+d.Calories);
        var newCount = map[d.Manufacturer].count + 1;
        var newAvg = newCals / newCount;
        map[d.Manufacturer] = {manu: d.Manufacturer, totalCals: newCals, count: newCount, avgCals: newAvg};
      } 
      else {
        map[d.Manufacturer] = {manu: d.Manufacturer, totalCals: +d.Calories, count: 1};
      }
    }, 
    function(error, data) {
      if (error) throw error;
      data = new Array();
      for (var prop in map) { data.push(map[prop]); }
      // log data to console for inspection
      console.log(data);
    

      /**
       * TODO:
       * Process the data. If filtering is required before binding the data to
       * the DOM elements, this would be the place to do it. In what cases
       * would we do this?
       *
       **/
      // Setting the domain for X and Y scales
      xScale.domain(data.map(function(d) { return d.manu; }));
      yScale.domain([0, d3.max(data, function(d) { return d.avgCals; })]);
      // Drawing the X and Y axes
      drawXAxis();
      drawYAxis();
      // Drawing the Bars
      drawBars(data);

      /**
       * TODO:
       * Create an on click event handler to filter data using the
       * D3 filter method. Remember that this method requires data to
       * be already bound to the DOM
       *
       **/
      svg.selectAll('.bar')
        //.on('click', barClick);
  
  });

  function drawBars(data) {
    /**
     * TODO:
     * Play with the D3 filter method and understand how it works.
     * DONE: Filtered based on frequency
     **/
    svg.selectAll('.bar')
        .data(data)
        .enter()
        .append('rect')
          .attr('class', 'bar')
            .attr('xScale', function(d) { return xScale(d.manu); })
            .attr('width', xScale.rangeBand())
            .attr('yScale', function(d) { return yScale(d.avgCals); })
            .attr('height', function(d) { return height - yScale(d.avgCals); });
    }

  function drawXAxis() {
    svg.append('g')
        .attr('class', 'x axis')
        .attr('transform', 'translate(0,' + height + ')')
        .call(xAxis)
        .append('text')
          .attr('y', 20)
          .attr('x', (width / 2) - 10) // align in center
          .attr('dy', '.85em')
          .style('text-anchor', 'start')
          .style('font-size', '12px')
          .text('Manufacturers')
  }

  function drawYAxis() {
    svg.append('g')
        .attr('class', 'y axis')
        .call(yAxis)
        .append('text')
          .attr('transform', 'rotate(-90)')
          .attr('y', 6)
          .attr('dy', '.71em')
          .style('text-anchor', 'end')
          .style('font-size', '12px')
          .text('Calories');
  }

})();