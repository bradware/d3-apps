// Your browser will call the onload() function when the document
// has finished loading. In this case, onload() points to the
// start() method we defined below. Because of something called
// function hoisting, the start() method is callable on line 6
// even though it is defined on line 8.
window.onload = start;

// This is where all of our javascript code resides. This method
// is called by "window" when the document (everything you see on
// the screen) has finished loading.
function start() {
    // Select the graph from the HTML page and save
    // a reference to it for later.
    var graph = document.getElementById('graph');

    // Specify the width and height of our graph
    // as variables so we can use them later.
    // Remember, hardcoding sucks! :)
    var width = 700;
    var height = 700;

    // Here we tell D3 to select the graph that we defined above.
    // Then, we add an <svg></svg> tag inside the graph.
    // On the <svg> element, we set the width and height.
    // Then, we save the reference to this element in the "svg" variable,
    // so we can use it later.
    // 
    // So our code now looks like this in the browser:
    // <svg width="700" height="600">
    // </svg>
    var svg = d3.select(graph)
        .append('svg')
        .attr('width', width)
        .attr('height', height);

    var filterButton = d3.select('#filter-button');
    var gpaInput = d3.select('#gpa-input');
    var deptInput = d3.select('#dept-input');

    // Remember, "svg" now references to <svg width="700" height="600"></svg>
    // So now we append a group <g></g> tag to our svg element, and return a
    // reference to that and save it in the "bars" variable.
    // 
    // Now bars looks like this:
    // <g></g>
    // 
    // And the svg element in our browser looks like this:
    // <svg width="700" height="600">
    //  <g></g>
    // </svg>
    var bars = svg.append('g');

    // Our bar chart is going to encode the letter frequency as bar width.
    // This means that the length of the x axis depends on the length of the bars.
    // The y axis should contain A-Z in the alphabet (ordinal data).
    var xScale = d3.scale.linear().range([0, width]);
    var yScale = d3.scale.ordinal().rangeRoundBands([0, height], 0.3);

    // Tell D3 to create a y-axis scale for us, and orient it to the left.
    // That means the labels are on the left, and tick marks on the right.
    var yAxis = d3.svg.axis().scale(yScale).orient('left');

    // Add a button below the graph. Clicking on this button will
    // run a filter on the data and use an animation in the process.
    // 
    // Our HTML will now look like this:
    // <div id="graph">
    //  <svg width="700" height="600">...</svg>
    //  <p>
    //    <button>Filter Data</button>
    //  </p>
    // </div>
    filterButton
        .on('click', function() {
            console.log('FILTER BUTTON CLICKED');
            var rawInput = gpaInput.node().value;
            var minGPA = handleInput(rawInput);
            var dept = deptInput.node().value;
            var sb = bars.selectAll('.bar')
                .filter(function(d) {
                    if (d.dept !== dept) {
                        return d;
                    }
                    else if (d.gpa < minGPA) {
                        return d;
                    }
                })
                .transition()
                    .duration(1000)
                    .style('fill', 'red')
                    .attr('width', function(d) {
                        return xScale(0);
                    });
            console.log(sb);
        });

    // D3 will grab all the data from "data.csv" and make it available
    // to us in a callback function. It follows the form:
    // 
    // d3.csv('file_name.csv', accumulator, callback)
    // 
    // Where 'file_name.csv' - the name of the file to read
    // accumulator - a method with parameter d that lets you pre-process
    //               each row in the CSV. This affects the array of
    //               rows in the function named 'callback'
    //
    // callback - a method with parameters error, data. Error contains
    //            an error message if the data could not be found, or
    //            was malformed. The 'data' parameter is an array of
    //            rows returned after being processed by the accumulator.
    d3.csv('data/Courses.csv', function(d) {
        d.dept = d.Department;
        d.num = d['Course Number'];
        d.gpa = +d.GPA;
        if (d.gpa < 0) {
            d.gpa = 0;
        }
        return d;
    }, function(error, data) {
        // We now have the "massaged" CSV data in the 'data' variable.
        console.log(data);
        // We set the domain of the xScale. The domain includes 0 up to
        // the maximum frequency in the dataset. This is because 
        xScale.domain([0, d3.max(data, function(d) {
            return d.gpa;
        })]);

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

        // Create the bars in the graph. First, select all '.bars' that
        // currently exist, then load the data into them. enter() selects
        // all the pieces of data and lets us operate on them.
        bars.append('g')
            .selectAll('.bar')
            .data(data)
            .enter()
            .append('rect')
            .attr('class', 'bar')
            .attr('x', 80)
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

function handleInput(input) {
    var num = Number(input);
    if (isNaN(num) || num < 0 || num > 4) {
        alert("FORM INPUT WAS INVALID. PLEASE ENTER A NUMBER BETWEEN 0 AND 4 TO FILTER GPA's.");
        return 0;
    }
    else {
        return num;
    }
}
