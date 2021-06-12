// JavaScript source code



const h = 600;
const w = 800;

const maxDots = 500

var movies = [];
var nodes = [];

var simulation;

let svg = d3.select("body")
    .append("svg")
    .attr("width", w)
    .attr("height", h)

d3.csv("data/movies.csv", function (d) {
    return {
        budget: +d.budget,
        company: d.company,
        country: d.country,
        director: d.director,
        genre: d.genre,
        gross: +d.gross,
        name: d.name,
        rating: d.rating,
        released: d.released,
        runtime: +d.runtime,
        score: +d.score,
        star: d.star,
        votes: +d.votes,
        writer: d.writer,
        year: +d.year
    };

}).then(function (csv) {
    movies = csv;
    console.log(csv)

    csv.forEach(function (d, i) {
        if (i<maxDots) nodes.push({ radius: 4, fill: "#" + Math.floor(Math.random() * 16777215).toString(16) });
    });

    var node = svg.append("g")
        .selectAll("circle")
        .data(nodes)
        .enter()
        .append("circle")
        .attr("radius", 2)
        .style("fill", ()=>"#" + Math.floor(Math.random() * 16777215).toString(16) )
        .call(d3.drag() // call specific function when circle is dragged
            .on("start", dragstarted)
            .on("drag", dragged)
            .on("end", dragended));


    simulation = d3.forceSimulation(nodes)
        .force('charge', d3.forceManyBody().strength(1))
        .force('center', d3.forceCenter(w / 2, h / 2))
        .force('collision', d3.forceCollide().radius(function (d) {
            return d.radius+2
        }))
        .on('tick', ticked);

});

function ticked() {
    var u = d3.select('svg')
        .selectAll('circle')
        .data(nodes)
        .join('circle')
        .attr('r', function (d) {
            return d.radius
        })
        .attr('cx', function (d) {
            return d.x
        })
        .attr('cy', function (d) {
            return d.y
        })
        .attr('fill', function (d) {
            return d.fill
        })
        
}

function dragstarted(d) {
    if (event.active) simulation.alphaTarget(.03).restart();
    d.fx = d.x;
    d.fy = d.y;
}
function dragged(d) {
    d.fx = event.x;
    d.fy = event.y;
}
function dragended(d) {
    if (event.active) simulation.alphaTarget(.03);
    d.fx = null;
    d.fy = null;
}