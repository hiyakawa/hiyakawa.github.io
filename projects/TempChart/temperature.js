"use strict";

let usMap;
let selectedState;
let temperature;
let precipitation;

window.onload = async function(){
    try{
        usMap = await d3.json("states-albers-10m.json") // read map
        temperature = await d3.json("temperature.json") // read temperature
        precipitation = await d3.json("precipitation.json") // read precipitation

        createMapVisualization();
        createLineChart();
        
        console.log("Map loaded")
    } catch (error) {
        console.error("Error loading JSON file:", error);
    }
};

// Create the map
function createMapVisualization(){
    const width = 1000;
    const height = 700; // Adjust the size to fit the mapDiv element
    
    const zoom = d3.zoom()
        .scaleExtent([1, 8])
        .on("zoom", zoomed);
    
    const svg = d3.select("#map") // Select the mapDiv's SVG element
        .attr("viewBox", [0, 0, width, height])
        .attr("width", "100%") // Adjust the width to fit the mapDiv
        .attr("height", "100%") // Adjust the height to fit the mapDiv
        .attr("style", "max-width: 100%; height: auto;")
        .on("click", reset);

    const path = d3.geoPath();

    // assign value
    const color = d3.scaleQuantize([50, 100], d3.schemeReds[5]);

    const g = svg.append("g")


    // Get the temperature data for the year 2023
    const temperature2023 = new Map(temperature.map(d => [d.state, d.data.find(item => item.year === "2023").temperature]));

    const states = g.append("g")
        // .attr("fill", "#444")
        .attr("stroke", "black") // Set the state border color to black
        .attr("cursor", "pointer")
        .selectAll("path")
        .data(topojson.feature(usMap, usMap.objects.states).features)
        .join("path")

        // visualize the temperature by states
        .attr("fill", d => {
            const stateName = d.properties.name;
            const stateData = temperature.find(d => d.state === stateName);
            if (stateData) {
                // const temperatureValue = stateData.data[0].temperature;
                const temperatureValue = temperature2023.get(stateName);
                return color(temperatureValue);
            } else {
              // State data not available in the temperature.json file
              return "gray";
            }
        })

        .on("click", clicked)
        .attr("d", path);
    
    states.append("title")
        .text(d => d.properties.name);
    
    g.append("path")
        .attr("fill", "none")
        .attr("stroke", "white")
        .attr("stroke-linejoin", "round")
        .attr("d", path(topojson.mesh(usMap, usMap.objects.states, (a, b) => a !== b)));
    
    svg.call(zoom);

    // Add the title for the chart
    svg.append("text")
        .attr("x", width / 2)
        .attr("y", 30)
        .attr("text-anchor", "middle")
        .attr("font-family", "Times New Roman")
        .style("font-size", "24px")
        .style("font-weight", "bold")
        .text("State Average Temperature June 2023");

    // Add the custom color legend to the SVG
    const legendHeight = 15;
    const legendWidth = 200;
    const legendMargin = { top: 20, right: 20 };
    const legendX = width - legendWidth - legendMargin.right;
    const legendY = legendMargin.top;

    const legendScale = d3.scaleLinear()
        .domain([50, 100])
        .range([0, legendWidth]);

    const legendAxis = d3.axisBottom(legendScale)
        .tickSize(legendHeight)
        .tickValues(d3.range(50, 101, 10)) // Set tick values from 50 to 100 with a step of 10
        .tickFormat(d3.format(".0f"));

    const legendG = svg.append("g")
        .attr("transform", `translate(${legendX}, ${legendY})`);

    legendG.selectAll("rect")
        .data(color.range().map(d => color.invertExtent(d)))
        .join("rect")
        .attr("height", legendHeight)
        .attr("x", d => legendScale(d[0]))
        .attr("width", d => legendScale(d[1]) - legendScale(d[0]))
        .attr("fill", d => color(d[0]));

    legendG.call(legendAxis);

    function reset() {
        states.transition().style("fill", null);
        svg.transition().duration(750).call(
            zoom.transform,
            d3.zoomIdentity,
            d3.zoomTransform(svg.node()).invert([width / 2, height / 2])
        );
        selectedState = null;

        // clear the line chart
        updateLineChart(null);
    }

    function clicked(event, d) {
        if(selectedState === d.properties.name){
            reset()
        }
        else{
            const [[x0, y0], [x1, y1]] = path.bounds(d);
            event.stopPropagation();
            states.transition().style("fill", null);
            d3.select(this).transition().style("fill", "powderblue");
            svg.transition().duration(750).call(
                zoom.transform,
                d3.zoomIdentity
                .translate(width / 2, height / 2)
                .scale(Math.min(8, 0.9 / Math.max((x1 - x0) / width, (y1 - y0) / height)))
                .translate(-(x0 + x1) / 2, -(y0 + y1) / 2),
                d3.pointer(event, svg.node())
            );
    
            selectedState = d.properties.name; // Update the global variable with the selected state
            updateLineChart(selectedState);
            
            console.log("Selected State:", selectedState);
            const temperatureValue = temperature2023.get(selectedState);
            console.log(temperatureValue)
        }
    }
    
    function zoomed(event) {
        const { transform } = event;
        g.attr("transform", transform);
        g.attr("stroke-width", 1 / transform.k);
    }

    document.addEventListener("DOMContentLoaded", function () {
        const mapDiv = document.getElementById("mapDiv");
        mapDiv.appendChild(svg.node());
    });
}

function createLineChart() {

    updateLineChart(selectedState);

    document.addEventListener("DOMContentLoaded", function () {
        const mapDiv = document.getElementById("barDiv");
        mapDiv.appendChild(svg.node());
    });
}

// create lines
function updateLineChart(selectedState) {
    // Declare the chart dimensions and margins.
    const width = 1000;
    const height = 700;
    const marginTop = 20;
    const marginRight = 60;
    const marginBottom = 60;
    const marginLeft = 40;

    // Select the SVG container.
    const svg = d3.select("#bar")
        .attr("width", "100%")
        .attr("height", "100%")
        .attr("viewBox", [0, 0, width, height])
        .attr("style", "max-width: 100%; height: auto;");
    
    svg.selectAll("*").remove();

    if(selectedState){
        // Filter the data for the selected state
        const selectedStateData = precipitation.filter(d => d.state === selectedState);
        const precipitationData = selectedStateData.length > 0 ? selectedStateData[0].data : [];
        const selectedStateData2 = temperature.filter(d => d.state === selectedState);
        const temperatureData = selectedStateData2.length > 0 ? selectedStateData2[0].data : [];
        
        // Generate the x axis scale
        const x = d3.scaleTime()
            .domain(d3.extent(precipitationData, d => new Date(d.year, 0, 1)))
            .range([marginLeft, width - marginRight]);


        // Find the maximum y-value across all states: set y-axis ticks
        const maxPrecipitation = d3.max(precipitation, d => d3.max(d.data, d => d.precipitation));
        const maxTemperature = d3.max(temperature, d => d3.max(d.data, d => d.temperature));

        const yPrecipitation = d3.scaleLinear()
            .domain([0,maxPrecipitation])
            .range([height - marginBottom, marginTop]);

        const yTemperature = d3.scaleLinear()
            .domain([0,maxTemperature])
            .range([height - marginBottom, marginTop]);

        // Generate Lines
        const linePrecipitation = d3.line()
            .x(d => x(new Date(d.year, 0, 1)))
            .y(d => yPrecipitation(d.precipitation));

        const lineTemperature = d3.line()
            .x(d => x(new Date(d.year, 0, 1)))
            .y(d => yTemperature(d.temperature));

        // Add the x-axis
        svg.append("g")
            .attr("transform", `translate(0,${height - marginBottom})`)
            .call(d3.axisBottom(x).ticks(d3.timeYear.every(5)).tickSizeOuter(0)); // Show ticks for every 5 years

        // Add the y-axis
        // -----------------------------Precipitation-----------------------------
        svg.append("g")
            .attr("transform", `translate(${marginLeft},0)`)
            .call(d3.axisLeft(yPrecipitation).ticks(10))
            .call(g => g.select(".domain").remove())
            .call(g =>
                g.selectAll(".tick line")
                .clone()
                .attr("x2", width - marginLeft - marginRight)
                .attr("stroke-opacity", 0.1)
            )
            .call(g =>
                g
                .append("text")
                .attr("x", -marginLeft)
                .attr("y", 10)
                .attr("fill", "currentColor")
                .attr("text-anchor", "start")
                .attr("font-family", "Times New Roman")
                .style("font-size", "14px")
                .style('fill', 'blue')
                .text("Precipitation (inches)")
            );

        // -----------------------------Temperature-----------------------------
        svg.append("g")
            .attr("transform", `translate(${width - marginRight},0)`) // Move the temperature y-axis to the right side
            .call(d3.axisRight(yTemperature).ticks(10))
            .call(g => g.select(".domain").remove())
            .call(g =>
                g.selectAll(".tick line")
                .clone()
                .attr("x2", marginLeft - width + marginRight)
                .attr("stroke-opacity", 0.1)
            )
            .call(g =>
                g
                .append("text")
                .attr("x", marginRight)
                .attr("y", 10)
                .attr("fill", "currentColor")
                .attr("text-anchor", "end")
                .attr("font-family", "Times New Roman")
                .style("font-size", "14px")
                .style('fill', 'red')
                .text("Temperature (F)")
            );

        // Append a path for the precipitation line
        svg.append("path")
            .attr("fill", "none")
            .attr("stroke", "steelblue")
            .attr("stroke-width", 1.5)
            .attr("d", linePrecipitation(precipitationData));

        // Append a path for the temperature line
        svg.append("path")
            .attr("fill", "none")
            .attr("stroke", "red")
            .attr("stroke-width", 1.5)
            .attr("d", lineTemperature(temperatureData));

        // Add the title for the chart
        svg.append("text")
            .attr("x", width / 2)
            .attr("y", 30)
            .attr("text-anchor", "middle")
            .attr("font-family", "Times New Roman")
            .style("font-size", "24px")
            .style("font-weight", "bold")
            .text('Precipitation/Temperature in ' + selectedState + ' 1895 - 2023');
    }
}
