// self-invoking anonymous function, but doesn't use jQuery
(window.onload = function() {
  //##############    1    ####################
    //Setting the size of our canvas
    var width = 700; 
    var height = 500; 

    //Setting our x and y axes
    //RangeRoundBands returns the band width. Decimal value is the padding
    //Range provides the band height (because of the inverted values).
    var x = d3.scale.ordinal().rangeRoundBands([0, width], 0.1);
    var y = d3.scale.linear().range([height, 0]);

    //Creating our chart and grabbing attributes from '.chart' in header
    var barGraph = d3.select('#bar-graph')
                        .attr('width', width)
                        .attr('height', height);


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
    function(error, data) {
      if (error) throw error;
      data = new Array();
      for (var prop in map) { data.push(map[prop]); }
      // log data to console for inspection
      console.log(data);

      //Set our scale domains
      //data.map creates a new array with the result of a function of every element in the array
      x.domain(data.map(function(d) { return d.manu; }));
      y.domain([0, d3.max(data, function(d) { return d.avgCals; })]);

      var y_translate = 50;
      /* Talk about this later */

      //##############    3    ####################
      //Grabbing data and binding it to the bars
      //'G' groups all the svg elements together
      var bar = barGraph.selectAll('g')
                        .data(data)
                        .enter()
                        .append('g')
                        .attr('transform', function(d) { return 'translate('+ x(d.manu) +',0)'; });
      // Translate arranges all the 'g' elements on the X axis.
      // Without the translate, all the groups would be drawn at the same position

      //##############    4    ####################
      //Generating rectangle SVG elements for our data
      bar.append('rect')
            .attr('y', function(d) { return y(d.avgCals); }) // Setting the Y position of individual bars based on the data
            .attr('height', function(d) { return height - y_translate - y(d.avgCals); }) // At the chosen Y position, we're now specifying height.
            .attr('width', x.rangeBand())

      //##############    5    ####################
      //Adding y labels to our bars
      bar.append('text')
            .attr('x', x.rangeBand() / 2.5)
            .attr('y', function(d) { return y(d.avgCals) + 3; })
            .attr('dy', '.75em')
            .style('fill', 'white')
            .text(function(d) { return d.avgCals; });

      //Adding x labels to our bars
      bar.append('text')
            .attr('class', 'xText')
            .attr('x', x.rangeBand() / 5)
            .attr('y', height - y_translate + 5)
            .attr('dy', '.75em')
            .style('fill', 'black')
            .text(function(d) { return d.manu; });

    });

})();