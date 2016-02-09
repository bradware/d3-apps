// self-invoking anonymous function, but doesn't use jQuery
(window.onload = function() {
  
  //##############    1    ####################
  //Setting the size of our canvas
  var width = 780; 
  var height = 460; 

  //Setting our x and y axes
  //RangeRoundBands returns the band width. Decimal value is the padding
  //Range provides the band height (because of the inverted values).
  var x = d3.scale.ordinal().rangeRoundBands([0, width], 0.1);
  var y = d3.scale.linear().range([height, 0]);

  //Creating our chart and grabbing attributes from ".chart" in header
  var chart = d3.select(".chart")
      .attr("width", width)
      .attr("height", height);

  //##############    2    ####################
  //Pulling data from .json file 
  d3.csv("data/State-GPA.csv", function(d) {
    return {
      state: d.State,
      gpa: +d["Average-GPA"]
    };
  },  
    function(error, data) {
      
      //Logging data to the console so we can make sure the data is bound
      console.log(data);
      //Set our scale domains
      //data.map creates a new array with the result of a function of every element in the array
      x.domain(data.map(function(d) { return d.state; }));
      y.domain([0, d3.max(data, function(d) { return d.gpa; })]);

      var y_translate = 50;

      //##############    3    ####################
      //Grabbing data and binding it to the bars
      //"G" groups all the svg elements together
      var bar = chart.selectAll("g")
        .data(data)
        .enter()
        .append("g")
        .attr("transform", function(d) { return "translate("+ x(d.state) +",0)"; });
      // Translate arranges all the "g" elements on the X axis.
      // Without the translate, all the groups would be drawn at the same position

      //##############    4    ####################
      //Generating rectangle SVG elements for our data
      bar.append("rect")
        .attr("y", function(d) { return y(d.gpa); }) // Setting the Y position of individual bars based on the data
        .attr("height", function(d) { return height - y_translate - y(d.gpa); }) // At the chosen Y position, we're now specifying height.
        .attr("width", x.rangeBand())
        .style("fill", function(d) {
          if(d.gpa < 1) { // If the average GPA is less than 1, make the rectangle red
            return "red"; 
          }
          else if (d.gpa < 2) { // If the average GPA is 1 or more, but less than 2, make the rectangle orange
            return "orange"; 
          }
          else if (d.gpa < 3) { // If the average GPA is 2 or more, but less than 3, make the rectangle yellow
            return "yellow";
          }
          else if (d.gpa < 4) { // If the average GPA is 3 or more, but less than 4 make the rectangle blue
            return "blue";
          }
          else { // If the average GPA is 4 or more, make the rectangle gold
            return "gold";
          }
        })
        .style("stroke", "black").style("stroke-width", 1); /* Add black borders to the rectangles */

      //##############    5    ####################
      //Adding y labels to our bars
      bar.append("text")
        .attr("x", x.rangeBand() / 2)
        .attr("y", function(d) { return y(d.gpa) + 3; })
        .attr("dy", ".75em")
        .text(function(d) { return d.gpa; })
        .style("fill", function(d) {
          if(d.gpa < 1) { // If the average GPA is less than 1, make the bar label’s color white
            return "white"; 
          }
          else if (d.gpa < 3 || d.gpa >= 4) { // If the average GPA is 1 or more, but less than 2, make the bar label’s color black 
            // If the average GPA is 2 or more, but less than 3, make the bar label’s color black
            // If the average GPA is 4 or more, make the bar label’s color black
            return "black"; 
          }
          else { // If the average GPA is 3 or more, but less than 4 make the bar label’s color gold
            return "gold";
          }
        });

      //Adding x labels to our bars
      bar.append("text")
        .attr("class", "xText")
        .attr("x", x.rangeBand() / 2)
        .attr("y", height - y_translate + 5)
        .attr("dy", ".75em")
        .text(function(d) { return d.state; })
    }
  );
})();