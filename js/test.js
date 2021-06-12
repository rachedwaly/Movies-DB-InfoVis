const h = 600;
const w = 800;

const maxDots = 500

var movies = [];
var nodes = []

var simulation;
let svg = d3.select("body")
.append("svg")
.attr("width", w)
.attr("height", h)
.on('click',(event) => {
    simulation.alpha(0.1)
    var coordinates= d3.pointer(event);
    var xm = coordinates[0];
    var ym = coordinates[1];
    console.log(xm);
    //simulation.force('y',null);
    //simulation.force('x',null);
    simulation.force('y', d3.forceY(function(d){
        var y;
        if (d.gross<=1000000) {y=ym;}
        else y=d.powery;
        return y
    }).strength(10))
    
    simulation.force('x', d3.forceX(function(d){
        var x;
        if (d.gross<=1000000) {x=xm;}
        else x=d.powerx;
        return x
    }).strength(10))

    simulation.nodes(nodes).restart();
    
    
    
});


var flag;

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
        if (i<1000) nodes.push({name:d.genre,powerx:w/2,powery:h/2, radius:5,gross: d.gross, fill: "#" + Math.floor(Math.random() * 16777215).toString(16) });
    });
    simulation = d3.forceSimulation(nodes)
    .force('x', d3.forceX(function(d){
        return d.powerx
    }))
    .force('y', d3.forceY(function(d){

        return y=d.powery;
        
    }))
    
    //.force("charge", d3.forceManyBody().strength(-20))
    .force('collision', d3.forceCollide().radius(function(d) {
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
          .attr('fill',function(d) {
            if (d.gross<=1000000) {return "#40F99B"}
            return "#000000"
          })
          .attr('cx', function(d) {
            return d.x
          })
          .attr('cy', function(d) {
            return d.y
          });
        
      }

/*
      function clicked(){
    
    
        
    const strength = 0.2;
    let nodes;

    function force(alpha) {
        if (flag){
        console.log("zall");
        const l = alpha * strength;
        for (const d of nodes) {
            
            if (d.gross<=1000000) {y=ym;}
            else y=d.powery;
            
            if (d.gross<=1000000) {x=xm;}
            else x=d.powerx;
            
        }
    flag=false;
    }
    }

    force.initialize =  _=> nodes =_ ;

    return force;

    }

*/