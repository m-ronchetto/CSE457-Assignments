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

    let baseColor = "#0377FF";
    let selectedColor = "purple";
        
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
            formattedProbabilities[i] = keywords[i] + ": " + (parseInt((findTitle.probabilities[i])*1000)/10);
        }
        d3.select(".side-bar").selectAll("p").data(formattedProbabilities).enter().append("p");
        d3.select(".side-bar").selectAll("p").text(function(d){
             return d + "%";
        });
        d3.selectAll(".selected").style("fill", baseColor).style("stroke", baseColor).classed("selected", false);
        //Source: https://stackoverflow.com/questions/7627000/javascript-convert-string-to-safe-class-name-for-css
        //Javascript convert string to safe class name for css, posted 2011, visited October 23, 2021
        let selectorClassName = encodeURIComponent(title).toLowerCase().replace(/\.|%[0-9a-z]{2}/gi, "").replace("'", "");
        d3.selectAll("." + selectorClassName).style("fill", selectedColor).style("stroke", selectedColor).classed("selected", true);
        d3.selectAll("circle,polygon").sort(function(a,b) {
            console.log(a);
            if (a.title === b.title){
                return 0;
            }
            if (a.title === selectorClassName){
                return 1;
            }
            return -1;
        });
       
    });

    //Source: https://gist.github.com/nbremer/6506614 (below code + radar-chart.js/radar-chart.css modified by me to be compatible with d3 v6 and fit the goals of the visualization)  
    //D3.js - Radar Chart or Spider Chart - Adjusted from radar-chart-d3, posted September 2013, visited October 21, 2021

    var w = 500, h = 500;


    //Generating axes and values from data
    let d = [];
    for (let i=0; i<data.storydata.length; i++){
        let storyArray = []
        // https://stackoverflow.com/questions/7627000/javascript-convert-string-to-safe-class-name-for-css
        // Javascript convert string to safe class name for css, posted 2011, visited October 23, 2021
        let safeClassName = encodeURIComponent(data.storydata[i].title).toLowerCase().replace(/\.|%[0-9a-z]{2}/gi, "").replace("'", "");
        for (let j = 0; j < data.storydata[i].probabilities.length; j++){
            storyArray[j] = {"axis": data.topics[j], "value": data.storydata[i].probabilities[j], "title": safeClassName};
        }
        storyArray.title = safeClassName;
        d[i] = storyArray;
    }

    //Options for the Radar chart, other than default
    var mycfg = {
        w: w,
        h: h,
        maxValue: 0.6,
        levels: 6,
        ExtraWidthX: 300,
        color: baseColor
    }

    //Call function to draw the Radar chart
    //Will expect that data is in %'s
    RadarChart.draw("#chart", d, mycfg);

});