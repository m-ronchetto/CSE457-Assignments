/**
 * Constructor for the TileChart
 */
function TileChart(){

    var self = this;
    self.init();
};

/**
 * Initializes the svg elements required to lay the tiles
 * and to populate the legend.
 */
TileChart.prototype.init = function(){
    var self = this;

    //Gets access to the div element created for this chart and legend element from HTML
    var divTileChart = d3.select("#tiles").classed("content", true);
    var legend = d3.select("#legend").classed("content",true);
    self.margin = {top: 30, right: 20, bottom: 30, left: 50};

    var svgBounds = divTileChart.node().getBoundingClientRect();
    self.svgWidth = svgBounds.width - self.margin.left - self.margin.right;
    self.svgHeight = self.svgWidth/2;
    var legendHeight = 150;

    //creates svg elements within the div
    self.legendSvg = legend.append("svg")
        .attr("width",self.svgWidth)
        .attr("height",legendHeight)
        .attr("transform", "translate(" + self.margin.left + ",0)")

    self.svg = divTileChart.append("svg")
                        .attr("width",self.svgWidth)
                        .attr("height",self.svgHeight)
                        .attr("transform", "translate(" + self.margin.left + ",0)")
                        .style("bgcolor","green")

};

/**
 * Returns the class that needs to be assigned to an element.
 *
 * @param party an ID for the party that is being referred to.
 */
TileChart.prototype.chooseClass = function (party) {
    var self = this;
    if (party == "R"){
        return "republican";
    }
    else if (party== "D"){
        return "democrat";
    }
    else if (party == "I"){
        return "independent";
    }
}

/**
 * Renders the HTML content for tool tip.
 *
 * @param tooltip_data information that needs to be populated in the tool tip
 * @return text HTML content for tool tip
 */
TileChart.prototype.tooltip_render = function (tooltip_data) {
    var self = this;
    var text = "<h2 class ="  + self.chooseClass(tooltip_data.winner) + " >" + tooltip_data.state + "</h2>";
    text +=  "Electoral Votes: " + tooltip_data.electoralVotes;
    text += "<ul>"
    tooltip_data.result.forEach(function(row){
        text += "<li class = " + self.chooseClass(row.party)+ ">" + row.nominee+":\t\t"+row.votecount+"("+row.percentage+"%)" + "</li>"
    });
    text += "</ul>";
    return text;
}

/**
 * Creates tiles and tool tip for each state, legend for encoding the color scale information.
 *
 * @param electionResult election data for the year selected
 * @param colorScale global quantile scale based on the winning margin between republicans and democrats
 */
TileChart.prototype.update = function(electionResult, colorScale){
    var self = this;

    //for reference:https://github.com/Caged/d3-tip
    //Use this tool tip element to handle any hover over the chart

    let iNominee = electionResult[0].I_Nominee;
    let dNominee = electionResult[1].D_Nominee;
    let rNominee = electionResult[2].R_Nominee;

    let tip = d3.tip().attr('class', 'd3-tip')
        .direction('se')
        .offset(function(event, d) {
            return [0,0];
        })
        .html(function(event, d) {
            // populate data in the following format
            let winner = "";
            if (d.D_Percentage>d.R_Percentage && d.D_Percentage>d.I_Percentage){
                winner = dNominee;
            }
            else if (d.R_Percentage>d.D_Percentage && d.R_Percentage>d.I_Percentage){
                winner = rNominee;
            }
            else{
                winner = iNominee;
            }
             tooltip_data = {
            "state": d.State,
            "winner": winner,
            "electoralVotes" : d.Total_EV,
            "result":[
                {"nominee": dNominee,"votecount": d.D_Votes,"percentage": d.D_Percentage,"party":"D"} ,
                {"nominee": rNominee,"votecount": d.R_Votes,"percentage": d.R_Percentage,"party":"R"} 
    
                ]};
                if (d.I_Votes != 0){
                    tooltip_data.result[2] = {"nominee": iNominee,"votecount": d.I_Votes,"percentage": d.I_Percentage,"party":"I"};
                }
             // pass this as an argument to the tooltip_render function then,
             // return the HTML content returned from that method.
            return self.tooltip_render(tooltip_data);
        });

    self.svg.call(tip);

    //Creates a legend element and assigns a scale that needs to be visualized
    self.legendSvg.append("g")
        .attr("class", "legendQuantile");

    var legendQuantile = d3.legendColor()
        .shapeWidth(120)
        .cells(10)
        .orient('horizontal')
        .scale(colorScale);

    // ******* TODO: PART IV *******
    //Tansform the legend element to appear in the center and make a call to this element for it to display.
    self.legendSvg.select("g").attr("transform", "scale(.65)").call(legendQuantile);

    //Lay rectangles corresponding to each state according to the 'row' and 'column' information in the data.
    self.svg.selectAll("g").remove();
    let group = self.svg.selectAll("g").data(electionResult).enter().append("g");
    group.append("rect").attr("width", self.svgWidth/12).attr("height", self.svgHeight/8)
        .attr("x", function(d){
            return d.xIndex *(self.svgWidth/12);
        }).attr("y", function(d){
            return d.yIndex * (self.svgHeight/8);
            //Use global color scale to color code the tiles.
            //HINT: Use .tile class to style your tiles
        }).attr("class","tile").attr("fill", function(d){
            if(d.I_Percentage > d.R_Percentage && d.I_Percentage > d.D_Percentage){
                return "#45AD6A";
                //independent color
            }
            return colorScale(d.R_Percentage - d.D_Percentage)
        }).on('mouseover', tip.show).on('mouseout', tip.hide);

    //Display the state abbreviation and number of electoral votes on each of these rectangles
    // .tilestext to style the text corresponding to tiles
    group.append("text").text(function(d){
        return d.Abbreviation;
    }).attr("x", function(d){
        return (d.xIndex *(self.svgWidth/12))+40;
    }).attr("y", function(d){
        return (d.yIndex * (self.svgHeight/8))+25;
    }).attr("class", "tilestext");

    group.append("text").text(function(d){
        return d.Total_EV;
    }).attr("x", function(d){
        return (d.xIndex *(self.svgWidth/12))+40;
    }).attr("y", function(d){
        return (d.yIndex * (self.svgHeight/8))+45;
    }).attr("class", "tilestext");

    //Call the tool tip on hover over the tiles to display stateName, count of electoral votes
    //then, vote percentage and number of votes won by each party.
    //HINT: Use the .republican, .democrat and .independent classes to style your elements.


};
