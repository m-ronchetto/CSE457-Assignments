changeData();

function staircase() {
    // find rectangles
    let initial = document.getElementById("sort_x_data").children;

    //update rectangles with incremented lengths
    for (let i=0; i<initial.length; i++){
        let a = initial[i];
        a.setAttribute("width", i*10 +10);
    }
}

function update(data) {

    // D3 loads all CSV data as strings;
    // while Javascript is pretty smart
    // about interpreting strings as
    // numbers when you do things like
    // multiplication, it will still
    // treat them as strings where it makes
    // sense (e.g. adding strings will
    // concatenate them, not add the values
    // together, or comparing strings
    // will do string comparison, not
    // numeric comparison).

    // We need to explicitly convert values
    // to numbers so that comparisons work
    // when we call d3.max()
    data.forEach(function (d) {
        d.a = parseInt(d.a);
        d.b = parseFloat(d.b);
    });


    // Set up the scales
    var aScale = d3.scaleLinear()
        .domain([0, d3.max(data, function (d) {
            return d.a;
        })])
        .range([0, 150]);
    var bScale = d3.scaleLinear()
        .domain([0, d3.max(data, function (d) {
            return d.b;
        })])
        .range([0, 150]);
    var iScale = d3.scaleLinear()
        .domain([0, data.length])
        .range([0, 110]);

    // ****** TODO: PART III (you will also edit in PART V) ******

    // TODO: Select and update the 'a' bar chart bars
    let bar1 = d3.select("#sort_x_data").selectAll("rect").data(data);
    bar1.enter().append("rect");
    bar1.exit().remove();
    bar1.attr("width", function(d) {
        return (aScale(d.a));
    });
    bar1.attr("height", "10px");
    bar1.attr("y", function(d, i){
        return (i*10);
    })
    
    // TODO: Select and update the 'b' bar chart bars

    let bar2 = d3.select("#sort_y_data").selectAll("rect").data(data);
    bar2.enter().append("rect");
    bar2.exit().remove();
    bar2.attr("width", function(d) {
        return (bScale(d.b));
    });
    bar2.attr("height", "10px");
    bar2.attr("y", function(d, i){
        return (i*10);
    })

    // TODO: Select and update the 'a' line chart path using this line generator
    var aLineGenerator = d3.line()
        .x(function (d, i) {
            return iScale(i);
        })
        .y(function (d) {
            return aScale(d.a);
        });

    let line1= d3.select("#line_x");
    line1.selectAll("path").data([data]).attr("d", function(d){
        return aLineGenerator(d);
    });

    // TODO: Select and update the 'b' line chart path (create your own generator)
    var bLineGenerator = d3.line()
        .x(function (d, i) {
            return iScale(i);
        })
        .y(function (d) {
            return bScale(d.b);
        });

    let line2= d3.select("#line_y");
    line2.selectAll("path").data([data]).attr("d", function(d){
        return bLineGenerator(d);
     });

    // TODO: Select and update the 'a' area chart path using this line generator
    var aAreaGenerator = d3.area()
        .x(function (d, i) {
            return iScale(i);
        })
        .y0(200)
        .y1(function (d) {
            return aScale(d.a);
        });

    let area1= d3.select("#area_x");
    area1.selectAll("path").data([data]).attr("d", function(d){
        return aAreaGenerator(d);
    });

    // TODO: Select and update the 'b' area chart path (create your own generator)
    var bAreaGenerator = d3.area()
    .x(function (d, i) {
        return iScale(i);
    })
    .y0(200)
    .y1(function (d) {
        return bScale(d.b);
    });

    let area2= d3.select("#area_y");
    area2.selectAll("path").data([data]).attr("d", function(d){
        return bAreaGenerator(d);
    });

    // TODO: Select and update the scatterplot points
    let scatter = d3.select("#scatter").selectAll("circle").data(data);
    scatter.enter().append("circle");
    scatter.exit().remove();
    scatter.attr("cx", function(d){
        return (aScale(d.a));
    }).attr("cy", function(d){
        return (bScale(d.b));
    }).attr("r", 7);

    // ****** TODO: PART IV ******
    d3.selectAll(".bar").on("mouseover", function(){
        this.style.fill = "purple";
    });
    
    d3.selectAll(".bar").on("mouseout", function(){
        this.style.fill = "steelblue";
    });
        
    d3.selectAll("circle").on("click", function(){
        console.log(this.getAttribute("cx") + ", " + this.getAttribute("cy"));
    });
    }

function changeData() {
    // // Load the file indicated by the select menu
    var dataFile = document.getElementById('dataset').value;
    if (document.getElementById('random').checked) {
        randomSubset();
    }
    else{
        d3.csv('data/' + dataFile + '.csv').then(update);
    }
}

function randomSubset() {
    // Load the file indicated by the select menu,
    // and then slice out a random chunk before
    // passing the data to update()
    var dataFile = document.getElementById('dataset').value;
    if (document.getElementById('random').checked) {
        d3.csv('data/' + dataFile + '.csv').then(function(data) {
            var subset = [];
            data.forEach(function (d) {
                if (Math.random() > 0.5) {
                    subset.push(d);
                }
            });
            update(subset);
        });
    }
    else{
        changeData();
    }
}