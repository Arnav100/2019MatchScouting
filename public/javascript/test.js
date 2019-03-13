document.addEventListener("DOMContentLoaded", event => {
    displayMatches();
    $('#match').on("change", displayTeams);

    $("#submit").on("click", async function () {
        console.log("submit clicked");
        var auto = record('auto');
        var teleop = record('teleop');
        var data = record('data');
    });
    $('.cargo').on("click", function() {
        var current = $(this).attr("data-click");
        if(current == "0" || !current)
        {
            $(this).attr("data-click", "1");
            $(this).css("background", "green");
        }
        else if(current == "1" && $(this).parent().hasClass("rocket"))
        {
            $(this).attr("data-click", "2");
            $(this).css("background", "purple");
        }
        else
        {
            $(this).attr("data-click", "0");
            $(this).css("background", "orangered");
        }
    });
    $('.hatch').on("click", function() {
        var current = $(this).attr("data-click")
        if (current == "0" || !current) {
            $(this).attr("data-click", "1");
            $(this).css("background", "blue");
        }
        else {
            $(this).attr("data-click", "0");
            $(this).css("background", "yellow");
        }
    })
});

function displayMatches()
{
    db.collection("Matches").get()
    .then(snap => {
        snap.forEach(function(doc){
            $('#match').append("<option>" + doc.id + "</option>");
        })
    })
}

function displayTeams()
{
   var matchNum =  $('#match option:selected').text();
    db.collection("Matches").doc(matchNum).get()
    .then(snap =>{
        var data = snap.data();
        for(var team in data)
            $('#team').append("<option>" + doc.id + "</option>");

    })
    
}

function record(type) {
    console.log(type + "Length of data: " + $("." + type).length)
    var size = 25;
    if(type == 'data')
        size = 5;
    
    var dataValues = new Array(size).fill(0);
    $("." +type).each(function (index) {
        console.log("index: " + index);
        var i = $(this).attr('data-order') - 1;
       
        var val = $(this).val();
        if (val == "on")
            if($(this).is(":checked"))
                val = 1;
            else
                val = 0;
        else
        {
            if (!$(this).attr('data-click'))
                val = 0;
            else 
                val = parseInt($(this).attr('data-click'), 10);
        }
        console.log(i + ": " + val);
        dataValues[i] += val;
    });
    console.log("Data: " + dataValues);
    return dataValues;

}