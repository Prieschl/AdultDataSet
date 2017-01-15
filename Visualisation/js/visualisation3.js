$(document).ready(function() {
    const margin = {top: 20, right: 90, bottom: 30, left: 100},
        width = 960 - margin.left - margin.right,
        height = 500 - margin.top - margin.bottom;

    const svg = d3.select('body').append('svg')
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    d3.csv("data/data.csv", function(error, rawData) {
        if (error) throw error;

        let agregatedData = d3.nest()
            .key(d => d.educationNum)
            .sortKeys((a,b) => a-b)
            .key(d => d.relationship)
            .rollup(v => d3.mean(v, d => d.hoursPerWeek))
            .entries(rawData);

        let data = [];
        agregatedData.forEach(ded => {
            ded.values.forEach(red => {
                data.push({educationNum:ded.key, relationship:red.key, hoursPerWeek:red.value});
            })
        });

        let x = d3.scaleBand().range([0, width]).paddingInner(0.01),
            y = d3.scaleBand().range([height, 0]).paddingInner(0.01),
            z = d3.scaleSequential(d3["interpolateYlOrRd"]);

        // Compute the scale domains.
        x.domain(data.map(d => d.educationNum));
        y.domain(data.map(d => d.relationship));
        z.domain([0, d3.max(data, d => d.hoursPerWeek)]);

        // Display the tiles for each non-zero bucket.
        // See http://bl.ocks.org/3074470 for an alternative implementation.
        svg.selectAll(".tile")
            .data(data)
            .enter().append("rect")
            .attr("class", "tile")
            .attr("x", d => x(d.educationNum))
            .attr("y", d =>  y(d.relationship))
            .attr("width", x.bandwidth())
            .attr("height", y.bandwidth())
            .style("fill", d => z(d.hoursPerWeek));

        // Add a legend for the color values.
        let legend = svg.selectAll(".legend")
            .data(z.ticks(6).slice(1).reverse())
            .enter().append("g")
            .attr("class", "legend")
            .attr("transform", (d, i) => "translate(" + (width + 20) + "," + (20 + i * 20) + ")");

        legend.append("rect")
            .attr("width", 20)
            .attr("height", 20)
            .style("fill", z);

        legend.append("text")
            .attr("x", 26)
            .attr("y", 10)
            .attr("dy", ".35em")
            .text(String);

        svg.append("text")
            .attr("class", "label")
            .attr("x", width + 20)
            .attr("y", 10)
            .attr("dy", ".35em")
            .text("Count");

        svg.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + height + ")")
            .call(d3.axisBottom().scale(x))

        svg.append("g")
            .attr("class", "y axis")
            .call(d3.axisLeft().scale(y));
    });
});
