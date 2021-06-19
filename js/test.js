const h = 800;
const w = 1400;

const maxDots = 500

var movies = [];
var nodes = [];
var magnets = new Map();
var maxMagnetsPerNode = 0;
var flag = 1;
var isDragingMagnet = false;
var draged_magnetID = -1;
var simulation;
var currentMagnetid = -1; //will be use to add a certain magnet inside the svg
var mapOfMagnet = new Map();
var list = [5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70, 75, 80, 85, 90, 95, 100];
var fillScale = d3.scaleLinear().domain([0, 1]).range(["blue", "red"]);

let container=d3.select("body").append("div").attr('id',"container");

let svg = container
    .append("svg")
    .attr("width", w)
    .attr("height", h)
    .style("position","fixed")
    .style("top","200px");


var tooltip=d3.select('body').select("#tooltip");

svg.on('click', (event) => {
    var coordinates = d3.pointer(event);
    var xm = coordinates[0];
    var ym = coordinates[1];

    //add a new magnet
    if (flag == 1) {

        //push to magnets' list  the caracteristics of the magnet => x,y

        currentMagnetid += 1;
        magnets.set(currentMagnetid, { x: xm, y: ym });

        d3.select("svg").append('image')
            .attr('id', "magnet" + currentMagnetid.toString())
            .attr('x', xm-20)
            .attr('y', ym-20)
            .attr('width', 40)
            .attr('height', 40)
            .attr("xlink:href", "https://img.icons8.com/cotton/64/000000/magnet.png")
            .attr('fill', '#69a3b2')
            .call(d3.drag().on("start", dragstarted)
                           .on("drag", dragged)
                           .on("end", dragended));
        //fill the mapofmagnet
        //update list

        updateMap(list, currentMagnetid);
        resetMagnets();
        apply_magnets();
        update_colors();

    }
});

function update_colors(){
    fillScale = d3.scaleLinear().domain([0, maxMagnetsPerNode]).range(["blue", "red"]);
    d3.select('svg')
      .selectAll('circle')
      .style("fill", d => fillScale(mapOfMagnet.get(d.id).length))
}


function dragstarted(event){
    if (flag != 0) {return;}
    isDragingMagnet = true;
    idStr = event.sourceEvent.target.id;
    draged_magnetID = parseInt(idStr.slice(6,));
}

function dragged(event){
    if (!isDragingMagnet) {return;}
    if (event.x>w-5 ||  event.y >h-5 ||  event.x <5 ||  event.y <5) {return;}
    
    magnets.get(draged_magnetID).x = event.x;
    magnets.get(draged_magnetID).y = event.y;


    svg.select('#magnet'+draged_magnetID.toString())
        .attr('x', event.x)
        .attr('y', event.y);

        resetMagnets();
        apply_magnets();   
}

function dragended(event){
    if (!isDragingMagnet) {return;}
    isDragingMagnet = false;
    draged_magnetID = -1;
}




d3.csv("data/movies.csv", function (d, i) {
    r = d3.randomUniform(0,h*0.3)()
    theta = d3.randomUniform(0,2*3.14)()
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
        year: +d.year,
        x : +w/2+r*Math.cos(theta),
        y : +h/2+r*Math.sin(theta)
    };

}).then(function (csv) {
    movies = csv;
    console.log(csv)


    nodes = csv.slice(0, 1000);



     


    initializeMap(csv);


    simulation = d3.forceSimulation(nodes)
        .force('collision', d3.forceCollide().radius(function (d) {
            return 6
        }).strength(1.1))
        .on('tick', ticked);

});


function ticked() {
    var u = d3.select('svg')
        .selectAll('circle')
        .data(nodes)
        .join('circle')
        .attr('r', 5)
        .attr('fill', function (d) {
            return fillScale(0);
        })
        .attr('cx', function (d) {
            return d.x
        })
        .attr('cy', function (d) {
            return d.y
        })
        
        .on("mouseover", function(event, d){
            var coordinates = d3.pointer(event);
            lastX = coordinates[0];
            lastY = coordinates[1];
            tooltip

                .select("#info")
                .html(tooltipText(d));

            return tooltip.style("visibility", "visible");
        })
        .on("mouseout", function(){return tooltip.style("visibility", "hidden");});
        
}

function tooltipText(d) {
    return '<Strong>Title</Strong>: ' + d.name + '<br>' 
    +'<Strong>Director</Strong>: ' + d.director + '<br>' 
    +'<Strong>Writer</Strong>: ' + d.writer + '<br>' 
    +'<Strong>Star</Strong>: ' + d.star + '<br>' 
    +'<Strong>Company</Strong>: ' + d.company + '<br>' 
    +'<Strong>Genre</Strong>: ' + d.genre + '<br>' 
    +'<Strong>Rating</Strong>: ' + d.rating + '<br>' 
    +'<Strong>Score in IMBD</Strong>: ' + d.score + '<br>' 
    +'<Strong>Budget</Strong>: ' + d.budget + '<br>' 
    +'<Strong>Title</Strong>: ' + d.name + '<br>' 
    +'<Strong>Year</Strong>: ' + d.year + '<br>' 
    +'<Strong>Gross</Strong>: ' + d.gross + '<br>' 
}  


function magneticForce(alpha){
    var strength = 0.7;
    var l = alpha*strength;

    nodes.forEach(d => {        
        activeMagnets = mapOfMagnet.get(d.id);

        if (activeMagnets.length != 0){
            let xm = 0;
            let ym = 0;

            activeMagnets.forEach(magnet_id => {
                let magnet = magnets.get(magnet_id);

                xm += magnet.x;
                ym += magnet.y;
            });
            xm /= activeMagnets.length;
            ym /= activeMagnets.length;

            d.x -= (d.x-xm)*l;
            d.y -= (d.y-ym)*l;            
        }

    });
}


function apply_magnets() {

    simulation.alpha(0.2);
    simulation.nodes(nodes).restart();

    
    simulation.force("zall", magneticForce);
    
}


function resetMagnets() {
    simulation.force("zall", null);
}


function initializeMap(data) {
    for (const d of data) {
        mapOfMagnet.set(d.id, []);
    }
}

function updateMap(list, magnetID) {
    for (const i of list) {
        mapOfMagnet.get(i).push(magnetID);
        if (mapOfMagnet.get(i).length>maxMagnetsPerNode){
            maxMagnetsPerNode = mapOfMagnet.get(i).length;
        }
    }

}


function switchTo(i){
    flag = i;
}


