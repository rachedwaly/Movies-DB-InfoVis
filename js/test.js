const h = 600;
const w = 1600;

const maxDots = 500

var movies = [];
var nodes = [];
var magnets = new Map();
var flag = 1;
var isDragingMagnet = false;
var draged_magnetID = -1;
var simulation;
var currentMagnetid = -1; //will be use to add a certain magnet inside the svg
var mapOfMagnet = new Map();
var list;

let svg = d3.select("body")
    .append("svg")
    .attr("width", w)
    .attr("height", h);


svg.on('click', (event) => {
    var coordinates = d3.pointer(event);
    var xm = coordinates[0];
    var ym = coordinates[1];

    //add a new magnet
    if (flag == 1) {

        //push to magnets' list  the caracteristics of the magnet => x,y

        currentMagnetid += 1;
        magnets.set(currentMagnetid, { x: xm, y: ym });

        d3.select("svg").append('rect')
            .attr('id', "magnet" + currentMagnetid.toString())
            .attr('x', xm)
            .attr('y', ym)
            .attr('width', 10)
            .attr('height', 10)
            .attr('stroke', 'black')
            .attr('fill', '#69a3b2')
            .call(d3.drag().on("start", dragstarted)
                           .on("drag", dragged)
                           .on("end", dragended));
        //fill the mapofmagnet
        list = [5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70, 75, 80, 85, 90, 95, 100]
        updateMap(list, currentMagnetid);

        resetMagnets();
        apply_magnets();

    }
    
});

function dragstarted(event){
    if (flag != 0) {return;}
    isDragingMagnet = true;
    idStr = event.sourceEvent.target.id;
    draged_magnetID = parseInt(idStr.slice(6,));
}

function dragged(event){
    if (!isDragingMagnet) {return;}
    
    magnets.get(draged_magnetID).x = event.x;
    magnets.get(draged_magnetID).y = event.y;


    svg.select('#magnet'+draged_magnetID.toString())
        .attr('x', event.x)
        .attr('y', event.y)
        .attr('width', 10)
        .attr('height', 10)
        .attr('stroke', 'black')
        .attr('fill', '#69a3b2');

        resetMagnets();
        apply_magnets();   
}

function dragended(event){
    if (!isDragingMagnet) {return;}
    isDragingMagnet = false;
    draged_magnetID = -1;
}




d3.csv("data/movies.csv", function (d, i) {
    return {
        id: +i,
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

    nodes = csv.slice(0, 1000);

    initializeMap(csv);


    simulation = d3.forceSimulation(nodes)
        .force('x', d3.forceX(function (d) {
            return w / 2
        }))
        .force('y', d3.forceY(function (d) {
            return h / 2

        }))
        .force('collision', d3.forceCollide().radius(function (d) {
            return 10
        }))
        .on('tick', ticked);

});



function ticked() {
    var u = d3.select('svg')
        .selectAll('circle')
        .data(nodes)
        .join('circle')
        .attr('r', 5)
        .attr('fill', function (d) {
            if ((d.gross <= 1000000) && (d.name == "Adventure")) { return "#40F99B" } //green
            if ((d.gross <= 1000000) && (d.name != "Adventure")) { return "#FFFF00" } //yellow
            //pink
            return "#000000"
        })
        .attr('cx', function (d) {
            return d.x
        })
        .attr('cy', function (d) {
            return d.y
        });

}




function apply_magnets() {

    simulation.alpha(0.2);
    simulation.nodes(nodes).restart();

    for (var z = 0; z < magnets.size; z = z + 1) {
        simulation.force(z.toString() + "x", d3.forceX(function (d) {
            if (mapOfMagnet.get(d.id).includes(z)) { return magnets.get(z).x; }
            else return d.x;
        }).strength(1));

        simulation.force(z.toString() + "y", d3.forceY(function (d) {
            if (mapOfMagnet.get(d.id).includes(z)) { return magnets.get(z).y; }
            else return d.y;
        }).strength(1));



    }

}


function resetMagnets() {

    for (var id = 0; id < magnets.size; id++) {
        simulation.force(id.toString() + "x", null);
        simulation.force(id.toString() + "y", null);
    }

}


function initializeMap(data) {
    for (const d of data) {
        mapOfMagnet.set(d.id, []);
    }
}

function updateMap(list, magnetID) {
    for (const i of list) {
        mapOfMagnet.get(i).push(magnetID);
    }
}


function switchTo(i){
    flag = i;
}

