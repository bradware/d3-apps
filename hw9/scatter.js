// Your browser will call the onload() function when the document
// has finished loading. In this case, onload() points to the
// start() method we defined below. Because of something called
// function hoisting, the start() method is callable below
window.onload = start;

function start() {
  var scatMargin = {top: 50, right: 0, bottom: 30, left: 0};
  var scatWidth = 600 - scatMargin.left - scatMargin.right;
  var scatHeight = 600 - scatMargin.top - scatMargin.bottom;
  var circleScale = d3.scale.linear().range([0, 5]);

  // pre-cursors
  var sizeForCircle = function(d) {
    // TODO: modify the size
    return circleScale(d.servSizeWeight);
  }

  // setup x
  var xScatValue = function(d) { return d.calories;}, // data -> value
      xScatScale = d3.scale.linear().range([0, scatWidth]), // value -> display
      xScatMap = function(d) { return xScatScale(xScatValue(d));}, // data -> display
      xScatAxis = d3.svg.axis().scale(xScatScale).orient("bottom");

  // setup y
  var yScatValue = function(d) { return d.sugars; }, // data -> value
      yScatScale = d3.scale.linear().range([scatHeight, 0]), // value -> display
      yScatMap = function(d) { return yScatScale(yScatValue(d)); }, // data -> display
      yScatAxis = d3.svg.axis().scale(yScatScale).orient("left");

  // setup fill color
  var cValue = function(d) { return d.Manufacturer;},
      color = d3.scale.category10();

  // add the graph canvas to the body of the webpage
  var svg = d3.select(".scatterplot").append("svg")
      .attr("width", scatWidth + scatMargin.left + scatMargin.right)
      .attr("height", scatHeight + scatMargin.top + scatMargin.bottom)
      .append("g")
      .attr("transform", "translate(" + scatMargin.left + "," + scatMargin.top + ")");

  // add the tooltip area to the webpage
  var tooltip = d3.select("body").append("div")
      .attr("class", "tooltip")
      .style("opacity", 0);

  // load data
  d3.csv("data/cereal.csv", function(error, data) {

    // change string (from CSV) into number format
    data.forEach(function(d) {
      d.calories = +d.Calories;
      d.sugars = +d.Sugars;
      d.servSizeWeight = +d['Serving Size Weight'];
    });

    console.log(data);

    // don't want dots overlapping axis, so add in buffer to data domain
    xScatScale.domain([d3.min(data, xScatValue)-1, d3.max(data, xScatValue)+1]);
    yScatScale.domain([d3.min(data, yScatValue)-1, d3.max(data, yScatValue)+1]);

    // x-axis
    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + scatHeight + ")")
        .attr("fill", "white")
        .call(xScatAxis)
      .append("text")
        .attr("class", "label")
        .attr("x", scatWidth)
        .attr("y", -6)
        .attr("fill", "white")
        .style("text-anchor", "end")
        .text("Calories");

    // y-axis
    svg.append("g")
        .attr("class", "y axis")
        .attr("fill", "white")
        .call(yScatAxis)
      .append("text")
        .attr("class", "label")
        .attr("transform", "rotate(-90)")
        .attr("y", 6)
        .attr("dy", ".71em")
        .attr("fill", "white")
        .style("text-anchor", "end")
        .text("Sugars");

    // draw dots
    svg.selectAll(".dot")
        .data(data)
        .enter().append("circle")
          .attr("class", "dot")
          .attr("r", sizeForCircle)
          .attr("cx", xScatMap)
          .attr("cy", yScatMap)
          .style("fill", function(d) { return color(cValue(d));})
          .on("mouseover", function(d) {
              // TODO: show the tool tip
              tooltip.style('opacity', 1);
              // TODO: fill to the tool tip with the appropriate data
              tooltip.html('Cereal Name: ' + d['Cereal Name'] + '<br>' + 
                           'Calories: ' + d.calories + '<br>' + 
                           'Sugars: ' + d.sugars);
              // TODO: update text in our custom nutrition label

              // TODO: expand all nodes with the same manufacturer

          })
          .on("mouseout", function(d) {
              // TODO: hide the tooltip
              tooltip.style('opacity', 0);
              // TODO: resize the nodes

          });

    // draw legend
    var legend = svg.selectAll(".legend")
        .data(color.domain())
        .enter()
        .append("g")
          .attr("class", "legend")
          .attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; });

    // draw legend colored rectangles
    legend.append("rect")
        .attr("x", scatWidth - 18)
        .attr("width", 18)
        .attr("height", 18)
        .style("fill", color);

    // draw legend text
    legend.append("text")
        .attr("x", scatWidth - 24)
        .attr("y", 9)
        .attr("dy", ".35em")
        .attr("fill", "white")
        .style("text-anchor", "end")
        .text(function(d) { return d;});
  });
}