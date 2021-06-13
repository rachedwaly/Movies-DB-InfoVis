var list_sentences = [];
var ID = 0;

var movies = [];

//const minBudget;
//const maxBudget;

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
    console.log(movies.length);
});

function add() {
    console.log(movies[0]);
    var select_value = document.getElementById("preset_sentence").value;
    console.log(select_value);

    if (select_value == 1) {
        list_sentences.push(select_value);

        var li = d3.select("#list_sentences").append("li")
            .attr("id", ID);

        var dropDown = li.append("select")
            .attr("name", "name-list");

        var options = dropDown.selectAll("option")
            .data(d3.map(movies, function(d){return d.company;}))
            .enter()
            .append("option")
            .text(function(d){return d;})
            .attr("value",function(d){return d;});
    }
};

function test() {
    alert("youhou");
}