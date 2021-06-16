const width = document.getElementById("container").offsetWidth * 0.95,
    height = 800,
    fontFamily = "Open Sans",
    range_max = 50, // Max font size
    max_words = 1000, // Max number of words display on the screen
    fillScale = d3.scaleOrdinal(d3.schemeCategory10); // Build a discrete scale of 10 different colors

var words = []; // All possible words

// Filter variables
var ID = 0;
var list_options = [];

// Data lists
var movies = [];
let movies1000 = [];
let attlist = [];

//TODO update list from movies to movies1000
var actorsList = [];
var directorList = []
var writerList = []
var companyList = []
var countryList = []
var genreList = []


let i = 0;

d3.csv("data/movies.csv", function(d) {
    return {
        id: +i++,
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
}).then(function(csv) {    
    movies = csv;
    csv.forEach(function(d,i) {
        words.push({"text": d.name, "size": d.runtime});
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

    words.length = max_words; // Print only max_words words
    // console.log(csv[20]);

    generalSelect();
});
function generalSelect(){
    var li = d3.select("#first_filter").append("li")
                        .attr("class", "w3-display-container")
                        .attr("id", "allInOne");
            
    var typ = li.append("select")
                .attr("id", "select1")
                .attr("class", "type")
                .attr("height", 28)
                .on('change', () => updateSub1({"li": li, "type": typ}))
            
            // Add options into the selector
    typ.selectAll("option")
                .data(["genre", "country", "budget", "gross", "runtime", "score", "votes", "actor", "director", "writer"])
                .enter()
                .append("option")
                .text(function(d){return d;})
                .attr("value", function(d) {return d;});

}
function updateSub1(list_opt){
    var selector = list_opt["type"]

    let select1 = selector.property("value");

    switch (select1) {
        case "budget": case "gross": case "runtime": case "score": case "votes":
            updateSlider(list_opt);
            break;
        case "genre": case "country":
            updateDblSelectList(list_opt)
            break;
        case "actor": case "director": case "writer":
            updateNamelist(list_opt)
        default:
            break;
    }
}
function sliders(){ 
    
    var li = d3.select("#first_filter").append("li")
                        .attr("class", "w3-display-container")
                        .attr("id", ID)
                        .text("Filter");

    // Create the type selector (budget, gross, runtime,...)
    var typ = li.append("select")
        .attr("class", "type")
        .on('change', () => updateSlider(list_options[li.property("id")]))
        // .on('change', () => updateSliderView(typ))

    // Add options into the selector
    typ.selectAll("option")
    .data(["budget", "gross", "runtime", "score", "votes"])
    .enter()
    .append("option")
    .text(function(d){return d;})
    .attr("value", function(d) {return d;});


    li.append("text")
    .text("from: ")

    // Initialize the first slider
    let minBudget = d3.min(movies, d => d.budget);
    let maxBudget = d3.max(movies, d => d.budget);

    let val1 = 0, val2 = 0;
    // Create the default slider
    var budget_slider = d3.sliderHorizontal()
        .min(minBudget)
        .max(maxBudget)
        .step(1000000)
        .ticks(5)
        .width(500)
        .displayValue(true)
        .on('onchange', (val) => {
            val1 = val;
            checkVal(val1, val2);
    });
    // Create the svg component for the slider
    var slider_component1 = li.append('svg')
    .attr('width', 700)
    .attr('height', 70)

    // Add the slider into the component
    slider_component1.append('g')
    .attr('transform', 'translate(30,30)')
    .call(budget_slider);

    li.append("text")
    .text("to: ")

    // Create the default slider
    var budget_slider2 = d3.sliderHorizontal()
        .min(minBudget)
        .max(maxBudget)
        .step(1000000)
        .ticks(5)
        .width(500)
        .displayValue(true)
        .on('onchange', (val) => {
            val2 = val;
            checkVal(val1, val2);
    });
    // Create the svg component for the slider
    var slider_component2 = li.append('svg')
    .attr('width', 700)
    .attr('height', 70)

    // Add the slider into the component
    slider_component2.append('g')
    .attr('transform', 'translate(30,30)')
    .call(budget_slider2);

    // Store new selectors
    list_options[ID.toString()] = {"li": li, "type": typ, "slider": [slider_component1, slider_component2]};

    

}
function dblSelect(){
    var li = d3.select("#first_filter").append("li")
                        .attr("class", "w3-display-container")
                        .attr("id", ID);
            

            // Create the type selector (actor, director, writter)
            var typ = li.append("select")
                .attr("id", "mag_select")
                .attr("class", "type")
                .attr("height", 28)
                .on('change', () => updateDblSelectList(list_options[li.property("id")]))
            
            // Add options into the selector
            typ.selectAll("option")
                .data(["genre", "country"])
                .enter()
                .append("option")
                .text(function(d){return d;})
                .attr("value", function(d) {return d;});
            
            
            // Store new selectors
            list_options[ID.toString()] = {"li": li, "type": typ, "name": actorsList};
}
function showCreateMag(){
    var li = d3.select("#second_filter").append("li")
                        .attr("class", "w3-display-container")
                        .attr("id", ID);
            

            // Create the type selector (actor, director, writter)
            var typ = li.append("select")
                .attr("id", "mag_select")
                .attr("class", "type")
                .attr("height", 28)
                .on('change', () => updateNamelist(list_options[li.property("id")]))
            
            // Add options into the selector
            typ.selectAll("option")
                .data(["actor", "director", "writer"])
                .enter()
                .append("option")
                .text(function(d){return d;})
                .attr("value", function(d) {return d;});
            
            var search_div = li.append("div")

            var namelist = search_div.append("input")
                           .attr("type", "text")
                           .attr("placeholder", "Enter the name...")
                           .on("click", function (e) { d3.selectAll(".autocomp_box").style("display", "none"); 
                                                        li.select(".autocomp_box").style("display", "block"); 
                                                        autocomp(e, autocomp_box, list_options[li.property("id")]);
                        })
                           .on("keyup", (e) => autocomp(e, autocomp_box, list_options[li.property("id")]))
            
            var autocomp_box = search_div.append("div")
                                        .attr("class", "autocomp_box")
                                        .style("display", "none")

            li.append("span")
                .attr("class", "w3-button w3-display-right")
                .on("click", function() { li.style("display", "none"); delete list_options[li.property("id")];})
                .text("x")

            // Store new selectors
            list_options[ID.toString()] = {"li": li, "type": typ, "name": actorsList};
}

function checkVal(val1, val2){
    let nextbtn = document.getElementById("next");

    if(val1 > val2){
        // console.log("val1 > val2");
        nextbtn.disabled = true;
        return null;
    } else{
        let data = [];
        for(let i = 0; i < movies.length; i++){
            if(movies[i].budget >= val1 && movies[i].budget <= val2){
                data.push(movies[i]);
            }
        }

        if(data.length < max_words){
            nextbtn.removeAttribute("disabled");
            nextbtn.innerHTML = "create a magnet map with " + data.length + " nodes";
        }else{
            nextbtn.disabled = true;
            nextbtn.innerHTML = "can't create a magnet map with " + data.length + " nodes";
        }

        movies1000 = data;
    }
    
    
}

function createMap(){ 
    console.log(movies1000);
    alert("createmap")
    showCreateMag();
}

function createMag(){ 
    let magSel = d3.select("#mag_select").property("value");
    let magInput = d3.select("input").property("value");
    
    movies1000.forEach(function(d,i) {
        switch(magSel){
            case "director" :
                if(d.director === magInput){
                attlist.push(d.id);
                break;
            }
            case "actor" :
                if(d.actor === magInput){
                attlist.push(d.id);
                break;
            }

        }
    });

    console.log(attlist);
    alert("createmag")
}

function showCreateMag(){
    var li = d3.select("#second_filter").append("li")
                        .attr("class", "w3-display-container")
                        .attr("id", ID);
            

            // Create the type selector (actor, director, writter)
            var typ = li.append("select")
                .attr("id", "mag_select")
                .attr("class", "type")
                .attr("height", 28)
                .on('change', () => updateNamelist(list_options[li.property("id")]))
            
            // Add options into the selector
            typ.selectAll("option")
                .data(["actor", "director", "writer"])
                .enter()
                .append("option")
                .text(function(d){return d;})
                .attr("value", function(d) {return d;});
            
            var search_div = li.append("div")

            var namelist = search_div.append("input")
                           .attr("type", "text")
                           .attr("placeholder", "Enter the name...")
                           .on("click", function (e) { d3.selectAll(".autocomp_box").style("display", "none"); 
                                                        li.select(".autocomp_box").style("display", "block"); 
                                                        autocomp(e, autocomp_box, list_options[li.property("id")]);
                        })
                           .on("keyup", (e) => autocomp(e, autocomp_box, list_options[li.property("id")]))
            
            var autocomp_box = search_div.append("div")
                                        .attr("class", "autocomp_box")
                                        .style("display", "none")

            li.append("span")
                .attr("class", "w3-button w3-display-right")
                .on("click", function() { li.style("display", "none"); delete list_options[li.property("id")];})
                .text("x")

            // Store new selectors
            list_options[ID.toString()] = {"li": li, "type": typ, "name": actorsList};
}

function updateSlider(list_opt) {
    // Selector for the type of slider (budget/gross/...)
    var selector = list_opt["type"]

    var lig = list_opt["li"]
    lig.selectAll('span').remove();

    var li = lig.append("span")

    // li.selectAll('text').remove();
    // li.selectAll('svg').remove();

    // Value of the type selector
    console.log(selector.property("value"))
    let value = selector.property("value");

    li.append("text")
    .text("from: ")
    // Create a new svg for the new slider
    let new_slider_component = li.append('svg')
            .attr('width', 700)
            .attr('height', 70)
    
            
    li.append("text")
    .text("to: ")

    let new_slider_component2 = li.append('svg')
            .attr('width', 700)
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
                    checkVal(val1, val2);
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
                    checkVal(val1, val2);
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
                    checkVal(val1, val2);
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
                    checkVal(val1, val2);
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
                    checkVal(val1, val2);
            });
            var new_slider2 = d3.sliderHorizontal()
                .min(minRuntime)
                .max(maxRuntime)
                .step(1)
                .width(500)
                .displayValue(true)
                .on('onchange', (val) => {
                    val2 = val;
                    checkVal(val1, val2);
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
                    checkVal(val1, val2);
                });
            var new_slider2 = d3.sliderHorizontal()
                .min(minScore)
                .max(maxScore)
                .step(1)
                .width(500)
                .displayValue(true)
                .on('onchange', (val) => {
                    val2 = val;
                    checkVal(val1, val2);
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
                    checkVal(val1, val2);
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
                    checkVal(val1, val2);
                });
            break;
        default:
    }

    // Add the slider into the svg component
    new_slider_component.append('g')
                        .attr('transform', 'translate(30,30)')
                        .call(new_slider)
                        // .append('text')
                        // .text('From: ')  

    new_slider_component2.append('g')
                        .attr('transform', 'translate(30,30)')
                        .call(new_slider2) 
                        // .append('text')
                        // .text('To: ')                  

};

function updateDblSelectList(list_opt) {
    // Selector for the type of slider (budget/gross/...)
    var selector = list_opt["type"]
    // li component
    var lig = list_opt["li"]
    lig.selectAll('span').remove();

    var li = lig.append("span")

    
    // li.selectAll('text').remove();
    // li.select('#selectTmp').remove();

    // Value of the type selector
    console.log(selector.property("value"))
    let value = selector.property("value");

    var typ = li.append("select")
    .attr("id", "selectTmp")
    .attr("class", "type")
    .attr("height", 28)
    .on('change', () => {alert("1")})

    // Create the new slider depending on the type value
    switch (value) {
        case "country":
            typ.selectAll("option")
             .data(countryList)
             .enter()
             .append("option")
             .text(function(d){return d;})
             .attr("value", function(d) {return d;});

            break;
        case "genre":
            typ.selectAll("option")
                .data(genreList)
                .enter()
                .append("option")
                .text(function(d){return d;})
                .attr("value", function(d) {return d;});
   
               break;
        
        default:
    }
             

};
function updateNamelist(list_opt) {
    var selector = list_opt["type"]
    var lig = list_opt["li"]
    lig.selectAll('span').remove();

    var li = lig.append("span")

    let value = selector.property("value");

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

    li.append("span")
                .attr("class", "w3-button w3-display-right")
                .on("click", function() { li.style("display", "none"); delete list_opt;})
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

    // console.log(emptyArray);
    emptyArray = emptyArray.map((data)=>{
        autocomp_box.append("li")
                    .attr("class", "autocomp-items")
                    .on("click", function() { e.target.value = data; autocomp_box.selectAll("li").remove(); autocomp_box.style("display", "none"); })
                    .text(data)
    });
}

