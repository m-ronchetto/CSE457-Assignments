/**
 * Constructor for the Vote Percentage Chart
 */
function VotePercentageChart(){

    var self = this;
    self.init();
};

/**
 * Initializes the svg elements required for this chart
 */
VotePercentageChart.prototype.init = function(){
    var self = this;
    self.margin = {top: 30, right: 20, bottom: 30, left: 50};
    var divvotesPercentage = d3.select("#votes-percentage").classed("content", true);

    //Gets access to the div element created for this chart from HTML
    self.svgBounds = divvotesPercentage.node().getBoundingClientRect();
    self.svgWidth = self.svgBounds.width - self.margin.left - self.margin.right;
    self.svgHeight = 200;

    //creates svg element within the div
    self.svg = divvotesPercentage.append("svg")
        .attr("width",self.svgWidth)
        .attr("height",self.svgHeight)
};

/**
 * Returns the class that needs to be assigned to an element.
 *
 * @param party an ID for the party that is being referred to.
 */
VotePercentageChart.prototype.chooseClass = function (party) {
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
 * Renders the HTML content for tool tip
 *
 * @param tooltip_data information that needs to be populated in the tool tip
 * @return text HTML content for toop tip
 */
VotePercentageChart.prototype.tooltip_render = function (tooltip_data) {
    var self = this;
    var text = "<ul>";
    tooltip_data.result.forEach(function(row){
        text += "<li class = " + self.chooseClass(row.party)+ ">" + row.nominee+":\t\t"+row.votecount+"("+row.percentage+"%)" + "</li>"
    });

    return text;
}

/**
 * Creates the stacked bar chart, text content and tool tips for Vote Percentage chart
 *
 * @param electionResult election data for the year selected
 */
VotePercentageChart.prototype.update = function(electionResult){
    var self = this;

    //for reference:https://github.com/Caged/d3-tip
    //Use this tool tip element to handle any hover over the chart
    let tip = d3.tip().attr('class', 'd3-tip')
        .direction('s')
        .offset(function() {
            return [0,0];
        })
        .html(function(d) {
            //  populate data in the following format
            tooltip_data = {
            "result":[
            {"nominee": dNominee,"votecount": total_D_Votes,"percentage": d_Percent,"party":"D"} ,
            {"nominee": rNominee,"votecount": total_R_Votes,"percentage": r_Percent,"party":"R"} 

            ]};
            if (total_I_Votes != 0){
                tooltip_data.result[2] = {"nominee": iNominee,"votecount": total_I_Votes,"percentage": i_Percent,"party":"I"};
            }
            // pass this as an argument to the tooltip_render function then,
            // return the HTML content returned from that method.
            return self.tooltip_render(tooltip_data);
        });


    // ******* TODO: PART III *******

    //Call the tool tip on hover over the bars to display stateName, count of electoral votes.
    //then, vote percentage and number of votes won by each party.
    self.svg.call(tip);

    //Create the stacked bar chart.
    //Use the global color scale to color code the rectangles.
    //HINT: Use .votesPercentage class to style your bars.
    let total_D_Votes = 0;
    let total_R_Votes = 0;
    let total_I_Votes = 0;
    let totalVotes = 0;
    for (let i = 0; i< electionResult.length; i++){
        total_D_Votes += electionResult[i].D_Votes;
        total_R_Votes += electionResult[i].R_Votes;
        total_I_Votes += electionResult[i].I_Votes;
    }
    totalVotes = total_D_Votes + total_I_Votes + total_R_Votes;
    d_Percent = parseInt((total_D_Votes)/(totalVotes)*1000)/10;
    r_Percent = parseInt((total_R_Votes)/(totalVotes)*1000)/10;
    i_Percent = parseInt((total_I_Votes)/(totalVotes)*1000)/10;

    let partyArray = ["I", "D", "R"];
    let iWidth = 0;
    let dWidth = 0;

    self.svg.selectAll("rect").remove();
    self.svg.selectAll("rect").data(partyArray).enter().append("rect").attr("class", "votesPercentage").attr("height", 20)
        .attr("y", self.svgHeight/2).attr("width", function(d){
            if (d =="I"){
                iWidth = (self.svgWidth)*(i_Percent/100);
                return iWidth;
            }
            else if (d == "D"){
                dWidth = (self.svgWidth)*(d_Percent/100);
                return dWidth;
            }
            else{
                return (self.svgWidth)*(r_Percent/100);
            }
        }).attr("x", function(d){
            if (d == "I"){
                return 0;
             }
             else if (d == "D"){
                return iWidth;
             }
             else{
                 return iWidth + dWidth;
             }
        }).attr("class", function(d){
            return self.chooseClass(d);
        }).on('mouseover', tip.show).on('mouseout', tip.hide);

    //Display the total percentage of votes won by each party
    //on top of the corresponding groups of bars.
    //HINT: Use the .votesPercentageText class to style your text elements;  Use this in combination with
    // chooseClass to get a color based on the party wherever necessary
    self.svg.selectAll("text").remove();
    self.svg.append("text").text(function(){
        if (i_Percent == 0){
            return "";
        }
        return (i_Percent + "%");
    }).attr("x", 0).attr("y", (self.svgHeight/2)-15).attr("class", "votesPercentageText").classed("independent", true);
    self.svg.append("text").text(d_Percent + "%").attr("x", function(){
        if (i_Percent < 10 && i_Percent!=0){
            return (iWidth + 20);
        }
        else{
            return iWidth;
        }
    }).attr("y", (self.svgHeight/2)-15).attr("class", "votesPercentageText").classed("democrat", true);
    self.svg.append("text").text(r_Percent + "%").attr("x", self.svgWidth).attr("y", (self.svgHeight/2)-15).attr("class", "votesPercentageText").classed("republican", true);

    let iNominee = electionResult[0].I_Nominee;
    let dNominee = electionResult[1].D_Nominee;
    let rNominee = electionResult[2].R_Nominee;
    self.svg.append("text").text(function(){
        if (i_Percent == 0){
            return "";
        }
        return (iNominee);
    }).attr("x", 0).attr("y", (self.svgHeight/2)-30).attr("class", "votesPercentageText").classed("independent", true);
    self.svg.append("text").text(dNominee).attr("x", function(){
        if (i_Percent < 15 && i_Percent != 0){
            return iWidth + 150;
        }
        return iWidth;
    }).attr("y", (self.svgHeight/2)-30).attr("class", "votesPercentageText").classed("democrat", true);
    self.svg.append("text").text(rNominee).attr("x", self.svgWidth).attr("y", (self.svgHeight/2)-30).attr("class", "votesPercentageText").classed("republican", true);

    //Display a bar with minimal width in the center of the bar chart to indicate the 50% mark
    //HINT: Use .middlePoint class to style this bar.
    self.svg.append("rect").attr("class", "middlePoint").attr("x", (self.svgWidth)/2).attr("y", ((self.svgHeight)/2)-5).attr("height", 30).attr("width", 1);
  
    //Just above this, display the text mentioning details about this mark on top of this bar
    //HINT: Use .votesPercentageNote class to style this text element
    self.svg.append("text").text("Popular Vote (50%)").attr("class", "votesPercentageNote")
    .attr("x", self.svgWidth/2).attr("y", (self.svgHeight/2)-50);
};
