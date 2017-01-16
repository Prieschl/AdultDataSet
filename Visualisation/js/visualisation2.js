$(document).ready(function() {
    const margin = {
        top: 20,
        right: 20,
        bottom: 50,
        left: 60
    };
    const width = 1000;
    const height =  600;

    // Creates sources <svg> element
    const svg = d3.select('body').append('svg')
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom)
        .append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`);
    const xScale = d3.scaleLinear()
        .range([0, width]);
    const yScale = d3.scaleLinear()
        .range([height, 0]);

    d3.csv("data/data.csv", d => {
        processData(d);
    });

    function processData(new_data) {
        // Group the age by 5 year intervals
        // Group all kinds of married to one
        // Calculate number of related entries
        let dataGroup = d3.nest()
            .key(d => {
                if(d.maritalStatus.startsWith("Married")){
                    return "Married";
                } else {
                 return d.maritalStatus;
                }
            })
            .key(d => (+d.age + 3) - (+d.age + 3) % 5)
            .rollup(v => v.length)
            .entries(new_data);
        let data = [];
        dataGroup.forEach(d1 => {
            d1.values.forEach(d2 => {
                data.push({maritalStatus:d1.key, age:d2.key, count:d2.value});
            })
        });
        updateDiagram(data);
    }

    function updateDiagram(data) {
        // Scale the range of the data
        xScale.domain([d3.min(data, d => d.age),
            d3.max(data, d => d.age)]);
        yScale.domain([0,
            d3.max(data, d => d.count)]);

        let lineGen = d3.line()
            .x( d => xScale(d.age))
            .y( d => yScale(d.count))
            .curve(d3.curveBasis);
        let colors = ["#3366cc", "#dc3912", "#ff9900", "#109618", "#990099", "#0099c6", "#dd4477", "#66aa00", "#b82e2e", "#316395", "#994499", "#22aa99", "#aaaa11", "#6633cc", "#e67300", "#8b0707", "#651067", "#329262", "#5574a6", "#3b3eac"];
        let maritalStatusSet = new Set(data.map(d => d.maritalStatus));
        let vSpace = 20;
        svg.append("text")
            .attr("x", width - 150)
            .attr("y", 0)
            .style("fill", "black")
            .style("font-size", 25)
            .text("Legend:");
        Array.from(maritalStatusSet).forEach((d, i) => {
            let mData = data.filter(da => da.maritalStatus == d).sort((a,b) => a.age - b.age);
            svg.append('path')
                .data([mData])
                .attr('class', 'line')
                .attr('d', lineGen)
                .attr('stroke', (d, j) => colors[i] )
                .attr('stroke-width', 2)
                .attr('fill', "none");
            svg.append("text")
                .attr("x", width - 150)
                .attr("y", (i+1.5) * vSpace)
                .style("fill", colors[i])
                .text(d);
        });

        // Add the text label for the x axis
        svg.append("text")
            .attr("transform", `translate(${width/2}, ${height + margin.top + 20})`)
            .style("text-anchor", "middle")
            .text("Age");

        // Add the text label for the Y axis
        svg.append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", - 60)
            .attr("x",0 - (height / 2) - margin.top /2)
            .attr("dy", "1em")
            .style("text-anchor", "middle")
            .text("Count People");

        svg.append("g")
            .attr("class", "y axis")
            .call(d3.axisLeft().scale(yScale));
        svg.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + height + ")")
            .call(d3.axisBottom().scale(xScale));
    }
});
