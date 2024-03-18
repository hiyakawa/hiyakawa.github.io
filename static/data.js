let initialAttrs, remainingAttrs;

// fetch player data from the API
d3.json("/static/soccer_small.json")
    .then(function (data) {
        toDate(data);

        const attributes = Object.keys(data[0]);
        initialAttrs = ["Name", "Nationality", "National_Position", "Club", "Height", "Preffered_Foot"];
        remainingAttrs = attributes.filter(attr => !initialAttrs.includes(attr));

        createDropdown(data);
        createTable(data);
    })
    .catch(function (error) {
        console.error("Error fetching data:", error);
    });

function createDropdown(objs) {
    // get the dropdown container
    const tableContainer = d3.select("#table-container");
    // add a label for the dropdown
    tableContainer.append("label").text("Add attribute: ");

    const dropdownBtnAdd = tableContainer.append("select");
    dropdownBtnAdd
        .selectAll("option")
        .data(Object.keys(objs[0]))
        .enter()
        .append("option")
        .text(function (d) { return d; })
        .attr("value", function (d) { return d; });

    dropdownBtnAdd.on("change", function () {
        // get the selected attribute
        const selectedAttr = Array.from(this.selectedOptions, option => option.value);
        // combine initially selected columns with newly selected columns
        initialAttrs.push(selectedAttr.toString());
        // update remaining attributes
        const attributes = Object.keys(objs[0]);
        remainingAttrs = attributes.filter(attr => !initialAttrs.includes(attr));
        // update the table with selected columns
        createTable(objs);
    });

    // add a label for the dropdown
    tableContainer.append("label").text(" Remove attribute: ");

    const dropdownBtnDelete = tableContainer.append("select");
    dropdownBtnDelete
        .selectAll("option")
        .data(Object.keys(objs[0]))
        .enter()
        .append("option")
        .text(function (d) { return d; })
        .attr("value", function (d) { return d; });

    dropdownBtnDelete.on("change", function () {
        // get the selected attribute
        const selectedAttr = Array.from(this.selectedOptions, option => option.value);
        // combine remaining selected columns with newly selected columns
        remainingAttrs.push(selectedAttr.toString());
        // update selected attributes
        const attributes = Object.keys(objs[0]);
        initialAttrs = attributes.filter(attr => !remainingAttrs.includes(attr));
        // console.log(initialAttrs, remainingAttrs);
        // update the table with selected columns
        createTable(objs);
    });
}

function createTable(objs) {
    const tableContainer = d3.select("#table-container");

    // remove existing table
    tableContainer.selectAll("table").remove();

    // create the table structure
    const table = tableContainer.append("table")
                        .attr("class", "player-table");

    // extract only the selected columns from the player data
    const selectedData = objs.map(player => {
        const selectedValues = {};
        initialAttrs.forEach(column => {
            selectedValues[column] = player[column];
        });
        return selectedValues;
    });

    const thead = table.append("thead");
    const tbody = table.append("tbody");

    thead
        .append("tr")
        .selectAll("th")
            .data(d3.entries(selectedData[0]))
            .enter()
            .append("th")
            .on("click", function(d,i){
                createTableBody(d.key);
            })
            .text(function(d) {
                return d.key;
            });

    let sortInfo = {key: "Name", order: d3.descending};
    createTableBody("Name");

    function createTableBody(sortKey) {
        const tableContainer = d3.select("#table-container");
        try {
            if (sortInfo.order.toString() === d3.ascending.toString()) {
                sortInfo.order = d3.descending;
            }
            else {
                sortInfo.order = d3.ascending;
            }
            selectedData.sort(function (x, y) {
                return sortInfo.order(x[sortKey], y[sortKey])
            });

            // create the table body
            tbody
                .selectAll("tr")
                    .data(selectedData)
                    .enter()
                    .append("tr")
                .selectAll("td")
                    .data(function (d) {
                        return d3.entries(d);
                    })
                    .enter()
                    .append("td")
                    .text(function (d) {
                        return d.value;
                    });
            // update the table body
            tbody
                .selectAll("tr")
                    .data(selectedData)
                    .on("click", function (d) {
                        const selectedPlayer = d.Name;
                        const selectedNation = d.Nationality;
                        updateDotPlot(selectedPlayer, selectedNation);
                        // highlight the selected row
                        tbody.selectAll("tr").classed("selected", false);
                        d3.select(this).classed("selected", true);
                    })
                .selectAll("td")
                    .data(function (d) {
                        return d3.entries(d);
                    })
                    .text(function (d) {
                        return d.value;
                    });
        }
        catch (error) {
            console.error("Error creating table body:", error);
        }
    }
}

function toDate(objs) {
    for (let i = 0; i < objs.length; i++) {
        let obj = objs[i];

        // convert MM/DD/YYYY to YYYY/MM/DD to simplify sorting
        let temp1 = obj["Club_Joining"].toString();
        obj["Club_Joining"] = temp1.slice(6, 10) + "/" + temp1.slice(0, 5);

        let temp2 = obj["Birth_Date"].toString();
        obj["Birth_Date"] = temp2.slice(6, 10) + "/" + temp2.slice(0, 5);
    }
}

function updateDotPlot(selectedPlayer, selectedNation) {
    console.log(selectedPlayer);

    // remove existing name tag
    d3.select("#name-tag").remove();

    // select the corresponding dot in the dot plot
    d3.selectAll(".dot")
        .classed("selected", d => d.Name === selectedPlayer)
        .attr("fill", d => (d.Name === selectedPlayer) ? "coral" : "black")
        .attr("r", d => (d.Name === selectedPlayer) ? 5 : 2);

    d3.selectAll('.bar')
        .classed('selected', d => d.key === selectedNation)
        .attr('fill', d => (d.key === selectedNation) ? 'coral' : 'steelblue');
}