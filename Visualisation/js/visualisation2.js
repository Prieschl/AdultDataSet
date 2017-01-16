class Visualisation2 {
    constructor() {
        this.margin = {top: 60, right: 120, bottom: 50, left: 60};
        this.width = 580 - this.margin.left - this.margin.right;
        this.height = 400 - this.margin.top - this.margin.bottom;
        this.legendMargin = 10;

        this.svg = d3.select('body').append('svg')
                .attr('width', this.width + this.margin.left + this.margin.right)
                .attr('height', this.height + this.margin.top + this.margin.bottom)
                .append('g')
                .attr('transform', `translate(${this.margin.left},${this.margin.top})`);
        this.xScale = d3.scaleLinear()
                .range([0, this.width]);
        this.yScale = d3.scaleLinear()
                .range([this.height, 0]);

        this.xaxis = d3.axisBottom().scale(this.xScale);
        this.g_xaxis = this.svg.append("g")
            .attr("class", "x axis")
            .attr("transform", `translate(0, ${this.height})`);
        this.yaxis = d3.axisLeft().scale(this.yScale).tickFormat(d3.format(".0%"));
        this.g_yaxis = this.svg.append("g")
            .attr("class", "y axis");

        this.addLabels();
    }

    addLabels() {
        this.svg.append("text")
            .attr("transform", `translate(${this.width / 2 }, -40)`)
            .style("text-anchor", "middle")
            .text("Marital Status vs Age");

        // Add the text label for the x axis
        this.svg.append("text")
            .attr("transform", `translate(${this.width / 2}, ${this.height + 40})`)
            .style("text-anchor", "middle")
            .text("Age");

        // Add the text label for the Y axis
        this.svg.append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", -60)
            .attr("x", 0 - (this.height / 2) - this.margin.top / 2)
            .attr("dy", "1em")
            .style("text-anchor", "middle")
            .text("Count People");

        this.svg.append("text")
            .attr("x", this.width + this.legendMargin)
            .attr("y", 0)
            .style("fill", "black")
            .style("font-size", 20)
            .text("Legend:");
    }

    processData(new_data) {
        // Group the age by 5 year intervals
        // Group all kinds of married to one
        // Calculate number of related entries
        let dataGroup = d3.nest()
            .key(d => {
                if (d.maritalStatus.startsWith("Married")) {
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
                data.push({maritalStatus: d1.key, age: d2.key, count: d2.value});
            })
        });

        let maritalStatusArray = Array.from(new Set(data.map(d => d.maritalStatus)));
        let ageArray = Array.from(new Set(data.map(d => d.age)));
        let relativeData = [];
        ageArray.forEach(age => {
            let ageInstances = data.filter(d => d.age == age);
            let sumAge = d3.sum(ageInstances, d => d.count);
            maritalStatusArray.forEach(maritalStatus => {
                let instances = ageInstances.filter(d => d.maritalStatus == maritalStatus);
                let sum = d3.sum(instances, d => d.count);
                relativeData.push({maritalStatus: maritalStatus, age: age, portion: sum / sumAge})
            });
        });


        this.updateDiagram(relativeData);
    }

    updateDiagram(data) {
        // Remove old paths
        this.svg.selectAll('path').remove();
        this.svg.selectAll(".legendEntry").remove();


        // Scale the range of the data
        this.xScale.domain([d3.min(data, d => d.age),
            d3.max(data, d => d.age)]);
        this.yScale.domain([0,
            d3.max(data, d => d.portion)]);

        this.g_xaxis.call(this.xaxis);
        this.g_yaxis.call(this.yaxis);

        let lineGen = d3.line()
            .x(d => this.xScale(d.age))
            .y(d => this.yScale(d.portion))
            .curve(d3.curveBasis);
        let colors = ["#3366cc", "#dc3912", "#ff9900", "#109618", "#990099", "#0099c6", "#dd4477", "#66aa00", "#b82e2e", "#316395", "#994499", "#22aa99", "#aaaa11", "#6633cc", "#e67300", "#8b0707", "#651067", "#329262", "#5574a6", "#3b3eac"];
        let maritalStatusSet = new Set(data.map(d => d.maritalStatus));
        let martialStatusArray = Array.from(maritalStatusSet).sort();
        let vSpace = 18;

        martialStatusArray.forEach((d, i) => {
            let mData = data.filter(da => da.maritalStatus == d).sort((a, b) => a.age - b.age);
            this.svg.append('path')
                .data([mData])
                .attr('class', 'line')
                .attr('d', lineGen)
                .attr('stroke', (d, j) => colors[i])
                .attr('stroke-width', 2)
                .attr('fill', "none");
            this.svg.append("text")
                .attr("class", "legendEntry")
                .attr("x", this.width + this.legendMargin)
                .attr("y", (i + 1.5) * vSpace)
                .style("fill", colors[i])
                .text(d);
        });
    }
}
