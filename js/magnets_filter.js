// Filter variables
var ID = 0;
var list_options = [];  //used by second filter

// Data lists
var movies = [];
let movies1000 = [];    //after first filter
let moviesAtt = [];     //attracted movies id

const max_nodes = 1000;

var actorsList = [];
var directorList = []
var writerList = []
var companyList = []
var countryList = ["chose a country"]
var genreList = ["chose a genre"]

const h = 800;
const w = 1400;

const maxDots = 500

var nodes = [];
var magnets = new Map();
var maxMagnetsPerNode = 0;
var flag = 0;
var isDragingMagnet = false;
var draged_magnetID = -1;
var simulation;
var currentMagnetid = 0; //will be use to add a certain magnet inside the svg
var mapOfMagnet = new Map();
var list = [5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70, 75, 80, 85, 90, 95, 100];
var fillScale = d3.scaleLinear().domain([0, 1]).range(["blue", "red"]);
let fillScaleMag = d3.scaleSequential()
.domain([0, 10])
.interpolator(d3.interpolateRainbow);

let container=d3.select("body").append("div").attr('id',"container");

let svg = container
    .append("svg")
    .attr("width", w)
    .attr("height", h);


var tooltip=d3.select('body').select("#tooltip");

svg.on('click', (event) => {
    var coordinates = d3.pointer(event);
    var xm = coordinates[0];
    var ym = coordinates[1];

    //add a new magnet
    if (flag == 1) {

        //push to magnets' list  the caracteristics of the magnet => x,y

        magnets.set(currentMagnetid, { x: xm, y: ym });

        svg.append("rect")
        .attr('id', "magnet" + currentMagnetid.toString())
        .attr('x', xm-20)
        .attr('y', ym-20)
        .attr('width', 20)
        .attr('height', 20)
        .style("fill", fillScaleMag(currentMagnetid))
        .call(d3.drag().on("start", dragstarted)
                           .on("drag", dragged)
                           .on("end", dragended));


        //fill the mapofmagnet
        //update list

        updateMap(list, currentMagnetid);
        resetMagnets();
        apply_magnets();
        update_colors();

        switchTo(0);

        currentMagnetid += 1;

    }
});

function update_colors(){
    fillScale = d3.scaleLinear().domain([0, maxMagnetsPerNode]).range(["blue", "red"]);
    svg
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

    updateLists(movies);

    initializeMap(movies);

});


function ticked() {
    var u = svg
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




function updateLists(data){

    actorsList = [];
    directorList = []
    writerList = []
    companyList = []
    countryList = ["0 Chose a country"]
    genreList = ["0 Chose a genre"]

    data.forEach(function(d,i) {
        actorsList.push(d.star);
        directorList.push(d.director);
        writerList.push(d.writer);
        companyList.push(d.company);
        countryList.push(d.country);
        genreList.push(d.genre);
    });

    // Keep unique values
    actorsList = actorsList.filter((v, i, a) => a.indexOf(v) === i);
    directorList = directorList.filter((v, i, a) => a.indexOf(v) === i);
    writerList = writerList.filter((v, i, a) => a.indexOf(v) === i);
    companyList = companyList.filter((v, i, a) => a.indexOf(v) === i);
    countryList = countryList.filter((v, i, a) => a.indexOf(v) === i);
    genreList = genreList.filter((v, i, a) => a.indexOf(v) === i);

    // Sort in alphabetical order
    actorsList.sort();
    directorList.sort();
    writerList.sort();
    companyList.sort();
    countryList.sort();
    genreList.sort();
}


//first filter
function filter1(){
    let select1 = d3.select("#selector1");
    let container = d3.select("#filter_container");
    let list_opt = {"container": container, "type": select1};

    switch (select1.property("value")) {
        case "budget": case "gross": case "runtime": case "score": case "votes":
            updateSlider1(list_opt);
            break;
        case "genre": case "country":
            updateDblSelectList(list_opt)
            break;
        default:
            break;
    }
}
function updateSlider1(list_opt) {
   
    let selector = list_opt["type"]

    let container = list_opt["container"]
    container.selectAll('li').remove();

    var li = container.append("li")

    // Value of the type selector
    console.log(selector.property("value"))
    let value = selector.property("value");

    li.append("text")
    .text("from: ")
    // Create a new svg for the new slider
    let new_slider_component = li.append('svg')
            .attr('width', 600)
            .attr('height', 70)
    
            
    li.append("text")
    .text("to: ")

    let new_slider_component2 = li.append('svg')
            .attr('width', 600)
            .attr('height', 70)

    let val1 = 0, val2 = 0;
    // Create the new slider depending on the type value
    switch (value) {
        case "budget":
            let minBudget = d3.min(movies, d => d.budget);
            let maxBudget = d3.max(movies, d => d.budget);
        
            var new_slider = d3.sliderHorizontal()
                .min(minBudget)
                .max(maxBudget)
                .step(1000000)
                .ticks(5)
                .width(500)
                .displayValue(true)
                .on('onchange', (val) => {
                    val1 = val;
                    sliderCheckVal(val1, val2, selector);
            });
            var new_slider2 = d3.sliderHorizontal()
                .min(minBudget)
                .max(maxBudget)
                .step(1000000)
                .ticks(5)
                .width(500)
                .displayValue(true)
                .on('onchange', (val) => {
                    val2 = val;
                    sliderCheckVal(val1, val2, selector);;
            });

            break;
        case "gross":
            let minGross = 0;
            let maxGross = Math.ceil(d3.max(movies, d => d.gross) / 1000000) * 1000000;

            var new_slider = d3.sliderHorizontal()
                .min(minGross)
                .max(maxGross)
                .step(1000000)
                .ticks(5)
                .width(500)
                .displayValue(true)
                .on('onchange', (val) => {
                    val1 = val;
                    sliderCheckVal(val1, val2, selector);;
            });
            var new_slider2 = d3.sliderHorizontal()
                .min(minGross)
                .max(maxGross)
                .step(1000000)
                .ticks(5)
                .width(500)
                .displayValue(true)
                .on('onchange', (val) => {
                    val2 = val;
                    sliderCheckVal(val1, val2, selector);;
            });
            break;
        case "runtime":
            let minRuntime = d3.min(movies, d => d.runtime);
            let maxRuntime = d3.max(movies, d => d.runtime);
        
            var new_slider = d3.sliderHorizontal()
                .min(minRuntime)
                .max(maxRuntime)
                .step(1)
                .width(500)
                .displayValue(true)
                .on('onchange', (val) => {
                    val1 = val;
                    sliderCheckVal(val1, val2, selector);;
            });
            var new_slider2 = d3.sliderHorizontal()
                .min(minRuntime)
                .max(maxRuntime)
                .step(1)
                .width(500)
                .displayValue(true)
                .on('onchange', (val) => {
                    val2 = val;
                    sliderCheckVal(val1, val2, selector);;
            });
            break;
        case "score":
            let minScore = 0;
            let maxScore = 10;
        
            var new_slider = d3.sliderHorizontal()
                .min(minScore)
                .max(maxScore)
                .step(1)
                .width(500)
                .displayValue(true)
                .on('onchange', (val) => {
                    val1 = val;
                    sliderCheckVal(val1, val2, selector);;
                });
            var new_slider2 = d3.sliderHorizontal()
                .min(minScore)
                .max(maxScore)
                .step(1)
                .width(500)
                .displayValue(true)
                .on('onchange', (val) => {
                    val2 = val;
                    sliderCheckVal(val1, val2, selector);;
                });
            break;
        case "votes":
            let minVotes = 0;
            let maxVotes = Math.ceil(d3.max(movies, d => d.votes) / 100000) * 100000;
        
            var new_slider = d3.sliderHorizontal()
                .min(minVotes)
                .max(maxVotes)
                .step(1000)
                .width(500)
                .ticks(5)
                .displayValue(true)
                .on('onchange', (val) => {
                    val1 = val;
                    sliderCheckVal(val1, val2, selector);;
                });
            var new_slider2 = d3.sliderHorizontal()
                .min(minVotes)
                .max(maxVotes)
                .step(1000)
                .width(500)
                .ticks(5)
                .displayValue(true)
                .on('onchange', (val) => {
                    val2 = val;
                    sliderCheckVal(val1, val2, selector);;
                });
            break;
        default:
    }

    // Add the slider into the svg component
    new_slider_component.append('g')
                        .attr('transform', 'translate(30,30)')
                        .call(new_slider)

    new_slider_component2.append('g')
                        .attr('transform', 'translate(30,30)')
                        .call(new_slider2) 

};

// reusable:
function updateDblSelectList(list_opt) {

    let selector = list_opt["type"]

    let container = list_opt["container"]
    if(container.selectAll('li'))
    container.selectAll('li').remove();

    var li = container.append("li")

    console.log(selector.property("value"))
    let value = selector.property("value");

    var dblSelector = li.append("select")
    .attr("id", "selectTmp")
    .attr("class", "type")
    .attr("height", 28)
    .on('change', () => {dblCheckVal(dblSelector, selector)})

    // Create the new slider depending on the type value
    switch (value) {
        case "country":
            dblSelector.selectAll("option")
             .data(countryList)
             .enter()
             .append("option")
             .text(function(d){return d;})
             .attr("value", function(d) {return d;});

            break;
        case "genre":
            dblSelector.selectAll("option")
                .data(genreList)
                .enter()
                .append("option")
                .text(function(d){return d;})
                .attr("value", function(d) {return d;});
   
               break;
        
        default:
    }
            
};

// reusable:
// slider value check (...value, type selector) 
function sliderCheckVal(val1, val2, selector){
    
   let select1 = selector.property("value");
   let hint = "";
   let data = [];

    if(val1 > val2){
        hint = "slider 1 greater than slider 2"
        updateMovies1000(hint, true, data)
        return null;
    } else{
        switch (select1) {
            case "budget":
                for(let i = 0; i < movies.length; i++){
                    if(movies[i].budget >= val1 && movies[i].budget <= val2){
                        data.push(movies[i]);
                    }
                }
                break;
            case "gross":
                movies.forEach(function(d,i) {
                    if(d.gross >= val1 && d.gross <= val2)
                        data.push(d);
                })
                break;
            case "runtime":
                movies.forEach(function(d,i) {
                    if(d.runtime >= val1 && d.runtime <= val2)
                        data.push(d);
                })
                break;
            case "score":
                movies.forEach(function(d,i) {
                    if(d.score >= val1 && d.score <= val2)
                        data.push(d);
                })
                 
                break;
            case "votes":
                movies.forEach(function(d,i) {
                    if(d.votes >= val1 && d.votes <= val2)
                        data.push(d);
                })
                break;
            default:
            
        }

        if(data.length < max_nodes){
            hint = "create a magnet map with " + data.length + " nodes";
            updateMovies1000(hint, false, data)

        }else{
            hint = "can't create a magnet map with " + data.length + " nodes, change the slider value or change another category";           
            updateMovies1000(hint, true, data)
        }
    }
}
// reusable:
// double selector value check (...value, type selector)
function dblCheckVal(dblselector, selector){ 
    
    let select1 = selector.property("value");
    let value = dblselector.property("value");  // selected country or genre
    let hint = "";
    
    let data = [];
    switch (select1) {
        case "country":
            movies.forEach(function(d,i) {
                if(d.country === value)
                    data.push(d);
            })
            break;
        case "genre":
            movies.forEach(function(d,i) {
                if(d.genre === value)
                    data.push(d);
            })
            break;
        default:break;
        
    }

    if(data.length < max_nodes){
        hint = "create a magnet map with " + data.length + " nodes";
        updateMovies1000(hint, false, data)

    }else{
        hint = "can't create a magnet map with " + data.length + " nodes, change another category";           
        updateMovies1000(hint, true, data)
    }
}

// first filter result : active button & update movies1000
function updateMovies1000(hint, status, data){
    let nextBtn = document.getElementById("next");
    if(status) nextBtn.disabled = true;
    else nextBtn.removeAttribute('disabled')
    nextBtn.innerHTML = hint;

    movies1000 = data;
}

//----------------------------------------------------------------

function filter2(){
    let filter2 = document.getElementById("second_filter")
    filter2.style.display = "";
    createMap();
}

function add() {
    let select2 = d3.select("#selector2");
    let container = d3.select("#magnets_container");

    var li = container.append("li")
                        .attr("class", "w3-display-container")
                        .attr("id", ID);

    list_options[ID.toString()] = {"li": li, "type": select2};

    switch (select2.property("value")) {
        case "budget": case "gross": case "runtime": case "score": case "votes":
            
            updateSlider2(list_options[li.property("id")]);

            break;
        case "genre": case "country":
            updateDblSelectList2(list_options[li.property("id")])

            break;
        case "actor": case "director": case "writer": case "company":
            
            updateNameList(list_options[li.property("id")])
            break;
        default:
            break;
    }

    
    // Increment the id variable
    ID += 1
    
};

function updateSlider2(list_opt) {
    
    let selector = list_opt["type"]

    // let container = list_opt["container"]
    // if(container.selectAll('li'))
    // container.selectAll('li').remove();

    var li = list_opt["li"]

    // Value of the type selector
    console.log(selector.property("value"))
    let value = selector.property("value");

    li.append("text")
    .text(value)
    
    // Remove the previous svg component (for the slider)
    if(list_opt["slider"]) list_opt["slider"].remove();

    // Create the order selector (higher than, lower than, equals to)
    var order = li.append("select")
            // .on('change', function() { createMagOnMap();})

    order.selectAll("option")
            .data(["higher than", "equals to", "lower than"])
            .enter()
            .append("option")
            .text(function(d){return d;})
            .attr("value", function(d){return d;});

    list_opt["order"] = order;

    // Create a new svg for the new slider
    let new_slider_component = li.append('svg')
            .attr('width', 600)
            .attr('height', 70)

    // Update the dict
    list_opt["slider"] = new_slider_component;

    // Create the new slider depending on the type value
    switch (value) {
        case "budget":
            let minBudget = d3.min(movies, d => d.budget);
            let maxBudget = d3.max(movies, d => d.budget);
        
            var new_slider = d3.sliderHorizontal()
                .min(minBudget)
                .max(maxBudget)
                .step(1000000)
                .ticks(5)
                .width(500)
                .displayValue(true)
                .on('onchange', (val) => {
                    list_opt["slider_value"] = val;
                    sliderCheckVal2(val, order, selector)
                })
                // .on('end', function() { createMagOnMap()});
            break;
        case "gross":
            let minGross = 0;
            let maxGross = Math.ceil(d3.max(movies, d => d.gross) / 1000000) * 1000000;

            var new_slider = d3.sliderHorizontal()
                .min(minGross)
                .max(maxGross)
                .step(1000000)
                .ticks(5)
                .width(500)
                .displayValue(true)
                .on('onchange', (val) => {
                    list_opt["slider_value"] = val;
                    sliderCheckVal2(val, order, selector)
                })
                // .on('end', function() { createMagOnMap()});
            break;
        case "runtime":
            let minRuntime = d3.min(movies, d => d.runtime);
            let maxRuntime = d3.max(movies, d => d.runtime);
        
            var new_slider = d3.sliderHorizontal()
                .min(minRuntime)
                .max(maxRuntime)
                .step(1)
                .width(500)
                .displayValue(true)
                .on('onchange', (val) => {
                    list_opt["slider_value"] = val;
                    sliderCheckVal2(val, order, selector)
                })
                // .on('end', function() { createMagOnMap()});
            break;
        case "score":
            let minScore = 0;
            let maxScore = 10;
        
            var new_slider = d3.sliderHorizontal()
                .min(minScore)
                .max(maxScore)
                .step(1)
                .width(500)
                .displayValue(true)
                .on('onchange', (val) => {
                    list_opt["slider_value"] = val;
                    sliderCheckVal2(val, order, selector)
                })
                // .on('end', function() { createMagOnMap()});
            break;
        case "votes":
            let minVotes = 0;
            let maxVotes = Math.ceil(d3.max(movies, d => d.votes) / 100000) * 100000;
        
            var new_slider = d3.sliderHorizontal()
                .min(minVotes)
                .max(maxVotes)
                .step(1000)
                .width(500)
                .ticks(5)
                .displayValue(true)
                .on('onchange', (val) => {
                    list_opt["slider_value"] = val;
                    sliderCheckVal2(val, order, selector)
                })
                // .on('end', function() { createMagOnMap()});
            break;
        default:
    }

    // Add the slider into the svg component
    new_slider_component.append('g')
                        .attr('transform', 'translate(30,30)')
                        .call(new_slider);

                        
    // TODO: reuseable
    let rightMenu = li.append("span")
                .attr("class", "w3-button w3-display-right");


    // Create a new svg for the new slider
    let new_magnets = rightMenu.append('svg')
                            .attr('width', 50)
                            .attr('height', 30)
        
    
    let rect = new_magnets.append("rect")
        .attr('x', '0px')
        .attr('y', '5px')
        .attr('width','20px')
        .attr('height','20px')
        .style('fill', fillScaleMag(currentMagnetid)) //TODO: fix with icon
        .on("click", function() { 
            list_opt["slider"].remove();
            order.attr("disabled", "disabled") 
            li.append("text")
                .text(list_opt["slider_value"])
            
            createMagOnMap(rect); 
        })  //TODO: click to create a circle following the mouse move => then click on somewhere on the map to "drop" (disappear from mouse, but show on the map)

    rightMenu.append("span")
        .attr("class", "w3-button w3-display-right")
        .on("click", function() { li.style("display", "none"); 
                            delete list_options[li.property("id")]; 
                            ; })
        .text("x")

};


function updateDblSelectList2(list_opt) {

    let selector = list_opt["type"]
    var li = list_opt["li"]

    // Value of the type selector
    console.log(selector.property("value"))
    let value = selector.property("value");

    li.append("text")
    .text(value)

    var dblSelector = li.append("select")
    .attr("id", "selectTmp")
    .attr("class", "type")
    .attr("height", 28)
    .on('change', () => {dblCheckVal2(dblSelector, selector)})

    // Create the new slider depending on the type value
    switch (value) {
        case "country":
            dblSelector.selectAll("option")
             .data(countryList)
             .enter()
             .append("option")
             .text(function(d){return d;})
             .attr("value", function(d) {return d;});

            break;
        case "genre":
            dblSelector.selectAll("option")
                .data(genreList)
                .enter()
                .append("option")
                .text(function(d){return d;})
                .attr("value", function(d) {return d;});
   
               break;
        
        default:
    }

    let rightMenu = li.append("span")
                .attr("class", "w3-button w3-display-right");


    // Create a new svg for the new slider
    let new_magnets = rightMenu.append('svg')
                            .attr('width', 50)
                            .attr('height', 30)
        

    let rect = new_magnets.append("rect")
        .attr('x', '0px')
        .attr('y', '5px')
        .attr('width','20px')
        .attr('height','20px')
        .style('fill', fillScaleMag(currentMagnetid)) //TODO: fix with icon
        .on("click", function() { 
            dblSelector.attr("disabled", "disabled")             
            createMagOnMap(rect); 
        })  //TODO: click to create a circle following the mouse move => then click on somewhere on the map to "drop" (disappear from mouse, but show on the map)


    rightMenu.append("span")
        .attr("class", "w3-button w3-display-right")
        .on("click", function() { li.style("display", "none"); 
                            delete list_options[li.property("id")]; 
                            ; })
        .text("x")
            
};

function updateNameList(list_opt) {
    let selector = list_opt["type"]
    var li = list_opt["li"]

    // Value of the type selector
    console.log(selector.property("value"))
    let value = selector.property("value");

    li.append("text")
    .text(value)

    updateLists(movies1000);

    switch (value) {
        case "actor":
            list_opt["name"] = actorsList;
            break;
        case "director":
            list_opt["name"] = directorList;
            break;
        case "writer":
            list_opt["name"] = writerList;
            break;
        case "company":
            list_opt["name"] = companyList;
            break;
        case "country":
            list_opt["name"] = countryList;
            break;
    }


    var search_div = li.append("div")
    var namelist = search_div.append("input")
                           .attr("type", "text")
                           .attr("placeholder", "Enter the name...")
                           .on("click", function (e) { d3.selectAll(".autocomp_box").style("display", "none"); 
                                                        li.select(".autocomp_box").style("display", "block"); 
                                                        autocomp(e, autocomp_box, list_opt);
                        })
                           .on("keyup", (e) => autocomp(e, autocomp_box, list_opt))
            
    var autocomp_box = search_div.append("div")
                                        .attr("class", "autocomp_box")
                                        .style("display", "none")

    list_opt["input"] = namelist;

    li.append("span")
                .attr("class", "w3-button w3-display-right")
                .on("click", function() { li.style("display", "none"); delete list_opt;})
                .text("x")
   

    let rightMenu = li.append("span")
                .attr("class", "w3-button w3-display-right");


    // Create a new svg for the new slider
    let new_magnets = rightMenu.append('svg')
                            .attr('width', 50)
                            .attr('height', 30)
        
    let rect = new_magnets.append("rect")
        .attr('x', '0px')
        .attr('y', '5px')
        .attr('width','20px')
        .attr('height','20px')
        .style('fill', fillScaleMag(currentMagnetid)) //TODO: fix with icon
        .on("click", function() { 
            namelist.attr("disabled", "disabled");
            nameCheckVal2(list_opt);           
            createMagOnMap(rect); 
        })  //TODO: click to create a circle following the mouse move => then click on somewhere on the map to "drop" (disappear from mouse, but show on the map)


    rightMenu.append("span")
        .attr("class", "w3-button w3-display-right")
        .on("click", function() { li.style("display", "none"); 
                            delete list_options[li.property("id")]; 
                            ; })
        .text("x")
}

function autocomp(e, autocomp_box, list_opt) {
    autocomp_box.selectAll("li").remove();
    let userData = e.target.value; //user enetered data
    let emptyArray = [];

    let suggestions = list_opt["name"];

    if(userData != ""){
     
        emptyArray = suggestions.filter((data)=>{
            //filtering array value and user characters to lowercase and return only those words which are start with user enetered chars
            return data.toLocaleLowerCase().startsWith(userData.toLocaleLowerCase()); 
        });
        //console.log(emptyArray)
        
        //autocomp_box.style("display", "block") //show autocomplete box
    } else{
        emptyArray = suggestions;
        //autocomp_box.style("display", "none") //hide autocomplete box
    }

    //console.log(":::::", emptyArray)
    emptyArray = emptyArray.map((data)=>{
        autocomp_box.append("li")
                    .attr("class", "autocomp-items")
                    .on("click", function() { e.target.value = data; autocomp_box.selectAll("li").remove(); autocomp_box.style("display", "none"); })
                    .text(data)
    });

    nameCheckVal2(list_opt)

}

function nameCheckVal2(list_opt){ 
    let userData = list_opt['input'].property("value"); //user enetered data

    userData = userData.toLocaleLowerCase(); 
    console.log("----->", userData)

    let selector = list_opt["type"]
    let value = selector.property("value");
    let data = [];

    switch (value) {
        case "actor":
            movies1000.forEach(function(d,i) {
                if(d.star.toLocaleLowerCase().includes(userData) ){                   
                    data.push(d.id);
                }
            })
            break;
        case "director":
            movies1000.forEach(function(d,i) {
                if(d.director.toLocaleLowerCase().includes(userData))
                    data.push(d.id);
            })
            break;
        case "writer":
            movies1000.forEach(function(d,i) {
                if(d.writer.toLocaleLowerCase().includes(userData))
                    data.push(d.id);
            })
            break;
        case "company":
            movies1000.forEach(function(d,i) {
                if(d.company.toLocaleLowerCase().includes(userData))
                    data.push(d.id);
            })
            break;
    }

    moviesAtt = data;
    console.log(moviesAtt)
}

function sliderCheckVal2(val, order, selector){
    
    let select1 = selector.property("value");
    
    let data = [];

    switch (select1) {
        case "budget":
           if (order.property("value") ==  "higher than") {
               movies1000.forEach(function(d,i) {
                   if(d.budget > val)
                       data.push(d.id);
               })

           } else if (order.property("value") ==  "equals to") {
               movies1000.forEach(function(d,i) {
                   if(d.budget = val)
                       data.push(d.id);
               })
           } else {
               movies1000.forEach(function(d,i) {
                   if(d.budget < val)
                       data.push(d.id);
               })
           }
           break;
        case "gross":
           if (order.property("value") ==  "higher than") {
               movies1000.forEach(function(d,i) {
                   if(d.gross > val)
                       data.push(d.id);
               })

           } else if (order.property("value") ==  "equals to") {
               movies1000.forEach(function(d,i) {
                   if(d.gross = val)
                       data.push(d.id);
               })
           } else {
               movies1000.forEach(function(d,i) {
                   if(d.gross < val)
                       data.push(d.id);
               })
           } 
           break;
        case "runtime":
           if (order.property("value") ==  "higher than") {
               movies1000.forEach(function(d,i) {
                   if(d.runtime > val)
                       data.push(d.id);
               })

           } else if (order.property("value") ==  "equals to") {
               movies1000.forEach(function(d,i) {
                   if(d.runtime = val)
                       data.push(d.id);
               })
           } else {
               movies1000.forEach(function(d,i) {
                   if(d.runtime < val)
                       data.push(d.id);
               })
           } 
           break;
        case "score":
           if (order.property("value") ==  "higher than") {
               movies1000.forEach(function(d,i) {
                   if(d.score > val)
                       data.push(d.id);
               })

           } else if (order.property("value") ==  "equals to") {
               movies1000.forEach(function(d,i) {
                   if(d.score = val)
                       data.push(d.id);
               })
           } else {
               movies1000.forEach(function(d,i) {
                   if(d.score < val)
                       data.push(d.id);
               })
           } 
           break;
        case "votes":
           if (order.property("value") ==  "higher than") {
               movies1000.forEach(function(d,i) {
                   if(d.votes > val)
                       data.push(d.id);
               })

           } else if (order.property("value") ==  "equals to") {
               movies1000.forEach(function(d,i) {
                   if(d.votes = val)
                       data.push(d.id);
               })
           } else {
               movies1000.forEach(function(d,i) {
                   if(d.votes < val)
                       data.push(d.id);
               })
           } 
           break;
        default:
        
    }   
    
    moviesAtt = data;
    console.log(moviesAtt)
    
}

function dblCheckVal2(dblselector, selector){ 
    
    let select1 = selector.property("value");
    let value = dblselector.property("value");  // selected country or genre
    let hint = "";
    
    let data = [];
    switch (select1) {
        case "country":
            movies1000.forEach(function(d,i) {
                if(d.country === value)
                    data.push(d.id);
            })
            break;
        case "genre":
            movies1000.forEach(function(d,i) {
                if(d.genre === value)
                    data.push(d.id);
            })
            break;
        default:break;
        
    }

    moviesAtt = data;
    console.log(moviesAtt);
}



// CHECK ME:

function createMap(){ 
    alert("create a map");
    console.log(">>>>>>>>", movies1000)
    //movies1000 are nodes can be shown on map. Adjust the number by changing `max_nodes`
    //TODO:
        
    nodes = movies1000;

    simulation = d3.forceSimulation(nodes)
        .force('collision', d3.forceCollide().radius(function (d) {
            return 6
        }).strength(1.1))
        .on('tick', ticked);
}
function createMagOnMap(rect){
    alert("create a magnet");
    console.log(">>>>>>>>", moviesAtt); 
    //moviesAtt contains the index array that will be attracted
    //TODO: 
    rect.on("click", null);
    list = moviesAtt;
    switchTo(1);

}
