let dataset = [];
let budgetQuery = [];

//d3 v5+ .get() doesn't work
d3.csv("/data/testData.csv")
.then(function(data) {
    console.log(data);
    init(data);
})
.catch(function(error){
   // handle error   
})

function init(data) {
    dataset = data;
    // use default input value do the query
    opData();
    drawChart();
}

function createM(){
    opData();
    drawChart();
}

//filter budget & update query array -> budgetQuery
function opData(){
    let budgetQuerystd = document.getElementById("budget").value;
    
    budgetQuery = [];
    for(let i = 0; i < dataset.length; i ++){
        if(parseInt(dataset[i].budget) > parseInt(budgetQuerystd)){
            budgetQuery.push(1);
        }else{
            budgetQuery.push(0);
        }
    }
}


//draw chart
function drawChart(){
    const width = 560;
    const height = 560;
    
    // let n = 4
    // color = d3.scaleOrdinal(d3.range(n), ["transparent"].concat(d3.schemeTableau10))
    // console.log("color: ", color(0))
    let color = ["#69a3b2", "#783920"]

    
    const k = width / 30;
    const x = d3.randomUniform(k, k * 4);
    const y = d3.randomUniform(k, k * 4);
    //let data = Array.from({length: 30}, (_, i) => ({x:x(), y: y(), r: 10, q: budgetQuery[i]}) );
    let data = [];
    for(let i = 0; i < dataset.length; i ++){
        let tmp = {};
        tmp.x = d3.randomUniform(k, k * 4); 
        tmp.y = d3.randomUniform(k, k * 4);
        tmp.c = 0; // 0 : nodes, 1 : magnet
        tmp.q = budgetQuery[i];
        data.push(tmp);
    }
    console.log("init:", data);
    
    var svg = d3.select("body").append("svg")
        .attr("width", width)
        .attr("height", height);
    
    let simulation = d3.forceSimulation(data)
        .alphaTarget(0.3) // stay hot
        .velocityDecay(0.1) // low friction
        .force('center', d3.forceCenter(width / 2, height / 2))
        .force("collide", d3.forceCollide().radius(10).iterations(3))
        .force("charge", d3.forceManyBody().strength(1))
        .on("tick", ticked);
    
    
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
            .attr('fill', function(d) {
                return color[d.c]
            })

    }

    
    d3.select("svg")
        .on("click", clicked)
        
    function clicked(event) {
        console.log("clicked")
        const [x, y] = d3.pointer(event);
    
        simulation.stop();
        // TODO:// fix: using the first row of data -> add an extra line to the db?
        // TODO:// add more than one magnet
        data.shift();
        data.unshift({x:x, y:y, c:1, q:-1});
        var xCenter = [x, width - x];
        var yCenter = [y, height - y];


        console.log(data);
        // simulation.restart();
    
        // TODO:// fix offset from the click 
        data[0].fx = x;
        data[0].fy = y;

        simulation = d3.forceSimulation(data)
        .alphaTarget(0.3) // stay hot
        .velocityDecay(0.1) // low friction
        .force('center', d3.forceCenter(width / 2, height / 2))
        .force("collide", d3.forceCollide().radius(10).iterations(3))
        .force("charge", d3.forceManyBody().strength((d, i) => d.q ? 1 : -1))
        .force('x', d3.forceX().x(function(d) {
            return xCenter[d.q];
          }))
        .force('y', d3.forceY().y(function(d) {
            return yCenter[d.q];
          }))
        .on("tick", ticked);
        
    
        console.log("clicked:", data);
    
        // d3.select("svg").append('rect')
        //     .attr('id',"magnet")
        //     .attr('x', x)
        //     .attr('y', y)
        //     .attr('width', 10)
        //     .attr('height', 10)
        //     .attr('stroke', 'black')
        //     .attr('fill', '#69a3b2');
       
    }
    
}
