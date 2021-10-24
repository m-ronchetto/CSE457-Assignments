/**
 * Constructor for the Year Chart
 *
 * @param electoralVoteChart instance of ElectoralVoteChart
 * @param tileChart instance of TileChart
 * @param votePercentageChart instance of Vote Percentage Chart
 * @param electionInfo instance of ElectionInfo
 * @param electionWinners data corresponding to the winning parties over mutiple election years
 */
function YearChart(electoralVoteChart, tileChart, votePercentageChart, electionWinners) {
    var self = this;

    self.electoralVoteChart = electoralVoteChart;
    self.tileChart = tileChart;
    self.votePercentageChart = votePercentageChart;
    self.electionWinners = electionWinners;
    self.init();
};

/**
 * Initializes the svg elements required for this chart
 */
YearChart.prototype.init = function(){

    var self = this;
    self.margin = {top: 10, right: 20, bottom: 30, left: 50};
    var divyearChart = d3.select("#year-chart").classed("fullView", true);

    //Gets access to the div element created for this chart from HTML
    self.svgBounds = divyearChart.node().getBoundingClientRect();
    self.svgWidth = self.svgBounds.width - self.margin.left - self.margin.right;
    self.svgHeight = 100;

    //creates svg element within the div
    self.svg = divyearChart.append("svg")
        .attr("width",self.svgWidth)
        .attr("height",self.svgHeight)

};

/**
 * Returns the class that needs to be assigned to an element.
 *
 * @param party an ID for the party that is being referred to.
 */
YearChart.prototype.chooseClass = function (party) {
    var self = this;
    if (party == "R") {
        return "yearChart republican";
    }
    else if (party == "D") {
        return "yearChart democrat";
    }
    else if (party == "I") {
        return "yearChart independent";
    }
}


/**
 * Creates a chart with circles representing each election year, populates text content and other required elements for the Year Chart
 */
YearChart.prototype.update = function(){
    var self = this;
    var clicked = null;

    //Domain definition for global color scale
    var domain = [-60,-50,-40,-30,-20,-10,0,10,20,30,40,50,60 ];

    //Color range for global color scale
    var range = ["#0066CC", "#0080FF", "#3399FF", "#66B2FF", "#99ccff", "#CCE5FF", "#ffcccc", "#ff9999", "#ff6666", "#ff3333", "#FF0000", "#CC0000"];

    //Global colorScale to be used consistently by all the charts
    self.colorScale = d3.scaleQuantile()
        .domain(domain).range(range);
    
    self.electionWinners.forEach(function(d) {
        d.YEAR = +d.YEAR;
    });

    // ******* TODO: PART I *******

    //Style the chart by adding a dashed line that connects all these years.
    //HINT: Use .lineChart to style this dashed line

    self.svg.append("line").attr("class", "lineChart").attr("y1",(self.svg.attr("height")/2)).attr("y2", (self.svg.attr("height")/2)).attr("x1", 0).attr("x2", (self.svgWidth));

    // Create the chart by adding circle elements representing each election year
    //The circles should be colored based on the winning party for that year
    //HINT: Use the .yearChart class to style your circle elements
    //HINT: Use the chooseClass method to choose the color corresponding to the winning party.

    self.svg.selectAll('circle').data(self.electionWinners).enter().append("circle")
            .attr("cx", function(d, i){
                let xCoord = ((i+1)/self.electionWinners.length)*self.svg.attr("width")- 24;
                return (xCoord + "px");
            })
            .attr("cy", self.svg.attr("height")/2).attr("r", "12px").attr("class", function(d){return self.chooseClass(d.PARTY)})
            .attr("year", function(d){return d.YEAR})
            //Clicking on any specific year should highlight that circle and  update the rest of the visualizations
            //HINT: Use .highlighted class to style the highlighted circle
            //Election information corresponding to that year should be loaded and passed to
            // the update methods of other visualizations
            
            .on("click", function(d){
                let year = d3.select(this).attr('year');
                d3.csv("data/election-results-" + year + ".csv")
                .then(function(electionResult) {
                    d3.csv("data/Map.csv")
                    .then(function(tiles){

                    
                for (let i=0; i<electionResult.length; i++){
                    let position = tiles.filter(function(d){
                       return  d.abbreviation == electionResult[i].Abbreviation;
                    });
                    electionResult[i].xIndex = position[0].xIndex;
                    electionResult[i].yIndex = position[0].yIndex;
                    electionResult[i].Total_EV = +electionResult[i].Total_EV;
                    electionResult[i].R_Percentage = +electionResult[i].R_Percentage;
                    electionResult[i].D_Percentage = +electionResult[i].D_Percentage;
                    electionResult[i].I_Percentage = +electionResult[i].I_Percentage;
                    electionResult[i].D_Votes = +electionResult[i].D_Votes;
                    electionResult[i].R_Votes = +electionResult[i].R_Votes;
                    electionResult[i].I_Votes = +electionResult[i].I_Votes;
                }
                self.electoralVoteChart.update(electionResult, self.colorScale);
                self.tileChart.update(electionResult, self.colorScale);
                self.votePercentageChart.update(electionResult, self.colorScale);
                });
            });
                self.svg.selectAll("circle").classed("highlighted", false);
                d3.select(this).classed("highlighted", true);

            });

    //Append text information of each year right below the corresponding circle
    //HINT: Use .yeartext class to style your text elements

    self.svg.selectAll("text").data(self.electionWinners).enter().append("text").text(function(d){return d.YEAR}).attr("class", "yeartext")
        .attr("x", function(d, i){
            let xCoord = ((i+1)/self.electionWinners.length)*self.svg.attr("width")- 24;
            return (xCoord + "px");
        })
    .attr("y", (self.svg.attr("height")/2)+30);

    //******* TODO: EXTRA CREDIT *******

    //Implement brush on the year chart created above.
    //Implement a call back method to handle the brush end event.
    //Call the update method of brushSelection and pass the data corresponding to brush selection.
    //HINT: Use the .brush class to style the brush.
};
