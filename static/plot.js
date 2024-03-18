window.onload = async function() {
    try {
        const data = await d3.json("/static/soccer_small.json");
        toNumber(data);

        createBarDropdown(data);
        createBarPlot(data, "Nationality");
        createDotPlot(data, "Nationality", "National_Kit");
    } catch (error) {
        console.error("Error loading JSON file:", error);
    }
};

function createBarDropdown(data) {
    const attrs = getAttrs(data);

    const dropdownContainer = d3.select("#bar-dropdown-container");
    // add a label for the dropdown
    dropdownContainer.append("label").text("X Axis ");

    const dropdownBtn = dropdownContainer.append("select");
    dropdownBtn
        .selectAll("option")
        .data(attrs)
        .enter()
        .append("option")
        .text(function (d) { return d; })
        .attr("value", function (d) { return d; });

    dropdownBtn.on("change", function () {
        const selectedOption = d3.select(this).property("value");
        createBarPlot(data, selectedOption);
    });

    dropdownContainer.append("label").text(" Y Axis: # of Players");
}

function createBarPlot(data, curAttr) {
    // remove existing plot if any
    const barPlotContainer = d3.select("#bar-plot-container");
    d3.select("#bar-plot-container").selectAll("*").remove();

    // set the dimensions and margins of the graph
    const margin = {top: 30, right: 30, bottom: 70, left: 60},
          width = 800 - margin.left - margin.right,
          height = 400 - margin.top - margin.bottom;

    // set up the SVG container
    const svgContainer = barPlotContainer.append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
        .append("g")
            .attr("transform",
                  "translate(" + margin.left + "," + margin.top + ")");

    // group by given attribute and count distribution
    let groupedData = d3.nest()
        .key(function (d) {return d[curAttr];})
        .rollup(function (values) {return values.length;})
        .entries(data);

    // sort the data by key
    groupedData.sort(function (a, b) {
        return parseFloat(a.key) - parseFloat(b.key);
    });

    // set up the scales
    let xScale = d3.scaleBand()
        .domain(groupedData.map(d => d.key))
        .rangeRound([0, width])
        .padding(0.1);

    let yScale = d3.scaleLinear()
        .domain([0, d3.max(groupedData, d => d.value)])
        .rangeRound([height, 0]);

    svgContainer.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(xScale))
        .selectAll("text")
            .attr("transform", "translate(-10,0)rotate(-45)")
            .style("text-anchor", "end");

    svgContainer.append("g")
        .call(d3.axisLeft(yScale));

    // create the bars
    svgContainer.selectAll(".bar")
        .data(groupedData)
        .enter()
        .append("rect")
        .attr("class", "bar")
        .attr("x", d => xScale(d.key))
        .attr("y", d => yScale(d.value))
        .attr("width", xScale.bandwidth())
        .attr("height", d => height - yScale(d.value));
}

function createDotPlot(data, xAttr, yAttr) {
    // sort the data by xAttr
    data.sort(function (a, b) {
        return parseFloat(a[xAttr]) - parseFloat(b[xAttr]);
    });

    // set the dimensions and margins of the graph
    const margin = {top: 30, right: 30, bottom: 70, left: 60},
        width = 800 - margin.left - margin.right,
        height = 400 - margin.top - margin.bottom;

    // set up the SVG container
    let svgContainer = d3.select("#dot-plot-container").append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
        .append("g")
            .attr("transform",
                  "translate(" + margin.left + "," + margin.top + ")");

    // set up scales
    let xScale = d3.scaleBand()
        .domain(data.map(d => d[xAttr]))
        .rangeRound([0, width])
        .padding(0.1);

    let yScale = d3.scaleLinear()
        .domain([d3.min(data, d => d[yAttr]), d3.max(data, d => d[yAttr])])
        .rangeRound([height, 0]);

    // create grid lines for the y-axis
    svgContainer.append("g")
        .attr("class", "grid-lines")
        .call(d3.axisLeft(yScale)
            .tickSize(-800) // adjust the size of the grid lines
            .tickFormat("")
        )
        .selectAll("line")
            .attr("stroke", "lightgray");

    // create dots
    svgContainer.selectAll(".dot")
        .data(data)
        .enter()
        .append("circle")
        .attr("class", "dot")
        .attr("cx", d => xScale(d[xAttr]) + xScale.bandwidth() / 2)
        .attr("cy", d => yScale(d[yAttr]))
        .attr("r", 2) // radius of the dots

    // add x-axis
    svgContainer.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(xScale))
        .selectAll("text")
            .attr("transform", "translate(-10,0)rotate(-45)")
            .style("text-anchor", "end");

    // add y-axis
    svgContainer.append("g")
        .call(d3.axisLeft(yScale));

    // dropdown buttons
    const attrs = getAttrs(data);
    const numericAttrs = [
        "National_Kit", "Club_Kit", "Rating", "Height", "Weight", "Age", "Weak_foot", "Skill_Moves", "Ball_Control", "Dribbling", "Marking", "Sliding_Tackle", "Standing_Tackle", "Aggression", "Reactions", "Attacking_Position", "Interceptions", "Vision", "Composure", "Crossing", "Short_Pass", "Long_Pass", "Acceleration", "Speed", "Stamina", "Strength", "Balance", "Agility", "Jumping", "Heading", "Shot_Power", "Finishing", "Long_Shots", "Curve", "Freekick_Accuracy", "Penalties", "Volleys", "GK_Positioning", "GK_Diving", "GK_Kicking", "GK_Handling", "GK_Reflexes"]

    const dotDropdownContainer = d3.select("#dot-dropdown-container");
    // add a label for the dropdown
    dotDropdownContainer.append("label").text("X Axis ");
    const xAxisDropdownBtn = dotDropdownContainer.append("select");

    xAxisDropdownBtn
        .selectAll("option")
        .data(attrs)
        .enter()
        .append("option")
        .text(function (d) { return d; })
        .attr("value", function (d) { return d; });

    dotDropdownContainer.append("label").text(" Y Axis ");
    const yAxisDropdownBtn = dotDropdownContainer.append("select");

    yAxisDropdownBtn
        .selectAll("option")
        .data(numericAttrs)
        .enter()
        .append("option")
        .text(function (d) { return d; })
        .attr("value", function (d) { return d; });

    xAxisDropdownBtn.on("change", function () {
        xAttr = d3.select(this).property("value");
        updateDotPlot(xAttr, yAttr);
    });

    yAxisDropdownBtn.on("change", function () {
        yAttr = d3.select(this).property("value");
        updateDotPlot(xAttr, yAttr);
    });

    function updateDotPlot(xAttr, yAttr) {
        // remove existing plot if any
        d3.select("#dot-plot-container").selectAll("*").remove();

        // sort the data by xAttr
        data.sort(function (a, b) {
            return parseInt(a[xAttr]) - parseInt(b[xAttr]);
        });

        // set up the SVG container
        svgContainer = d3.select("#dot-plot-container")
            .append("svg")
                .attr("width", width + margin.left + margin.right)
                .attr("height", height + margin.top + margin.bottom)
            .append("g")
                .attr("transform",
                      "translate(" + margin.left + "," + margin.top + ")");

        // set up scales
        let xScale = d3.scaleBand()
            .domain(data.map(d => d[xAttr]))
            .rangeRound([0, width])
            .padding(0.1);

        let yScale = d3.scaleLinear()
            .domain([d3.min(data, d => d[yAttr]), d3.max(data, d => d[yAttr])])
            .rangeRound([height, 0]);

        // create grid lines for the y-axis
        svgContainer.append("g")
            .attr("class", "grid-lines")
            .call(d3.axisLeft(yScale)
                .tickSize(-800) // adjust the size of the grid lines
                .tickFormat("")
            )
            .selectAll("line")
                .attr("stroke", "lightgray");

        // create dots
        svgContainer.selectAll(".dot")
            .data(data)
            .enter()
            .append("circle")
            .attr("class", "dot")
            .attr("cx", d => xScale(d[xAttr]) + xScale.bandwidth() / 2)
            .attr("cy", d => yScale(d[yAttr]))
            .attr("r", 2);

        // add x-axis
        svgContainer.append("g")
            .attr("transform", "translate(0," + height + ")")
            .call(d3.axisBottom(xScale))
            .selectAll("text")
                .attr("transform", "translate(-10,0)rotate(-45)")
                .style("text-anchor", "end");

        // add y-axis
        svgContainer.append("g")
            .call(d3.axisLeft(yScale));
    }
}

function getAttrs(data) {
    // get all the attributes but Name
    let attrs = Object.keys(data[0]);
    attrs.splice(0, 1);

    return attrs;
}

function toNumber(objs) {
    for (let i = 0; i < objs.length; i++) {
        let obj = objs[i];

        // convert weight and height to numeric values
        let temp1 = obj["Height"].toString();
        obj["Height"] = temp1.slice(0, -3);

        let temp2 = obj["Weight"].toString();
        obj["Weight"] = temp2.slice(0, -3);
    }
}