let width = 800, height = 800;

let svg = d3.select("svg")
    .attr("viewBox", "0 0 " + width + " " + height)

// Load external data
Promise.all([d3.json("https://chi-loong.github.io/CSC3007/assignments/links-sample.json"), d3.json("https://chi-loong.github.io/CSC3007/assignments/cases-sample.json")]).then(data => {
    console.log(data[0]); //links
    console.log(data[1]); //cases

// Data preprocessing
    data[0].forEach(e => {
        e.source = e.infector;
        e.target = e.infectee;
    });

    let colorScale = d3.scaleOrdinal()
    .domain([0,1])
    .range(["pink","lightblue"]);

    // Initialize the links
    let linkpath = svg.append("g")
    .attr("id", "links")
    .selectAll("path")
    .data(data[0])
    .enter()
    .append("path")
    .attr("fill", "none")
    .attr("stroke", "black");

    var tooltip=d3.select(".tooltip").append("div")
    .classed("tooltip", true)
    .style("opacity", 0)

    // Initialize the nodes
    let node = svg
    .selectAll("circle")
    .data(data[1])
    .enter()
    .append("circle")
    .attr("r", 20)
    .style("fill", d => colorScale(d.gender))
    .on("mouseover", function (event,d) {
        tooltip.transition()
                .duration(100)
                .style("visibility", "visible")
                .style("opacity", 1)
                .style("position", "absolute")
                .style("background-color","#F8F0E3")
        
        tooltip.html("ID: " + d.id + " is working as " + d.occupation + " at "+ d.organization)
                .style("left", (event.pageX) + "px")
                .style("top", (event.pageY) + "px");
    })
    .on("mouseout", function (event,d) {
        tooltip.transition()
            .duration(100)
            .style("visibility", "hidden")
            .style("opacity", 0)
    })
    .call(d3.drag()
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended));

    // Let's list the force we wanna apply on the network
    let simulation = d3.forceSimulation()                 // Force algorithm is applied to data.nodes
        .nodes(data[1])
        .force("x", d3.forceX().strength(0.1).x( width /2))
        .force("y", d3.forceY().strength(0.1).y( height /2 ))
        .force("link", d3.forceLink()                               // This force provides links between nodes
            .id(function(d) { return d.id; })                     // This provide  the id of a node
            .links(data[0])                                    // and this the list of links
        )
        
        .force("charge", d3.forceManyBody().strength(-600))         // This adds repulsion between nodes. Play with the -400 for the repulsion strength
        .force("collide", d3.forceCollide().strength(0.1).radius(30))
        .force("center", d3.forceCenter(width / 2, height / 2))     // This force attracts nodes to the center of the svg area
        .on("tick", d => {
            node
            .attr("cx", d => d.x)
            .attr("cy", d => d.y);
        
        
            linkpath
            .attr("d", d => "M" + d.source.x + "," + d.source.y + " " + d.target.x + "," + d.target.y);
        });

function dragstarted(event, d) {
if (!event.active) simulation.alphaTarget(0.3).restart();
d.fx = d.x;
d.fy = d.y;
}

function dragged(event, d) {
d.fx = event.x;
d.fy = event.y;
}

function dragended(event, d) {
if (!event.active) simulation.alphaTarget(0);
d.fx = null;
d.fy = null;
}
console.log(data[0]); //links
console.log(data[1]); //cases



})
