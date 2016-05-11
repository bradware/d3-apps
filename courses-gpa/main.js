// Your browser will call the onload() function when the document
// has finished loading. In this case, onload() points to the
// start() method we defined below. Because of something called
// function hoisting, the start() method is callable below
window.onload = start;

function start() {
  // constant variables defined used throughout
  var graph = document.getElementById('graph');

  var width = 780;
  var height = 780;
  var barXAxisOffset = 80;
  var barYAxisOffset = 50;

  var svg = d3.select(graph)
      .append('svg')
      .attr('width', width)
      .attr('height', height);
  var bars = svg.append('g');

  // filter DOM items
  var button = document.getElementById('filter-button');
  var selectInput = document.getElementById('dept-input');
  var textInput = document.getElementById('gpa-input');
  
  var filterButton = d3.select('#filter-button');
  var deptInput = d3.select('#dept-input');
  var gpaInput = d3.select('#gpa-input');

  // scales and y-axis for graph
  var xScale = d3.scale.linear().range([0, width - barXAxisOffset]);
  var yScale = d3.scale.ordinal().rangeRoundBands([0, height - barYAxisOffset], 0.3);
  var yAxis = d3.svg.axis().scale(yScale).orient('left');
  var xAxis = d3.svg.axis().scale(xScale).orient('top');

  var refreshBars = function() {
          bars.selectAll('.bar')
              .transition()
                  .delay(200)
                  .duration(1000)
                  .style('fill', '#0066CC')
                  .attr('width', function(d) {
                      return xScale(d.gpa);
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
                  return xScale(0);
              });
  }; 

  var validateDeptInput = function() {
      return deptInput.node().value !== 'CHOOSE DEPT';
  };

  var validateGpaInput = function() {
      var num = Number(gpaInput.node().value);
      if (gpaInput.node().value === '' || isNaN(num) || num < 0 || num > 4) {
          d3.select('.form-group').classed('has-success', false);
          d3.select('.form-group').classed('has-error', true);
          return false;
      }
      else {
          d3.select('.form-group').classed('has-error', false);
          d3.select('.form-group').classed('has-success', true);
          return true;
      }
  };

  var validateInput = function() {
      if (validateGpaInput() && validateDeptInput()) {
          button.disabled = false;
      } else {
          button.disabled = true;
      }
  }; 

  selectInput.addEventListener('change', validateInput);
  textInput.addEventListener('change', validateInput);
  
  filterButton.on('click', function() {
      console.log('FILTER BUTTON CLICKED');
      refreshBars();
      
      var dept = deptInput.node().value;
      console.log('FILTER DEPT: ' + dept);
      if (dept !== 'EVERY DEPT') {
          filterBars(dept, function(d) {
              return d.dept !== dept;
          });
      }
      
      var minGPA = gpaInput.node().value;
      console.log('FILTER MIN GPA: ' + minGPA);
      filterBars(minGPA, function(d) {
          return d.gpa < minGPA;
      });
  });

  d3.csv('data/Courses.csv', function(d) {
      d.dept = d.Department;
      d.num = d['Course Number'];
      d.gpa = +d.GPA;
      if (d.gpa < 0) {
          d.gpa = 0;
      }
      return d;
  }, function(error, data) {
      // We set the domain of the xScale. The domain includes 0 up to
      // the maximum frequency in the dataset. This is because 
      xScale.domain([0, 4]);

      // We set the domain of the yScale. The scale is ordinal, and
      // contains every letter in the alphabet (the letter attribute
      // in our data array). We can use the map function to iterate
      // through each value in our data array, and make a new array
      // that contains just letters.
      yScale.domain(data.map(function(d) {
          return d.dept + ' ' + d.num;
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
          .call(yAxis);

      // Append the y-axis to the graph. the translate(20, 0) stuff
      // shifts the axis 20 pixels from the left. This just helps us
      // position stuff to where we want it to be.
      bars.append('g')
          .attr('class', 'x axis')
          .attr('transform', 'translate(70, 17)')
          // Call is a special method that lets us invoke a function
          // (called 'yAxis' in this case) which creates the actual
          // yAxis using D3.
          .call(xAxis);

      // Create the bars in the graph. First, select all '.bars' that
      // currently exist, then load the data into them. enter() selects
      // all the pieces of data and lets us operate on them.
      bars.append('g')
          .selectAll('.bar')
          .data(data)
          .enter()
          .append('rect')
          .attr('class', 'bar')
          .attr('x', barXAxisOffset)
          .attr('y', function(d) {
              return yScale(d.dept + ' ' + d.num);
          })
          .attr('width', function(d) {
              // xScale will map any number and return a number
              // within the output range we specified earlier.
              return xScale(d.gpa);
          })
          .attr('height', function(d) {
              // Remember how we set the yScale to be an ordinal scale
              // with bands from 0 to height? And then we set the domain 
              // to contain all the letters in the alphabet? 
              return yScale.rangeBand();
          });
    });
}