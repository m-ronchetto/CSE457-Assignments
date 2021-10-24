
/**
 * Constructor for the ElectoralVoteChart
 *
 * @param brushSelection an instance of the BrushSelection class
 */
function ElectoralVoteChart(){

    var self = this;
    self.init();
};

/**
 * Initializes the svg elements required for this chart
 */
ElectoralVoteChart.prototype.init = function(){
    var self = this;
    self.margin = {top: 30, right: 20, bottom: 30, left: 50};

    //Gets access to the div element created for this chart from HTML
    var divelectoralVotes = d3.select("#electoral-vote").classed("content", true);
    self.svgBounds = divelectoralVotes.node().getBoundingClientRect();
    self.svgWidth = self.svgBounds.width - self.margin.left - self.margin.right;
    self.svgHeight = 150;

    //creates svg element within the div
    self.svg = divelectoralVotes.append("svg")
        .attr("width",self.svgWidth)
        .attr("height",self.svgHeight)
};

/**
 * Returns the class that needs to be assigned to an element.
 *
 * @param party an ID for the party that is being referred to.
 */
ElectoralVoteChart.prototype.chooseClass = function (party) {
    var self = this;
    if (party == "R"){
        return "republican";
    }
    else if (party == "D"){
        return "democrat";
    }
    else if (party == "I"){
        return "independent";
    }
}

/**
 * Creates the stacked bar chart, text content and tool tips for electoral vote chart
 *
 * @param electionResult election data for the year selected
 * @param colorScale global quantile scale based on the winning margin between republicans and democrats
 */

ElectoralVoteChart.prototype.update = function(electionResult, colorScale){
    var self = this;

    // ******* TODO: PART II *******

    //Group the states based on the winning party for the state;
    //then sort them based on the margin of victory
    let dWin = electionResult.filter(function(d){
        return (d.D_Percentage > d.R_Percentage && d.D_Percentage > d.I_Percentage);
    });
    let rWin =  electionResult.filter(function(d){
        return (d.R_Percentage > d.D_Percentage && d.R_Percentage > d.I_Percentage);
    });
    let iWin =  electionResult.filter(function(d){
        return (d.I_Percentage > d.R_Percentage && d.I_Percentage > d.D_Percentage);
    });
    dWin.sort(function(a, b){
        return ((b.D_Percentage - a.D_Percentage)- (b.R_Percentage-a.R_Percentage));
    });
    rWin.sort(function(a, b){
        return ((a.R_Percentage - b.R_Percentage)- (a.D_Percentage-b.D_Percentage));
    });
    iWin.sort(function(a, b){
        return a.I_Percentage - b.I_Percentage;
    });
    electionResult = iWin.concat(dWin).concat(rWin);
    
    //Create the stacked bar chart.
    //Use the global color scale to color code the rectangles.
    //HINT: Use .electoralVotes class to style your bars.
    let totalVotes = 0;
    for (let i=0; i<electionResult.length ; i++){
        totalVotes += electionResult[i].Total_EV;
    }
    let electoralVotesScale = d3.scaleLinear().domain([0,totalVotes]).range([0, self.svgWidth]);
    self.svg.selectAll("rect").remove();
    self.svg.selectAll("rect").data(electionResult).enter().append("rect")
            .attr("class", "electoralVotes").attr("y", (self.svgHeight)/2)
            .attr("x", function(d, i){
                let xCoord = 0;
                for (let j = 0; j < i; j++){
                    xCoord += electoralVotesScale(electionResult[j].Total_EV);
                }
                return (xCoord + "px");
            }).attr("width", function(d,i){
                return electoralVotesScale(electionResult[i].Total_EV);
            }).attr("height", 20).attr("fill", function(d){
                if(d.I_Percentage > d.R_Percentage && d.I_Percentage > d.D_Percentage){
                    return "#45AD6A";
                    //independent color
                }
                return colorScale(d.R_Percentage - d.D_Percentage)});

    //Display total count of electoral votes won by the Democrat and Republican party
    //on top of the corresponding groups of bars.
    //HINT: Use the .electoralVoteText class to style your text elements;  Use this in combination with
    // chooseClass to get a color based on the party wherever necessary
    let dVotes = 0;
    for (let i = 0; i< dWin.length; i++){
        dVotes += dWin[i].Total_EV;
    }
    let rVotes = 0;
    for (let i = 0; i< rWin.length; i++){
        rVotes += rWin[i].Total_EV;
    }
    let iVotes = 0;
    for (let i=0; i<iWin.length; i++){
        iVotes += iWin[i].Total_EV;
    }
    let firstDemocratX = 0;
    for (let i=0; i<electionResult.length; i++){
        let d = electionResult[i];
        if (d.D_Percentage > d.R_Percentage && d.D_Percentage > d.I_Percentage){
            break;
        }
        firstDemocratX += electoralVotesScale(d.Total_EV);
    }
    self.svg.selectAll("text").remove();
    self.svg.append("text").text(function(){
        if (iVotes == 0){
            return "";
        }
        return iVotes;
    }).attr("x", 0).attr("y", (self.svgHeight/2)-20).attr("class", "electoralVoteText").classed("independent", true);
    self.svg.append("text").text(dVotes).attr("x", firstDemocratX).attr("y", (self.svgHeight/2)-20).attr("class", "electoralVoteText").classed("democrat", true);
    self.svg.append("text").text(rVotes).attr("x", self.svgWidth).attr("y", (self.svgHeight/2)-20).attr("class", "electoralVoteText").classed("republican", true);

    //Display a bar with minimal width in the center of the bar chart to indicate the 50% mark
    //HINT: Use .middlePoint class to style this bar.
    self.svg.append("rect").attr("class", "middlePoint").attr("x", (self.svgWidth)/2).attr("y", ((self.svgHeight)/2)-5).attr("height", 30).attr("width", 1);
  
    //Just above this, display the text mentioning the total number of electoral votes required
    // to win the elections throughout the country
    //HINT: Use .electoralVotesNote class to style this text element
    self.svg.append("text").text("Electoral Vote (269 needed to win)").attr("class", "electoralVotesNote")
    .attr("x", self.svgWidth/2).attr("y", (self.svgHeight/2)-30);
    
    //******* TODO: PART V *******
    //Implement brush on the bar chart created above.
    //Implement a call back method to handle the brush end event.
    //Call the update method of brushSelection and pass the data corresponding to brush selection.
    //HINT: Use the .brush class to style the brush.

};
