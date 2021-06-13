const h = 1000;
const w = 1000;

const maxDots = 500

var movies = [];
var nodes = [];
var magnets=new Map();
var flag=1;
var simulation;
var currrentMagnetForce=0; //will be used to create custom forces for each magnet
var currentMagnetid=-1; //will be use to add a certain magnet inside the svg
var mapOfMagnet=new Map();
var list;

let svg = d3.select("body")
.append("svg")
.attr("width", w)
.attr("height", h)
.on('click',(event) => {
    var coordinates= d3.pointer(event);
    var xm = coordinates[0];
    var ym = coordinates[1];
    
    //adjust magnets position
    if (flag==0){
    
    
    magnets.get(currentMagnetid).x=xm;
    magnets.get(currentMagnetid).y=ym;
    

    svg.select("#magnet"+currentMagnetid.toString()).remove();
        d3.select("svg").append('rect')
        .attr('id',"magnet"+currentMagnetid.toString())
        .attr('x', xm)
        .attr('y', ym)
        .attr('width', 10)
        .attr('height', 10)
        .attr('stroke', 'black')
        .attr('fill', '#69a3b2');
    
    updateMagnet(currentMagnetid,xm,ym);
    } 

    //add a new magnet
    else if (flag==1){
    
        //push to magnets' list  the caracteristics of the magnet => x,y
    
    currentMagnetid+=1;
    magnets.set(currentMagnetid,{x:xm,y:ym});
    
    d3.select("svg").append('rect')
        .attr('id',"magnet"+currentMagnetid.toString())
        .attr('x', xm)
        .attr('y', ym)
        .attr('width', 10)
        .attr('height', 10)
        .attr('stroke', 'black')
        .attr('fill', '#69a3b2');
    //fill the mapofmagnet
    list=[5,10,15,20,25,30,35,40,45,50,55,60,65,70,75,80,85,90,95,100]
    updateMap(list,currentMagnetid);

    
    flag=0;

    }
    
    
    
    resetMagnets();
    apply_magnets();


    
    
    
    
    
    
});


var flag;

d3.csv("data/movies.csv", function (d,i) {
    return {
        id:+i,
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

    nodes=csv.slice(0,1000);

    initializeMap(csv);



    simulation = d3.forceSimulation(nodes)
    .force('x', d3.forceX(function(d){
        return w/2
    }))
    .force('y', d3.forceY(function(d){
        return h/2
        
    }))
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
            if ((d.gross<=1000000) && (d.name=="Adventure")) {return "#40F99B"} //green
            if ((d.gross<=1000000)&& (d.name!="Adventure")) {return "#FFFF00"} //yellow
             //pink
            return "#000000"
          })
          .attr('cx', function(d) {
            return d.x
          })
          .attr('cy', function(d) {
            return d.y
          });
        
      }



//custom force to put stuff in a box 
function magnet_force(alpha) { 
    
    
    const strength=0.5;

    for (const curr_node of nodes){


        if (mapOfMagnet.get(curr_node.id).includes(currentMagnetid)){  
        const l = alpha * strength;
        curr_node.vx -= (curr_node.x -magnets.get(currrentMagnetForce).x) * l;
        curr_node.vy -= (curr_node.y -magnets.get(currrentMagnetForce).y) * l; 
        //curr_node.x= magnets.get(currrentMagnetForce).x;
        //curr_node.y=magnets.get(currrentMagnetForce).y;
        }

    }
    
  };

  
/*
  function apply_magnets(){
    
    simulation.alpha(0.2);
    for (var id=0;id<magnets.size;id++){
        currrentMagnetForce=id;
        simulation.force(currentMagnetid.toString(),magnet_force);   
    }
    simulation.nodes(nodes).restart();
  }
*/

function apply_magnets(){
    
    simulation.alpha(0.2);
    simulation.nodes(nodes).restart();

    for (var z=0;z<magnets.size;z=z+1){
        
        console.log(z);
        simulation.force(z.toString()+"x",d3.forceX(function (d){
            if (mapOfMagnet.get(d.id).includes(z)){return magnets.get(z).x; }
            else return d.x;
        }).strength(1));
        
        simulation.force(z.toString()+"y",d3.forceY(function (d){
            if (mapOfMagnet.get(d.id).includes(z)){return magnets.get(z).y; }
            else return d.y;
        }).strength(1));


        
    }


    
    
  }



function updateMagnet(id,xm,ym){
    magnets.get(id).x=xm;
    magnets.get(id).y=ym;

}


function resetMagnets(){
    
    for (var id=0;id<magnets.size;id++){
        simulation.force(id.toString()+"x",null);
        simulation.force(id.toString()+"y",null);
    }
    
}

    
function removeMagnet(id){
    simulation.alpha(0.2);
    simulation.force(id.toString(),null);
    simulation.nodes(nodes).restart();
}


function initializeMap(data)
{
    for (const d of data){
        mapOfMagnet.set(d.id,[]);
    }
}

function updateMap(list,magnetID){
    for (const i of list){
        mapOfMagnet.get(i).push(magnetID);
    }
}


