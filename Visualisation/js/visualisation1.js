$(document).ready(function() {
    const margin = {top: 40, bottom: 10, left: 120, right: 20};
    const width = 800 - margin.left - margin.right;
    const height = 600 - margin.top - margin.bottom;

    // Creates sources <svg> element
    const svg = d3.select('body').append('svg')
        .attr('width', width+margin.left+margin.right)
        .attr('height', height+margin.top+margin.bottom);

    // Group used to enforce margin
    const g = svg.append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`);

    // Scales setup
    const xscale = d3.scaleLinear().range([0, width]);
    const yscale = d3.scaleBand().rangeRound([0, height]).paddingInner(0.1);

    const xaxis = d3.axisTop().scale(xscale);
    const g_xaxis = g.append('g').attr('class','x axis');
    const yaxis = d3.axisLeft().scale(yscale);
    const g_yaxis = g.append('g').attr('class','y axis');

    d3.csv("data/data.csv", function(data) {
        console.log(data[0]);

        var groupedData = d3.nest()
            .key(function(d) { return d.educationNum})
            .rollup(function(v) { return d3.mean(v, function(d) { return d.hoursPerWeek; })})
            .sortKeys(function (a,b) { return a - b; })
            .entries(data);

        console.log(groupedData);
        update(groupedData);
    });

    function update(new_data) {
        //update the scales
        xscale.domain([0, d3.max(new_data, (d) => d.value)]);
        yscale.domain(new_data.map((d) => d.key));
        //render the axis
        g_xaxis.call(xaxis);
        g_yaxis.call(yaxis);

        // Render the chart with new data

        // DATA JOIN
        const rect = g.selectAll('rect').data(new_data);

        // ENTER
        // new elements
        const rect_enter = rect.enter().append('rect')
            .attr('x', 0)
        rect_enter.append('title');

        // ENTER + UPDATE
        // both old and new elements
        rect.merge(rect_enter)
            .attr('height', yscale.bandwidth())
            .attr('width', (d) => xscale(d.value))
            .attr('y', (d) => yscale(d.key));

        rect.merge(rect_enter).select('title').text((d) => d.key);

        // EXIT
        // elements that aren't associated with data
        rect.exit().remove();
    }
});
