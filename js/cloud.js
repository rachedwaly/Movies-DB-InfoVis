const width = document.getElementById("container").offsetWidth * 0.95,
    height = 800,
    fontFamily = "Open Sans",
    range_max = 50, // Max font size
    max_words = 100 // Max number of words display on the screen
    
var fillScale;
var fontScale; 

// Filter variables
var ID = 0;
var list_options = [];

// Data lists
var movies = [];
var selected_movies = [];
var actorsList = [];
var directorList = []
var writerList = []
var companyList = []
var countryList = []

//d3.select("body").on("click", function () { d3.selectAll(".autocomp_box").style("display", "none"); })

var svg_g = d3.select("#cloud_container").append("svg") // Ajout d'un élément SVG sur un DIV existant de la page
            .attr("class", "svg")
            .attr("width", width)
            .attr("height", height)
            .append("g") // Ajout du groupe qui contiendra tout les mots
            .attr("transform", "translate(" + width / 2 + ", " + height / 2 + ")") // Centrage du groupe


d3.csv("data/movies.csv", function(d) {
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
        year: +d.year,
        filter: +d.runtime
    };
}).then(function(csv) {    
    movies = csv;
    csv.forEach(function(d,i) {
        //words.push({"movie": d, "name": d.name, "filter": d.runtime});
        actorsList.push(d.star);
        directorList.push(d.director);
        writerList.push(d.writer);
        companyList.push(d.company);
        countryList.push(d.country);
    });

    // Keep unique values
    actorsList = actorsList.filter((v, i, a) => a.indexOf(v) === i);
    directorList = directorList.filter((v, i, a) => a.indexOf(v) === i);
    writerList = writerList.filter((v, i, a) => a.indexOf(v) === i);
    companyList = companyList.filter((v, i, a) => a.indexOf(v) === i);
    countryList = countryList.filter((v, i, a) => a.indexOf(v) === i);

    // Sort in alphabetical order
    actorsList.sort();
    directorList.sort();
    writerList.sort();
    companyList.sort();
    countryList.sort();

    //selected_words = [...words];
    //selected_words.length = max_words; // Print only max_words words
    selected_movies = [...movies];
    selected_movies.length = max_words; // Print only max_words words
    console.log(csv[20]);    

    var minSize = d3.min(selected_movies, d => d.filter);
    var maxSize = d3.max(selected_movies, d => d.filter);



    fillScale = d3.scaleLinear().domain([minSize, maxSize])
                    .range(["blue", "red"])

    // Draw the cloud words
    drawcloud(selected_movies, range_max); 
});

// The function looks for the max range of the font that allows the display of all words of tmp_movies
function drawcloud (tmp_movies, rangeMax) { // declare the function
    // Delete the previous cloud if exists
    d3.select("#cloud_container").select("svg").select('g').selectAll('text').remove();

    // Compute our fontScale domain
    /*var minSize = d3.min(selected_movies, d => d.filter);
    console.log(minSize);
    var maxSize = d3.max(selected_movies, d => d.filter);
    console.log(maxSize);*/

    console.log("Run");
    
    fontScale = d3.scaleLinear()
        .domain([0, list_options.filter(Boolean).length]) 
        .range([5, rangeMax]);


    d3.layout.cloud()
        .size([width, height])
        .words(tmp_movies)
        .padding(1)
        .rotate(function() {
            return 0;
        })
        .spiral("archimedean")
        .font(fontFamily)
        .fontSize(d => fontScale(d.filter))
        .text(function(d) { return d.name})
        .on("end", function(output) {
            if (selected_movies.length !== output.length && rangeMax >= 5) {  // compare between input ant output
                var tmp_movies = [];
                // Reload the array with new size
                //movies.forEach(function(e,i) {
                selected_movies.forEach(function(e,i) {
                    //tmp_movies.push({"name": e.name, "filter": e.runtime});
                    tmp_movies.push(e);
                });
                tmp_movies.length = max_words;
                console.log(rangeMax);
                drawcloud (tmp_movies, rangeMax - 5); // call the function recursively
            }
            else { 
                console.log(output.length);
                draw(output); 
            }     // when all words are included, start rendering
        })
        .start();
}


function draw(output) {
    let text = svg_g.selectAll("text")
            .data(output);

    text.enter().append("text") // Ajout de chaque mot avec ses propriétés
                .transition()
                .duration(500)
                .style("font-size", d => d.size + "px")
                .style("font-family", fontFamily)
                .style("fill", d => fillScale(d.filter))
                .attr("text-anchor", "middle")
                .attr("transform", d => "translate(" + [d.x, d.y] + ")rotate(" + d.rotate + ")")
                .text(d => d.name);
    /*text.exit()
        .transition() // and apply changes to all of them
        .duration(500)
        .style("opacity", 0)
        .remove();*/
};


function add() {
    console.log("OK");
    var select_value = document.getElementById("preset_sentence").value;
    console.log(select_value);

    //if (select_value == 1) {
    switch(select_value) {
        case "1":
            // Create a new li
            var li = d3.select("#list_sentences").append("li")
                        .attr("class", "w3-display-container")
                        .attr("id", ID)
                        .text("I want movies with ");
        
            // Create the type selector (budget, gross, runtime,...)
            var typ = li.append("select")
                .attr("class", "type")
                .on('change', function() { updateSlider(list_options[li.property("id")]); 
                                        updateWeights();
                                        drawcloud(selected_movies, range_max)})
            
            // Add options into the selector
            typ.selectAll("option")
                .data(["budget", "gross", "runtime", "score", "votes"])
                .enter()
                .append("option")
                .text(function(d){return d;})
                .attr("value", function(d) {return d;});

            // Create the order selector (higher than, lower than, equals to)
            var order = li.append("select")
                .on('change', function() { updateWeights();
                                        drawcloud(selected_movies, range_max);})
                
            order.selectAll("option")
                .data(["higher than", "equals to", "lower than"])
                .enter()
                .append("option")
                .text(function(d){return d;})
                .attr("value", function(d){return d;});
               
                
            // Initialize the first slider
            let minBudget = d3.min(movies, d => d.budget);
            let maxBudget = d3.max(movies, d => d.budget);
        
            // Create the default slider
            var budget_slider = d3.sliderHorizontal()
                .min(minBudget)
                .max(maxBudget)
                .step(1000000)
                .ticks(5)
                .width(500)
                .displayValue(true)
                .on('onchange', (val) => {
                    list_options[li.property("id")]["slider_value"] = val;
                })
                .on('end', function() { updateWeights(); 
                                        drawcloud(selected_movies, range_max)});

            // Create the svg component for the slider
            var slider_component = li.append('svg')
                .attr('width', 700)
                .attr('height', 70)

            // Add the slider into the component
            slider_component.append('g')
                .attr('transform', 'translate(30,30)')
                .call(budget_slider);
            
            li.append("span")
                .attr("class", "w3-button w3-display-right")
                .on("click", function() { li.style("display", "none"); 
                                        delete list_options[li.property("id")];
                                        updateWeights();
                                        drawcloud(selected_movies, range_max)})
                .text("x")

            // Store new selectors
            list_options[ID.toString()] = {"value": select_value, "li": li, "type": typ, "order": order, "slider": slider_component, "slider_value": budget_slider.value()};
            break;
        case "2":
            // Create a new li
            var li = d3.select("#list_sentences").append("li")
                        .attr("class", "w3-display-container")
                        .attr("id", ID)
                        .text("I'm looking for movies with the ");
            

            // Create the type selector (actor, director, writter)
            var typ = li.append("select")
                .attr("class", "type")
                .attr("height", 28)
                .on('change', function() { updateNamelist(list_options[li.property("id")]);
                                            namelist.property("value", "");
                                            updateWeights();
                                            drawcloud(selected_movies, range_max)})
            
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
                .on("click", function() { li.style("display", "none"); 
                                        delete list_options[li.property("id")];
                                        updateWeights();
                                        drawcloud(selected_movies, range_max)})
                .text("x")

            // Store new selectors
            list_options[ID.toString()] = {"value": select_value, "li": li, "type": typ, "name": actorsList};
            break;
        case "3":
            // Create a new li
            var li = d3.select("#list_sentences").append("li")
                        .attr("class", "w3-display-container")
                        .attr("id", ID)
                        .text("I want movies from the ");
           

           // Create the type selector (actor, director, writter)
           var typ = li.append("select")
               .attr("class", "type")
               .attr("height", 28)
               .on('change', function() { updateNamelist(list_options[li.property("id")]);
                                            namelist.property("value", "");
                                            updateWeights();
                                            drawcloud(selected_movies, range_max)})
           
           // Add options into the selector
           typ.selectAll("option")
               .data(["company", "country"])
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
               .on("click", function() { li.style("display", "none"); 
                                        delete list_options[li.property("id")];
                                        updateWeights();
                                        drawcloud(selected_movies, range_max)})
               .text("x")

           // Store new selectors
           list_options[ID.toString()] = {"value": select_value, "li": li, "type": typ, "name": companyList};
           break;
    }
    // Increment the id variable
    ID += 1
              
        /*var options = dropDown.selectAll("option")
            .data(d3.map(movies, function(d){return d.company;}).values())
            .enter()
            .append("option")
            .text(function(d){return d;})
            .attr("value",function(d){return d;});*/
};

function updateSlider(list_opt) {
    // Selector for the type of slider (budget/gross/...)
    var selector = list_opt["type"]
    // li component
    var li = list_opt["li"]

    // Value of the type selector
    let value = selector.property("value");

    // Remove the previous svg component (for the slider)
    list_opt["slider"].remove();

    // Create a new svg for the new slider
    let new_slider_component = li.append('svg')
            .attr('width', 700)
            .attr('height', 70)

    // Uodate the dict
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
                })
                .on('end', function() { updateWeights();
                                        drawcloud(selected_movies, range_max)});
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
                })
                .on('end', function() { updateWeights();
                                        drawcloud(selected_movies, range_max)});
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
                })
                .on('end', function() { updateWeights();
                                        drawcloud(selected_movies, range_max)});
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
                })
                .on('end', function() { updateWeights();
                                        drawcloud(selected_movies, range_max)});
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
                })
                .on('end', function() { updateWeights();
                                        drawcloud(selected_movies, range_max)});
            break;
        default:
    }

    // Add the slider into the svg component
    new_slider_component.append('g')
                        .attr('transform', 'translate(30,30)')
                        .call(new_slider);

};

function updateNamelist(list_opt) {
     // Selector for the type of slider (budget/gross/...)
     var selector = list_opt["type"]

     // Value of the type selector
    console.log(selector.property("value"))
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
}



function autocomp(e, autocomp_box, list_opt) {
    autocomp_box.selectAll("li").remove();
    let userData = e.target.value; //user entered data
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

    emptyArray = emptyArray.map((data)=>{
        autocomp_box.append("li")
                    .attr("class", "autocomp-items")
                    .on("click", function() { e.target.value = data; 
                                            autocomp_box.selectAll("li").remove(); 
                                            autocomp_box.style("display", "none"); 
                                            updateWeights(); 
                                            drawcloud(selected_movies, range_max)})
                    .text(data)
    });
}

function updateWeights() {
    // Reinitialize filter weights
    d3.map(movies, function(d){d.filter = 0;})

    console.log("Update Weights");

    let typ;
    for (var key in list_options){
        var li_param = list_options[key];

        switch (li_param["value"]) {
            case "1":
                //"type": typ, "order": order, "slider": slider_component
                typ = li_param["type"]
                let order = li_param["order"]
                let slider = li_param["slider"]

                //var selected_movies = [];
                
                if (typ.property("value") == "budget") {
                    if (order.property("value") ==  "higher than") {
                        d3.map(movies.filter(function(d){ return d.budget > li_param["slider_value"] }), function(d) {d.filter += 1})
                    } else if (order.property("value") ==  "equals to") {
                        d3.map(movies.filter(function(d){ return d.budget == li_param["slider_value"] }), function(d) {d.filter += 1})
                    } else {
                        d3.map(movies.filter(function(d){ return d.budget < li_param["slider_value"] }), function(d) {d.filter += 1})
                    }
                }

                if (typ.property("value") == "gross") {
                    if (order.property("value") ==  "higher than") {
                        d3.map(movies.filter(function(d){ return d.gross > li_param["slider_value"] }), function(d) {d.filter += 1})
                    } else if (order.property("value") ==  "equals to") {
                        d3.map(movies.filter(function(d){ return d.gross == li_param["slider_value"] }), function(d) {d.filter += 1})
                    } else {
                        d3.map(movies.filter(function(d){ return d.gross < li_param["slider_value"] }), function(d) {d.filter += 1})
                    }
                }

                if (typ.property("value") == "runtime") {
                    if (order.property("value") ==  "higher than") {
                        d3.map(movies.filter(function(d){ return d.runtime > li_param["slider_value"] }), function(d) {d.filter += 1})
                    } else if (order.property("value") ==  "equals to") {
                        d3.map(movies.filter(function(d){ return d.runtime == li_param["slider_value"] }), function(d) {d.filter += 1})
                    } else {
                        d3.map(movies.filter(function(d){ return d.runtime < li_param["slider_value"] }), function(d) {d.filter += 1})
                    }
                }

                if (typ.property("value") == "score") {
                    if (order.property("value") ==  "higher than") {
                        d3.map(movies.filter(function(d){ return d.score> li_param["slider_value"] }), function(d) {d.filter += 1})
                    } else if (order.property("value") ==  "equals to") {
                        d3.map(movies.filter(function(d){ return d.score == li_param["slider_value"] }), function(d) {d.filter += 1})
                    } else {
                        d3.map(movies.filter(function(d){ return d.score < li_param["slider_value"] }), function(d) {d.filter += 1})
                    }
                }

                if (typ.property("value") == "votes") {
                    if (order.property("value") ==  "higher than") {
                        d3.map(movies.filter(function(d){ return d.votes > li_param["slider_value"] }), function(d) {d.filter += 1})
                    } else if (order.property("value") ==  "equals to") {
                        d3.map(movies.filter(function(d){ return d.votes == li_param["slider_value"] }), function(d) {d.filter += 1})
                    } else {
                        d3.map(movies.filter(function(d){ return d.votes < li_param["slider_value"] }), function(d) {d.filter += 1})
                    }
                }

                break;
            case "2":
            case "3":
                typ = li_param["type"];
                let li = li_param["li"];
                let name = li.select("input").property("value");

                //console.log(name);
                if (typ.property("value") == "actor") {
                    d3.map(movies.filter(function(d){ return d.star == name }), function(d) {d.filter += 1})
                } else if (typ.property("value") == "director") {
                    d3.map(movies.filter(function(d){ return d.director == name }), function(d) {d.filter += 1})
                } else if (typ.property("value") == "writer") {
                    d3.map(movies.filter(function(d){ return d.writer == name }), function(d) {d.filter += 1})
                } else if (typ.property("value") == "company") {
                    d3.map(movies.filter(function(d){ return d.company == name }), function(d) {d.filter += 1})
                } else if (typ.property("value") == "country") {
                    d3.map(movies.filter(function(d){ return d.country == name }), function(d) {d.filter += 1})
                }

            
                break;
        }

        selected_movies = [...movies.sort((a, b) => d3.descending(a.filter, b.filter))]
        selected_movies.length = max_words;

        fillScale = d3.scaleLinear().domain([0, list_options.filter(Boolean).length])
                    .range(["blue", "red"])

        fontScale = d3.scaleLinear()
                    .domain([0, list_options.filter(Boolean).length]) 
                    .range([5, range_max]);

    }
}
