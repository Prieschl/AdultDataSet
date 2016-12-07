$(document).ready(function() {
    const axisMargin = 20;
    const margin = {top: 40 + axisMargin, bottom: 10, left: 120 + axisMargin, right: 20};
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

    const educationBorder = 13;

    let data;
    let viewDetails = false;
    let detailsHighLow = false;

    d3.csv("data/data.csv", (d) => {
        data = d;
        processData();
    });

    function updateDiagram(new_data) {
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
        rect.merge(rect_enter).transition()
            .attr('height', yscale.bandwidth())
            .attr('width', (d) => xscale(d.value))
            .attr('y', (d) => yscale(d.key));

        rect.merge(rect_enter).select('title').text((d) => d.key);

        rect.merge(rect_enter).on('click', (a,b) => switchView(a, b));

        // Add the text label for the x axis
        svg.append("text")
            .attr("transform", "translate(" + (width / 2 + margin.left) + " ," + (margin.bottom + axisMargin) + ")")
            .style("text-anchor", "middle")
            .text("h / week");

        // Add the text label for the Y axis
        svg.append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", 0)
            .attr("x",0 - (height / 2) - margin.top /2)
            .attr("dy", "1em")
            .style("text-anchor", "middle")
            .text("Education level");

        // EXIT
        // elements that aren't associated with data
        rect.exit().remove();
    }

    function switchView(a, b) {
        viewDetails = !viewDetails;
        detailsHighLow = b > 0;
        processData();
    }

    function processData() {
        let groupedData;
        if(viewDetails) {
            groupedData = data.filter(d => {
                if(detailsHighLow) {
                    return d.educationNum >= educationBorder;
                } else {
                    return d.educationNum < educationBorder;
                }
            });
            groupedData = d3.nest()
                .key(d => d.educationNum)
                .rollup(v => d3.mean(v, d => d.hoursPerWeek) )
                .sortKeys( (a,b)=> a - b)
                .entries(groupedData);
        } else {
            groupedData = d3.nest()
                .key(d => d.educationNum >= educationBorder ? "High Education" : "Low Education")
                .rollup(v => d3.mean(v, d => d.hoursPerWeek))
                .sortKeys( (a,b)=> a < b)
                .entries(data);
        }
        updateDiagram(groupedData);
    }

});
