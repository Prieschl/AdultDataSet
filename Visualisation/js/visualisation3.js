class Visualisation3 {
    constructor() {
        this.margin = {top: 20, right: 90, bottom: 60, left: 120};
        this.width = 700 - this.margin.left - this.margin.right;
        this.height = 400 - this.margin.top - this.margin.bottom;

        this.svg = d3.select('body').append('svg')
            .attr("width", this.width + this.margin.left + this.margin.right)
            .attr("height", this.height + this.margin.top + this.margin.bottom)
            .append("g")
            .attr("transform", "translate(" + this.margin.left + "," + this.margin.top + ")");

        this.x = d3.scaleBand().range([0, this.width]).paddingInner(0.01);
        this.y = d3.scaleBand().range([this.height, 0]).paddingInner(0.01);
        this.z = d3.scaleSequential(d3["interpolateYlOrRd"]);

        this.xaxis = d3.axisBottom().scale(this.x);
        this.g_xaxis = this.svg.append("g")
            .attr("class", "x axis")
            .attr("transform", `translate(0, ${this.height})`);
        this.yaxis = d3.axisLeft().scale(this.y);
        this.g_yaxis = this.svg.append("g")
            .attr("class", "y axis");

        this.addLabels();
    }

    addLabels() {
        this.svg.append("text")
            .attr("class", "label")
            .attr("x", this.width + 20)
            .attr("y", 10)
            .attr("dy", ".35em")
            .text("h / week");

        // Add the text label for the x axis
        this.svg.append("text")
            .attr("transform", `translate(${this.width / 2}, ${this.height + this.margin.top + 20})`)
            .style("text-anchor", "middle")
            .text("Education Level");

        // Add the text label for the Y axis
        this.svg.append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", -120)
            .attr("x", 0 - (this.height / 2) - this.margin.top / 2)
            .attr("dy", "1em")
            .style("text-anchor", "middle")
            .text("Relationship");
    }

    processData(rawData) {
        let agregatedData = d3.nest()
            .key(d => d.educationNum)
            .sortKeys((a, b) => a - b)
            .key(d => d.relationship)
            .rollup(v => d3.mean(v, d => d.hoursPerWeek))
            .entries(rawData);

        let data = [];
        agregatedData.forEach(d1 => {
            d1.values.forEach(d2 => {
                data.push({educationNum: d1.key, relationship: d2.key, hoursPerWeek: d2.value});
            })
        });
        this.updateDiagram(data);
    }

    updateDiagram(data) {
        // Compute the scale domains.
        this.x.domain(data.map(d => d.educationNum));
        this.y.domain(data.map(d => d.relationship));
        this.z.domain([0, d3.max(data, d => d.hoursPerWeek)]);

        this.g_xaxis.call(this.xaxis);
        this.g_yaxis.call(this.yaxis);

        // DATA JOIN
        let rect = this.svg.selectAll('.tile').data(data);

        let rect_enter = rect.enter().append('rect');
        rect.merge(rect_enter)
            .attr("class", "tile")
            .attr("x", d => this.x(d.educationNum))
            .attr("y", d => this.y(d.relationship))
            .attr("width", this.x.bandwidth())
            .attr("height", this.y.bandwidth())
            .style("fill", d => this.z(d.hoursPerWeek));

        // Add a legend for the color values.
        let legend = this.svg.selectAll(".legend")
            .data(this.z.ticks(6).slice(1).reverse())
            .enter().append("g")
            .attr("class", "legend")
            .attr("transform", (d, i) => "translate(" + (this.width + 20) + "," + (20 + i * 20) + ")");
        legend.append("rect")
            .attr("width", 20)
            .attr("height", 20)
            .style("fill", this.z);
        legend.append("text")
            .attr("x", 26)
            .attr("y", 10)
            .attr("dy", ".35em")
            .text(String);

        rect.exit().remove();
    }
}