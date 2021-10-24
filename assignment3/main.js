d3.json("data/output.json").then(function(data){
        for (let i = 0; i < data.storydata.length; i++){
            for (let j = 0; j < data.storydata[i].probabilities.length; j++){
                data.storydata[i].probabilities[j] = +data.storydata[i].probabilities[j];
            }
        }

    //creating an array of common themes's keywords
    let keywords = [];
    for (let i = 0; i<data.topics.length; i++){
        keywords[i] = data.topics[i];
    }
    console.log(keywords);

    let themes= ["Nature", "Beauty", "Family", "Royalty", "Objects"];
        
    //entering story titles into #title-selection
    let array = [];
    for (let i = 0; i < data.storydata.length; i++){
        array[i] = data.storydata[i].title;
    }
    d3.select("#title-selection").selectAll("p").data(array).enter().append("p").text(function(d){
        return d;
    }).on("click", function(event){
        //displaying text version of data for selection
        let title = this.innerText;
        d3.select("#title-selection").selectAll("p").classed("bold", false);
        d3.select(this).classed("bold", true);
        let findTitle = data.storydata.filter(d => d.title === title)[0];
        d3.select(".side-bar").select("h2").text(title);
        let formattedProbabilities = [];
        for (let i=0; i<findTitle.probabilities.length; i++){
            formattedProbabilities[i] = themes[i] + ": " + (parseInt((findTitle.probabilities[i])*1000)/10);
        }
        d3.select(".side-bar").selectAll("p").data(formattedProbabilities).enter().append("p");
        d3.select(".side-bar").selectAll("p").text(function(d){
             return d + "%";
        });
    });

    
    

});


// var data = [
//     {
//       className: 'germany', // optional, can be used for styling
//       axes: [
//         {axis: "strength", value: 13, yOffset: 10},
//         {axis: "intelligence", value: 6},
//         {axis: "charisma", value: 5},  
//         {axis: "dexterity", value: 9},  
//         {axis: "luck", value: 2, xOffset: -20}
//       ]
//     },
//     {
//       className: 'argentina',
//       axes: [
//         {axis: "strength", value: 6},
//         {axis: "intelligence", value: 7},
//         {axis: "charisma", value: 10},  
//         {axis: "dexterity", value: 13},  
//         {axis: "luck", value: 9}
//       ]
//     }
//   ];

// var chart = RadarChart.chart();
// var svg = d3.select('body').append('svg')
//   .attr('width', 600)
//   .attr('height', 800);

// // draw one
// svg.append('g').classed('focus', 1).datum(data).call(chart);

// // draw many radars
// var game = svg.selectAll('g.game').data(
//   [
//     data,
//     data,
//     data,
//     data
//   ]
// );
// game.enter().append('g').classed('game', 1);
// game
//   .attr('transform', function(d, i) { return 'translate(150,600)'; })
//   .call(chart);

//   // retrieve config
// chart.config();
// // all options with default values
// chart.config({
//   containerClass: 'radar-chart', // target with css, the default stylesheet targets .radar-chart
//   w: 600,
//   h: 600,
//   factor: 0.95,
//   factorLegend: 1,
//   levels: 3,
//   maxValue: 0,
//   minValue: 0,
//   radians: 2 * Math.PI,
//   color: d3.scale.category10(), // pass a noop (function() {}) to decide color via css
//   axisLine: true,
//   axisText: true,
//   circles: true,
//   radius: 5,
//   open: false,  // whether or not the last axis value should connect back to the first axis value
//                 // if true, consider modifying the chart opacity (see "Style with CSS" section above)
//   axisJoin: function(d, i) {
//     return d.className || i;
//   },
//   tooltipFormatValue: function(d) {
//     return d;
//   },
//   tooltipFormatClass: function(d) {
//     return d;
//   },
//   transitionDuration: 300
// });