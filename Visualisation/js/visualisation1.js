class Visualisation1 {
    constructor() {
        this.margin = {top: 50, bottom: 50, left: 120, right: 20};
        this.width = 450;
        this.height = 300;

        // Creates sources <svg> element
        this.svg = d3.select('body').append('svg')
            .attr('width', this.width + this.margin.left + this.margin.right)
            .attr('height', this.height + this.margin.top + this.margin.bottom);

        // Group used to enforce margin
        this.g = this.svg.append('g')
            .attr('transform', `translate(${this.margin.left},${this.margin.top})`);

        // Scales setup
        this.xscale = d3.scaleLinear().range([0, this.width]);
        this.yscale = d3.scaleBand().rangeRound([0, this.height]).paddingInner(0.1);

        this.xaxis = d3.axisBottom().scale(this.xscale).tickFormat(d3.format(".0%"));
        this.g_xaxis = this.g.append('g').attr('class', 'x axis')
            .attr("transform", `translate(0, ${this.height})`);
        this.yaxis = d3.axisLeft().scale(this.yscale);
        this.g_yaxis = this.g.append('g').attr('class', 'y axis');

        this.educationBorder = 13;

        this.viewDetails = false;
        this.detailsHighLow = false;

        this.addLabels();

        this.vis2 = new Visualisation2();
        this.vis3 = new Visualisation3();

        d3.csv("data/data.csv", d => {
            this.origData = d;
            this.filterData();
        });
    }

    addLabels() {
        this.svg.append("text")
            .attr("transform", `translate(${this.width / 2 + this.margin.left}, ${this.margin.top/2})`)
            .style("text-anchor", "middle")
            .text("Education vs Percentage with income > 50.000$ / year");

        // Add the text label for the x axis
        this.svg.append("text")
            .attr("transform", `translate(${this.width / 2 + this.margin.left}, ${this.height + this.margin.top + 40})`)
            .style("text-anchor", "middle")
            .text("people with income > 50.000$");

        // Add the text label for the Y axis
        this.svg.append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", 0)
            .attr("x", 0 - (this.height / 2) - this.margin.top / 2)
            .attr("dy", "1em")
            .style("text-anchor", "middle")
            .text("Education level");
    }

    updateDiagram(new_data) {
        //update the scales
        this.xscale.domain([0, d3.max(new_data, d => d.value)]);
        this.yscale.domain(new_data.map(d => d.key));
        //render the axis
        this.g_xaxis.call(this.xaxis);
        this.g_yaxis.call(this.yaxis);

        // Render the chart with new data

        // DATA JOIN
        const rect = this.g.selectAll('rect').data(new_data);

        // ENTER
        // new elements
        const rect_enter = rect.enter().append('rect')
            .attr('x', 0);
        rect_enter.append('title');

        // ENTER + UPDATE
        // both old and new elements
        rect.merge(rect_enter).transition()
            .attr('height', this.yscale.bandwidth())
            .attr('width', d => this.xscale(d.value))
            .attr('y', d => this.yscale(d.key));

        rect.merge(rect_enter).select('title').text(d => d3.format(".2%")(d.value));

        rect.merge(rect_enter).on('click', (a, b) => this.switchView(b));

        // EXIT
        // elements that aren't associated with data
        rect.exit().remove();
    }

    switchView(b) {
        this.viewDetails = !this.viewDetails;
        this.detailsHighLow = b > 0;
        this.filterData(this.origData);
    }

    filterData() {
        let filteredData = this.origData;
        if (this.viewDetails) {
            filteredData = filteredData.filter(d => {
                if (this.detailsHighLow) {
                    return d.educationNum >= this.educationBorder;
                } else {
                    return d.educationNum < this.educationBorder;
                }
            });
        }

        this.processData(filteredData);
        this.vis2.processData(filteredData);
        this.vis3.processData(filteredData);
    }

    processData(data) {
        let groupedData;
        if (this.viewDetails) {
            groupedData = d3.nest()
                .key(d => d.educationNum)
                .rollup(v => d3.mean(v, d => d.income))
                .sortKeys((a, b) => a - b)
                .entries(data);
        } else {
            groupedData = d3.nest()
                .key(d => d.educationNum >= this.educationBorder ? `High (>=${this.educationBorder})` : `Low (<${this.educationBorder})`)
                .rollup(v => d3.mean(v, d => d.income))
                .sortKeys((a, b) => a < b)
                .entries(data);
        }
        this.updateDiagram(groupedData);
    }
}

$(document).ready(() => {
    new Visualisation1();
});
