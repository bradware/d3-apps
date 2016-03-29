window.onload = drawGraphs;

function drawGraphs() {
  // tons of constant variables used throughout
  // scatter-plot vars
  var scatMargin = {top: 50, right: 0, bottom: 30, left: 0};
  var scatWidth = 625 - scatMargin.left - scatMargin.right;
  var scatHeight = 550 - scatMargin.top - scatMargin.bottom;

  // setup scatter-plot x
  var xScatValue = function(d) { return d.calories;}, // scatData -> value
      xScatScale = d3.scale.linear().range([0, scatWidth]), // value -> display
      xScatMap = function(d) { return xScatScale(xScatValue(d));}, // scatData -> display
      xScatAxis = d3.svg.axis().scale(xScatScale).orient('bottom');

  // setup scatter-plot y
  var yScatValue = function(d) { return d.sugars; }; 
  var yScatScale = d3.scale.linear().range([scatHeight, 0]); 
  var yScatMap = function(d) { return yScatScale(yScatValue(d)); }; 
  var yScatAxis = d3.svg.axis().scale(yScatScale).orient('left');

  // setup fill color and circle size
  var circleScale = d3.scale.linear().range([0, 6]);
  var cValue = function(d) { return d.Manufacturer; };
  var color = d3.scale.category10();

  // add the graph canvas to the body of the webpage
  var scatSvg = d3.select('#scatter-plot').append('svg')
      .attr('width', scatWidth + scatMargin.left + scatMargin.right)
      .attr('height', scatHeight + scatMargin.top + scatMargin.bottom)
      .append('g')
      .attr('transform', 'translate(' + scatMargin.left + ',' + scatMargin.top + ')');

  // add the tooltip area to the webpage
  var tooltip = d3.select('body').insert('div', ':first-child')
      .attr('class', 'tooltip')
      .style('opacity', 0);

  // bar-graph vars
  var barGraph = document.getElementById('bar-graph');
  var barWidth = 625;
  var barHeight = 550;
  var barSvg = d3.select(barGraph)
                  .append('svg')
                  .attr('width', barWidth)
                  .attr('height', barHeight);
  var bars = barSvg.append('g');

  // bar-graph scale and y-axis
  var xBarScale = d3.scale.linear().range([0, barWidth]);
  var yBarScale = d3.scale.ordinal().rangeRoundBands([0, barHeight], 0.3);
  var yBarAxis = d3.svg.axis().scale(yBarScale).orient('left');

  var resetButton = d3.select('#reset-button');

  // Functions for event handlers
  var sizeForCircles = function(d) {
    return circleScale(d.servSizeWeight);
  }

  var reset = function() {
    barSvg.selectAll('.bar')
      .transition()
        .delay(200)
        .duration(2000)
        .style('fill', '#0066CC');

    scatSvg.selectAll('.dot')
      .transition()
        .delay(200)
        .duration(2000)
        .style('opacity', 1);
  };

  var filterBars = function(filterVal, filterFunc) {
    barSvg.selectAll('.bar')
      .filter(filterFunc)
      .transition()
        .delay(200)
        .duration(2000)
        .style('fill', '#00CC66');
  };

  var filterDots = function(filterVal, filterFunc) {
    scatSvg.selectAll('.dot')
      .filter(filterFunc)
      .transition()
        .delay(200)
        .duration(2000)
        .style('opacity', 0.25);
  };

  // reset the viz to start
  resetButton.on('click', function() { reset(); });

  // load data for scatter-plot
  d3.csv('data/cereal.csv', function(error, scatData) {

    // change string into number format
    scatData.forEach(function(d) {
      d.calories = +d.Calories;
      d.sugars = +d.Sugars;
      d.servSizeWeight = +d['Serving Size Weight'];
    });
    // inspect data
    console.log(scatData);

    // don't want dots overlapping axis, so add in buffer to scatData domain
    xScatScale.domain([d3.min(scatData, xScatValue)-1, d3.max(scatData, xScatValue)+1]);
    yScatScale.domain([d3.min(scatData, yScatValue)-1, d3.max(scatData, yScatValue)+1]);

    // x-axis for scatter-plot
    scatSvg.append('g')
        .attr('class', 'x axis')
        .attr('transform', 'translate(0,' + scatHeight + ')')
        .attr('fill', '#333333')
        .call(xScatAxis)
      .append('text')
        .attr('class', 'label')
        .attr('x', scatWidth)
        .attr('y', -6)
        .attr('fill', '#333333')
        .style('text-anchor', 'end')
        .text('Calories');

    // y-axis for scatter-plot
    scatSvg.append('g')
        .attr('class', 'y axis')
        .attr('fill', '#333333')
        .call(yScatAxis)
      .append('text')
        .attr('class', 'label')
        .attr('transform', 'rotate(-90)')
        .attr('y', 6)
        .attr('dy', '.71em')
        .attr('fill', '#333333')
        .style('text-anchor', 'end')
        .text('Sugars');

    // draw dots for scatter-plot
    scatSvg.selectAll('.dot')
        .data(scatData)
        .enter().append('circle')
          .attr('class', 'dot')
          .attr('r', sizeForCircles)
          .attr('cx', xScatMap)
          .attr('cy', yScatMap)
          .style('fill', function(d) { return color(cValue(d));})
          .on('mouseover', function(d) {
            tooltip.html('Cereal Name: ' + d['Cereal Name'] + '<br>' + 
                           'Calories: ' + d.calories + '<br>' + 
                           'Sugars: ' + d.sugars);
            tooltip.style('opacity', 1);
          })
          .on('mouseout', function(d) {
              tooltip.style('opacity', 0);
          })
          .on('click', function(d) {
              var currCals = d.calories;
              filterBars(currCals, function(d) {
                  return d.avgCals > currCals;
              });
          });

    // draw legend for scatter-plot
    var legend = scatSvg.selectAll('.legend')
        .data(color.domain())
        .enter()
        .append('g')
          .attr('class', 'legend')
          .attr('transform', function(d, i) { return 'translate(0,' + i * 20 + ')'; });

    // draw legend colored rectangles
    legend.append('rect')
        .attr('x', scatWidth - 18)
        .attr('y', 267)
        .attr('width', 18)
        .attr('height', 18)
        .style('fill', color);

    // draw legend text
    legend.append('text')
        .attr('x', scatWidth - 24)
        .attr('y', 275)
        .attr('dy', '.35em')
        .attr('fill', '#333333')
        .style('text-anchor', 'end')
        .text(function(d) { return d;});
  });

  var map = {};
  d3.csv('data/cereal.csv', function(d) {
      if (d.Manufacturer in map) {
          var newCals = map[d.Manufacturer].totalCals + (+d.Calories);
          var newCount = map[d.Manufacturer].count + 1;
          var newAvg = Math.round(newCals / newCount);
          map[d.Manufacturer] = {manu: d.Manufacturer, totalCals: newCals, count: newCount, avgCals: newAvg};
      } 
      else {
          map[d.Manufacturer] = {manu: d.Manufacturer, totalCals: +d.Calories, count: 1, avgCals: +d.Calories};
      }
  }, 
  function(error, barData) {
      if (error) throw error;
      for (var prop in map) { barData.push(map[prop]); }
      // log barData to console for inspection
      console.log(barData);
      
      xBarScale.domain([0, d3.max(barData, function(d) { return d.avgCals; })]);
      yBarScale.domain(barData.map(function(d) { return d.manu; }));

      bars.append('g')
          .attr('class', 'y axis')
          .attr('transform', 'translate(70, 0)')
          .call(yBarAxis);

      bars.append('g')
          .selectAll('.bar')
          .data(barData)
          .enter()
          .append('rect')
              .attr('class', 'bar')
              .attr('x', 80)
              .attr('y', function(d) { return yBarScale(d.manu); })
              .attr('width', function(d) { return xBarScale(d.avgCals); })
              .attr('height', function(d) { return yBarScale.rangeBand(); })
              .style('fill', '#0066CC')
              .on('click', function(d) {
                  currManu = d.manu;
                  filterDots(currManu, function(d) {
                    return currManu !== d.Manufacturer;
                  });
              });

  });
}