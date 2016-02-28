// self-invoking anonymous function, but doesn't use jQuery
(window.onload = function() {

  // Setting document and chart properties
  var margin = {top: 20, right: 20, bottom: 30, left: 40},
      width = 960 - margin.left - margin.right,
      height = 500 - margin.top - margin.bottom;
  // Setting the range for X 
  var x = d3.scale.ordinal()
      .rangeRoundBands([0, width], .1);
  // Setting the range for Y 
  var y = d3.scale.linear()
      .range([height, 0]); // flipped to draw the height bottom -> up
  // Creating the X Axis
  var xAxis = d3.svg.axis()
    .scale(x)
    .orient("bottom");
  // Creating the Y Axis
  var yAxis = d3.svg.axis()
      .scale(y)
      .orient("left")
      .ticks(10, "%");
  // Creating an SVG canvas
  var svg = d3.select(".content")
      .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
          .append("g")
          .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  // Load data from file with a specific type function
  d3.csv("data/data.csv", type, function(error, data) {
    
    // log data to console for inspection
    console.log(data);  
    if (error) throw error;

    /**
     * TODO:
     * Process the data. If filtering is required before binding the data to
     * the DOM elements, this would be the place to do it. In what cases
     * would we do this?
     *
     **/
    // Setting the domain for X and Y scales
    x.domain(data.map(function(d) { return d.letter; }));
    y.domain([0, d3.max(data, function(d) { return d.frequency; })]);
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
    svg.selectAll(".bar")
      .on("click", barClick);
  
  });

  // specifying the data type
  function type(d) {
    letter = d.letter;
    frequency = +d.frequency;
    return d;
  }

  function drawBars(data) {
    /**
     * TODO:
     * Play with the D3 filter method and understand how it works.
     * DONE: Filtered based on frequency
     **/
    var selection = svg.selectAll(".bar")
        .data(data)
        .enter()
        .append("rect")
    
    filterLetter(selection)
        .attr("class", "bar")
        .attr("x", function(d) { return x(d.letter); })
        .attr("width", x.rangeBand())
        .attr("y", function(d) { return y(d.frequency); })
        .attr("height", function(d) { return height - y(d.frequency); });
  }

  function drawXAxis() {
    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis)
        .append("text")
          .attr("y", 20)
          .attr("x", (width / 2) - 10) // align in center
          .attr("dy", ".85em")
          .style("text-anchor", "start")
          .style("font-size", "12px")
          .text("Letters")
  }

  function drawYAxis() {
    svg.append("g")
        .attr("class", "y axis")
        .call(yAxis)
        .append("text")
          .attr("transform", "rotate(-90)")
          .attr("y", 6)
          .attr("dy", ".71em")
          .style("text-anchor", "end")
          .style("font-size", "12px")
          .text("Frequency");
  }

  /**
   * TODO:
   * See? This is easy. Create a preprocessing filter method to remove data for
   * the letter B from the data set
   *
   **/
   function filterLetter(selection) {
      return selection.filter(function(d) { return d.letter !== 'B'; })
   }

  /**
   * TODO:
   * Supporting the onclick event, write a function that can filter data
   * using the already bound DOM elements, and change the bar's height back
   * to zero.
   *
   * Ready for more? Let's add transitions then!
   *
   **/
   function barClick() {
      d3.select(this)
        .style("fill", "#00CC66")
        .transition()
          .duration(1000)
          .attr("y", function(d) { return y(d.frequency) * Math.random(); });
   }

 })();