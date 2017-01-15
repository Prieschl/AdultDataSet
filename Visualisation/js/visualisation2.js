$(document).ready(function() {
    const legendHeight = 50;
    const margin = {
        top: 20,
        right: 20,
        bottom: 20,
        left: 50
    };
    const width = 1000;
    const height =  600;


    // Creates sources <svg> element
    const svg = d3.select('body').append('svg')
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom + legendHeight);
    const g = svg.append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`);

    const xScale = d3.scaleLinear()
        .range([margin.left, width - margin.right]);
    const yScale = d3.scaleLinear()
        .range([height - margin.top, margin.bottom]);

    const xaxis = d3.axisBottom()
        .scale(xScale);
    const g_xaxis = svg.append('g')
        .attr("transform", `translate(${margin.left}, ${height})`)
        .attr('class','x axis');
    const yaxis = d3.axisLeft()
        .scale(yScale);
    const g_yaxis = svg.append('g')
        .attr("transform", `translate(${margin.left*2}, ${margin.top})`)
        .attr('class','y axis');

    d3.csv("data/data.csv", d => {
        processData(d);
    });

    function processData(data) {
        let dataGroup = d3.nest()
            .key(d => d.maritalStatus)
            .key(d => d.age)
            .rollup(v => v.length)
            .entries(data);
        console.log(dataGroup);
        updateDiagram(dataGroup);
    }

    function updateDiagram(dataGroup) {
        // Scale the range of the data
        xScale.domain([d3.min(dataGroup, d => d3.min(d.values, d => d.key)),
            d3.max(dataGroup, d => d3.max(d.values, d => d.key))]);
        yScale.domain([d3.min(dataGroup, d => d3.min(d.values, d => d.value)),
            Math.round(d3.max(dataGroup, d => d3.max(d.values, d => d.value)))]);

        //render the axis
        g_xaxis.call(xaxis);
        g_yaxis.call(yaxis);

        let lineGen = d3.line()
            .x( d => xScale(d.key))
            .y( d => yScale(d.value))
            .curve(d3.curveBasis);
        let colors = ["#3366cc", "#dc3912", "#ff9900", "#109618", "#990099", "#0099c6", "#dd4477", "#66aa00", "#b82e2e", "#316395", "#994499", "#22aa99", "#aaaa11", "#6633cc", "#e67300", "#8b0707", "#651067", "#329262", "#5574a6", "#3b3eac"];
        let lSpace = width/dataGroup.length;
        g.append("text")
            .attr("x", (lSpace / 2))
            .attr("y", height + 20)
            .style("fill", "black")
            .text("Legend:");
        dataGroup.forEach((d, i) => {
            let data = d.values.sort((a,b) => a.key - b.key);
            g.append('path')
                .data([data])
                .attr('class', 'line')
                .attr('d', lineGen)
                .attr('stroke', (d, j) => colors[i] )
                .attr('stroke-width', 2)
                .attr('fill', "none");
            // 3 is Married-spouse-absent that is too long, so it is placed more left
            g.append("text")
                .attr("x", (lSpace / 2) + i * lSpace - (i===3 ? 50 : 0))
                .attr("y", height + 40)
                .style("fill", colors[i])
                .text(d.key);
        });
    }
});
