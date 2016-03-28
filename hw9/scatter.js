// self-invoking anonymous function, but doesn't use jQuery
(window.onload = function() {
  var scatMargin = {top: 50, right: 0, bottom: 30, left: 0};
  var scatWidth = 700 - scatMargin.left - scatMargin.right;
  var scatHeight = 600 - scatMargin.top - scatMargin.bottom;

  // pre-cursors
  var sizeForCircle = function(d) {
    // TODO: modify the size
    return 6;
  }

  // setup x
  var xScatValue = function(d) { return d.Potassium;}, // data -> value
      xScatScale = d3.scale.linear().range([0, scatWidth]), // value -> display
      xScatMap = function(d) { return xScatScale(xValue(d));}, // data -> display
      xScatAxis = d3.svg.axis().scale(xScatScale).orient('bottom');

  // setup y
  var yScatValue = function(d) { return d['Sodium'];}, // data -> value
      yScatScale = d3.scale.linear().range([scatHeight, 0]), // value -> display
      yScatMap = function(d) { return yScatScale(yValue(d));}, // data -> display
      yScatAxis = d3.svg.axis().scale(yScatScale).orient('left');

  // setup fill color
  var cValue = function(d) { return d.Manufacturer;},
      color = d3.scale.category10();

  // add the graph canvas to the body of the webpage
  var svg = d3.select('#scatterplot').append('svg')
      .attr('width', scatWidth + scatMargin.left + scatMargin.right)
      .attr('height', scatHeight + scatMargin.top + scatMargin.bottom)
      .append('g')
      .attr('transform', 'translate(' + scatMargin.left + ',' + scatMargin.top + ')');

  // add the tooltip area to the webpage
  var tooltip = d3.select('body').append('div')
      .attr('class', 'tooltip')
      .style('opacity', 0);

  // load data
  d3.csv('data/cereal.csv', function(error, scatData) {
    console.log(scatData);
    // change string (from CSV) into number format
    scatData.forEach(function(d) {
      d.Potassium = +d.Potassium;
      d['Sodium'] = +d['Sodium'];
    });

    // don't want dots overlapping axis, so add in buffer to data domain
    xScatScale.domain([d3.min(scatData, xScatValue)-1, d3.max(scatData, xScatValue)+1]);
    yScatScale.domain([d3.min(scatData, yScatValue)-1, d3.max(scatData, yScatValue)+1]);

    // x-axis
    svg.append('g')
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
        .text('Potassium');

    // y-axis
    svg.append('g')
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
        .text('Sodium');

    // draw dots
    svg.selectAll('.dot')
        .data(scatData)
        .enter().append('circle')
          .attr('class', 'dot')
          .attr('r', sizeForCircle)
          .attr('cx', xScatMap)
          .attr('cy', yScatMap)
          .style('fill', function(d) { return color(cValue(d));})
          .on('mouseover', function(d) {

            // TODO: show the tool tip

            // TODO: fill to the tool tip with the appropriate data

            // TODO: update text in our custom nutrition label

            // TODO: expand all nodes with the same manufacturer

        })
        .on('mouseout', function(d) {
            // TODO: hide the tooltip

            // TODO: resize the nodes

        });

    // draw legend
    var legend = svg.selectAll('.legend')
        .data(color.domain())
        .enter().append('g')
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
})();
