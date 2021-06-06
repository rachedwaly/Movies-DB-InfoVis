const width = document.getElementById("container").offsetWidth * 0.95,
    height = 500,
    fontFamily = "Open Sans",
    range_max = 50, // Max font size
    max_words = 300, // Max number of words display on the screen
    fillScale = d3.scaleOrdinal(d3.schemeCategory10); // Build a discrete scale of 10 different colors

var words = []; // All possible words
var selected_words = [] // Words to print (STILL UNUSED)

var fontScale = d3.scaleLinear().range([5, range_max]); 

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
    
    csv.forEach(function(d,i) {
        words.push({"text": d.name, "size": d.score});
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
                        tmp_words.push({"text": e.name, "size": +e.score});
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
}

