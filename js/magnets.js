const width = 960;
const height = 960;

let n = 4
color = d3.scaleOrdinal(d3.range(n), ["transparent"].concat(d3.schemeTableau10))


const k = width / 200;
const r = d3.randomUniform(k, k * 4);
const x = d3.randomUniform(k, k * 4);
const y = d3.randomUniform(k, k * 4);
let data = Array.from({length: 200}, (_, i) => ({x:x(), y: y(), r: r(), group: i && (i % n + 1)}));

var svg = d3.select("body").append("svg")
    .attr("width", width)
    .attr("height", height);

// let nodes = data.map(Object.create);
// console.log("nodes:" , nodes);

let simulation = d3.forceSimulation(data)
    .alphaTarget(0.3) // stay hot
    .velocityDecay(0.1) // low friction
    .force("x", d3.forceX().strength(0.01))
    .force("y", d3.forceY().strength(0.01))
    .force('center', d3.forceCenter(width / 2, height / 2))
    .force("collide", d3.forceCollide().radius(10).iterations(3))
    .force("charge", d3.forceManyBody().strength((d, i) => i ? 0 : -width * 2 / 3))
    .on("tick", ticked);

d3.select("svg")
    .on("click", clicked)


function clicked(event) {
    console.log("clicked")
    const [x, y] = d3.pointer(event);

    simulation.stop();
    data.unshift({x:x, y:y, r:10, group: 1});
    console.log(data);
    // simulation.restart();

    simulation = d3.forceSimulation(data)
    .alphaTarget(0.3) // stay hot
    .velocityDecay(0.1) // low friction
    .force("x", d3.forceX().strength(0.01))
    .force("y", d3.forceY().strength(0.01))
    .force('center', d3.forceCenter(width / 2, height / 2))
    .force("collide", d3.forceCollide().radius(10).iterations(3))
    .force("charge", d3.forceManyBody().strength((d, i) => i ? 0 : -width * 2 / 3))
    .on("tick", ticked);
    

    // data.push({x:x, y:y, r:10, group: 1});
    // data[0].fx = x;
    // data[0].fy = y;

    // nodes = data.map(Object.create);
    // nodes[199].fx = x;
    // nodes[199].fy = y;
    console.log("clicked:", data);

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
    d3.select('svg')
        .selectAll('circle')
        .data(data)
        .join('circle')
        .attr('r', 10)
        .attr('cx', function(d) {
            return d.x
        })
        .attr('cy', function(d) {
            return d.y
        })
}