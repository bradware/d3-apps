// Your browser will call the onload() function when the document
// has finished loading. In this case, onload() points to the
// start() method we defined below. Because of something called
// function hoisting, the start() method is callable below
window.onload = drawGraphs;

var globalScatData = new Array();
var globalBarData = new Array();

function drawGraphs() {
  var scatMargin = {top: 50, right: 0, bottom: 30, left: 0};
  var scatWidth = 600 - scatMargin.left - scatMargin.right;
  var scatHeight = 600 - scatMargin.top - scatMargin.bottom;
  var circleScale = d3.scale.linear().range([0, 6]);

  // pre-cursors
  var sizeForCircle = function(d) {
    // TODO: modify the size
    return circleScale(d.servSizeWeight);
  }

  // setup x
  var xScatValue = function(d) { return d.calories;}, // scatData -> value
      xScatScale = d3.scale.linear().range([0, scatWidth]), // value -> display
      xScatMap = function(d) { return xScatScale(xScatValue(d));}, // scatData -> display
      xScatAxis = d3.svg.axis().scale(xScatScale).orient('bottom');

  // setup y
  var yScatValue = function(d) { return d.sugars; }, // scatData -> value
      yScatScale = d3.scale.linear().range([scatHeight, 0]), // value -> display
      yScatMap = function(d) { return yScatScale(yScatValue(d)); }, // scatData -> display
      yScatAxis = d3.svg.axis().scale(yScatScale).orient('left');

  // setup fill color
  var cValue = function(d) { return d.Manufacturer;},
      color = d3.scale.category10();

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

  // load data
  d3.csv('data/cereal.csv', function(error, scatData) {

    // change string (from CSV) into number format
    scatData.forEach(function(d) {
      d.calories = +d.Calories;
      d.sugars = +d.Sugars;
      d.servSizeWeight = +d['Serving Size Weight'];
    });

    console.log(scatData);
    globalScatData = scatData;

    // don't want dots overlapping axis, so add in buffer to scatData domain
    xScatScale.domain([d3.min(scatData, xScatValue)-1, d3.max(scatData, xScatValue)+1]);
    yScatScale.domain([d3.min(scatData, yScatValue)-1, d3.max(scatData, yScatValue)+1]);

    // x-axis
    scatSvg.append('g')
        .attr('class', 'x axis')
        .attr('transform', 'translate(0,' + scatHeight + ')')
        .attr('fill', 'white')
        .call(xScatAxis)
      .append('text')
        .attr('class', 'label')
        .attr('x', scatWidth)
        .attr('y', -6)
        .attr('fill', 'white')
        .style('text-anchor', 'end')
        .text('Calories');

    // y-axis
    scatSvg.append('g')
        .attr('class', 'y axis')
        .attr('fill', 'white')
        .call(yScatAxis)
      .append('text')
        .attr('class', 'label')
        .attr('transform', 'rotate(-90)')
        .attr('y', 6)
        .attr('dy', '.71em')
        .attr('fill', 'white')
        .style('text-anchor', 'end')
        .text('Sugars');

    // draw dots
    scatSvg.selectAll('.dot')
        .data(scatData)
        .enter().append('circle')
          .attr('class', 'dot')
          .attr('r', sizeForCircle)
          .attr('cx', xScatMap)
          .attr('cy', yScatMap)
          .style('fill', function(d) { return color(cValue(d));})
          .on('mouseover', function(d) {
              // TODO: show the tool tip
              tooltip.style('opacity', 1);
              // TODO: fill to the tool tip with the appropriate scatData
              tooltip.html('Cereal Name: ' + d['Cereal Name'] + '<br>' + 
                           'Calories: ' + d.calories + '<br>' + 
                           'Sugars: ' + d.sugars);
              // TODO: update text in our custom nutrition label

              // TODO: expand all nodes with the same manufacturer

          })
          .on('mouseout', function(d) {
              // TODO: hide the tooltip
              tooltip.style('opacity', 0);
              // TODO: resize the nodes

          })
          .on('click', function(d) {
              var currCals = d.calories;
              var matchingData = new Array();
              console.log(currCals);
              globalBarData.forEach(function(d) {
                if (d.avgCals > currCals) {
                  matchingData.push(d);
                }
              });
              console.log(matchingData);
              barSvg.selectAll('.bar')
                  .data(matchingData)
                  .transition()
                    .delay(200)
                    .duration(1000)
                    .attr('fill', 'green');

                
          });

    // draw legend
    var legend = scatSvg.selectAll('.legend')
        .data(color.domain())
        .enter()
        .append('g')
          .attr('class', 'legend')
          .attr('transform', function(d, i) { return 'translate(0,' + i * 20 + ')'; });

    // draw legend colored rectangles
    legend.append('rect')
        .attr('x', scatWidth - 18)
        .attr('width', 18)
        .attr('height', 18)
        .style('fill', color);

    // draw legend text
    legend.append('text')
        .attr('x', scatWidth - 24)
        .attr('y', 9)
        .attr('dy', '.35em')
        .attr('fill', 'white')
        .style('text-anchor', 'end')
        .text(function(d) { return d;});
  });

  // constant variables defined used throughout
  var barGraph = document.getElementById('bar-graph');

  var barWidth = 700;
  var barHeight = 700;

  var barSvg = d3.select(barGraph)
      .append('svg')
      .attr('width', barWidth)
      .attr('height', barHeight);
  var bars = barSvg.append('g');

  // scales and y-axis for graph
  var xBarScale = d3.scale.linear().range([0, barWidth]);
  var yBarScale = d3.scale.ordinal().rangeRoundBands([0, barHeight], 0.3);
  var yBarAxis = d3.svg.axis().scale(yBarScale).orient('left');

  var refreshBars = function() {
          bars.selectAll('.bar')
              .transition()
                  .delay(200)
                  .duration(1000)
                  .style('fill', '#0066CC')
                  .attr('width', function(d) {
                      return xBarScale(d.avgCals);
                  });
      };

  var filterBars = function(filterVal, filterFunc) {
      bars.selectAll('.bar')
          .filter(filterFunc)
          .transition()
              .delay(200)
              .duration(1000)
              .style('fill', 'red')
              .attr('width', function(d) {
                  return xBarScale(0);
              });
  }; 

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
      globalBarData = barData;
      // We set the domain of the xScale. The domain includes 0 up to
      // the maximum frequency in the barDataset. This is because 
      xBarScale.domain([0, d3.max(barData, function(d) {
          return d.avgCals;
      })]);

      // We set the domain of the yScale. The scale is ordinal, and
      // contains every letter in the alphabet (the letter attribute
      // in our barData array). We can use the map function to iterate
      // through each value in our barData array, and make a new array
      // that contains just letters.
      yBarScale.domain(barData.map(function(d) {
          return d.manu;
      }));

      // Append the y-axis to the graph. the translate(20, 0) stuff
      // shifts the axis 20 pixels from the left. This just helps us
      // position stuff to where we want it to be.
      bars.append('g')
          .attr('class', 'y axis')
          .attr('transform', 'translate(70, 0)')
          // Call is a special method that lets us invoke a function
          // (called 'yAxis' in this case) which creates the actual
          // yAxis using D3.
          .call(yBarAxis);

      // Create the bars in the graph. First, select all '.bars' that
      // currently exist, then load the barData into them. enter() selects
      // all the pieces of barData and lets us operate on them.
      bars.append('g')
          .selectAll('.bar')
          .data(barData)
          .enter()
          .append('rect')
              .attr('class', 'bar')
              .attr('x', 80)
              .attr('y', function(d) {
                  return yBarScale(d.manu);
              })
              .attr('width', function(d) {
                  // xScale will map any number and return a number
                  // within the output range we specified earlier.
                  return xBarScale(d.avgCals);
              })
              .attr('height', function(d) {
                  // Remember how we set the yScale to be an ordinal scale
                  // with bands from 0 to height? And then we set the domain 
                  // to contain all the letters in the alphabet? 
                  return yBarScale.rangeBand();
              })
              .on('click', function(d) {
                  currManu = d.manu;
                  var matchingData = new Array();
                  console.log(currManu);
                  globalScatData.forEach(function(d) {
                    if (d.Manufacturer !== currManu) {
                      console.log('in here');
                      matchingData.push(d);
                    }
                  });
                  console.log(matchingData);
                  scatSvg.selectAll('.dot')
                          .data(matchingData)
                          .transition()
                            .delay(200)
                            .duration(1000)
                            .style('opacity', 0.25);
              });

  });
}