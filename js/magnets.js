const width = 960;
const height = 960;
let data = [];
let x, y;
let popScale, denScale;

let n = 4
color = d3.scaleOrdinal(d3.range(n), ["transparent"].concat(d3.schemeTableau10))


const k = width / 200;
const r = d3.randomUniform(k, k * 4);
data = Array.from({length: 200}, (_, i) => ({r: r(), group: i && (i % n + 1)}));
console.log("data: ", data);

var canvas = document.getElementById("game");
var context = canvas.getContext("2d");

const nodes = data.map(Object.create);
console.log("nodes:" , nodes);

const simulation = d3.forceSimulation(nodes)
    .alphaTarget(0.3) // stay hot
    .velocityDecay(0.1) // low friction
    .force("x", d3.forceX().strength(0.01))
    .force("y", d3.forceY().strength(0.01))
    .force("collide", d3.forceCollide().radius(d => d.r + 1).iterations(3))
    .force("charge", d3.forceManyBody().strength((d, i) => i ? 0 : -width * 2 / 3))
    .on("tick", ticked);

d3.select(context.canvas)
    .on("click", clicked)

function clicked(event) {
    console.log("clicked")
    const [x, y] = d3.pointer(event);

    nodes[0].fx = x - width / 2;
    nodes[0].fy = y - height / 2;

    d3.select("svg").append('rect')
        .attr('id',"magnet")
        .attr('x', x)
        .attr('y', y)
        .attr('width', 10)
        .attr('height', 10)
        .attr('stroke', 'black')
        .attr('fill', '#69a3b2');
}

function ticked() {
    context.clearRect(0, 0, width, height);
    context.save();
    context.translate(width / 2, height / 2);
    for (const d of nodes) {
        // console.log(nodes.length)
        context.beginPath();
        context.moveTo(d.x + d.r, d.y);
        context.arc(d.x, d.y, d.r, 0, 2 * Math.PI);
        context.fillStyle = color(d.group);
        context.fill();
    }
    context.restore();
}