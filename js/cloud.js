const width = document.getElementById("container").offsetWidth * 0.95,
    height = 500,
    fontFamily = "Open Sans",
    range_max = 50, // Max font size
    max_words = 300, // Max number of words display on the screen
    fillScale = d3.scaleOrdinal(d3.schemeCategory10); // Build a discrete scale of 10 different colors

var words = []; // All possible words
var selected_words = [] // Words to print (STILL UNUSED)

var fontScale = d3.scaleLinear().range([5, range_max]); 

// Filter variables
var movies = [];
var ID = 0;
var list_options = [];


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
        year: +d.year
    };
}).then(function(csv) {    
    movies = csv;
    csv.forEach(function(d,i) {
        words.push({"text": d.name, "size": d.runtime});
    });
    words.length = max_words; // Print only max_words words
    console.log(csv[20]);

    // Compute our fontScale domain
    let minSize = d3.min(words, d => d.size);
    console.log(minSize);
    let maxSize = d3.max(words, d => d.size);
    console.log(maxSize);

    // The function looks for the max range of the font that allows the display of all words of tmp_words
    function drawcloud (tmp_words, rangeMax) { // declare the function
        console.log("Run");
        fontScale = d3.scaleLinear()
            .domain([minSize, maxSize]) 
            .range([5, rangeMax]); // the argument here 

        d3.layout.cloud()
            .size([width, height])
            .words(tmp_words)
            .padding(1)
            .rotate(function() {
                return 0;
            })
            .spiral("archimedean")
            .font(fontFamily)
            .fontSize(d => fontScale(d.size))
            .on("end", function(output) {
                if (words.length !== output.length && rangeMax >= 5) {  // compare between input ant output
                    var tmp_words = [];
                    // Reload the array with new size
                    csv.forEach(function(e,i) {
                        tmp_words.push({"text": e.name, "size": e.runtime});
                    });
                    tmp_words.length = max_words;
                    console.log(rangeMax);
                    drawcloud (tmp_words, rangeMax - 5); // call the function recursively
                }
                else { 
                    console.log(output.length);
                    draw(output); 
                }     // when all words are included, start rendering
            })
            .start();
    }
    drawcloud(words, range_max); // For now we use words
});


function draw(output) {
    d3.select("#cloud_container").append("svg") // Ajout d'un élément SVG sur un DIV existant de la page
        .attr("class", "svg")
        .attr("width", width)
        .attr("height", height)
        .append("g") // Ajout du groupe qui contiendra tout les mots
            .attr("transform", "translate(" + width / 2 + ", " + height / 2 + ")") // Centrage du groupe
            .selectAll("text")
            .data(output)
            .enter().append("text") // Ajout de chaque mot avec ses propriétés
                .style("font-size", d => d.size + "px")
                .style("font-family", fontFamily)
                .style("fill", d => fillScale(d.size))
                .attr("text-anchor", "middle")
                .attr("transform", d => "translate(" + [d.x, d.y] + ")rotate(" + d.rotate + ")")
                .text(d => d.text);
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
                .on('change', () => updateSlider(list_options[li.property("id")]))
            
            // Add options into the selector
            typ.selectAll("option")
                .data(["budget", "gross", "runtime", "score", "votes"])
                .enter()
                .append("option")
                .text(function(d){return d;})
                .attr("value", function(d) {return d;});

            // Create the order selector (higher than, lower than, equals to)
            var order = li.append("select")
                .selectAll("option")
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
            });

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
                .on("click", function() { li.style("display", "none"); delete list_options[li.property("id")];})
                .text("x")

            // Store new selectors
            list_options[ID.toString()] = {"value": select_value, "li": li, "type": typ, "order": order, "slider": slider_component};
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
                            .on("click", () => d3.selectAll(".autocomp_box").style("display", "none"))
                            .on("keyup", (e) => autocomp(e, autocomp_box))
            
            var autocomp_box = search_div.append("div")
                                        .attr("class", "autocomp_box")
                                        .style("display", "none")

            li.append("span")
                .attr("class", "w3-button w3-display-right")
                .on("click", function() { li.style("display", "none"); delete list_options[li.property("id")];})
                .text("x")

            // Store new selectors
            list_options[ID.toString()] = {"value": select_value, "li": li, "type": typ, "name": namelist};
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
    console.log(selector.property("value"))
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
                });
            break;
        default:
    }

    // Add the slider into the svg component
    new_slider_component.append('g')
                        .attr('transform', 'translate(30,30)')
                        .call(new_slider);

};

function updateNamelist(list_opt) {

}



function autocomp(e, autocomp_box) {
    autocomp_box.selectAll("li").remove();
    let userData = e.target.value; //user enetered data
    let emptyArray = [];

    let suggestions = ["arbre", "abricot", "bol"];

    if(userData != ""){
     
        emptyArray = suggestions.filter((data)=>{
            //filtering array value and user characters to lowercase and return only those words which are start with user enetered chars
            return data.toLocaleLowerCase().startsWith(userData.toLocaleLowerCase()); 
        });
        console.log(emptyArray)
        emptyArray = emptyArray.map((data)=>{
            autocomp_box.append("li")
                        .on("click", function() { e.target.value = data; autocomp_box.selectAll("li").remove() })
                        .text(data)
        });
        autocomp_box.style("display", "block") //show autocomplete box
    } else{
        autocomp_box.style("display", "none") //hide autocomplete box
    }
}

