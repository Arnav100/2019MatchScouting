var checkedBlueAlliance = false;
document.addEventListener("DOMContentLoaded", event =>{
    console.log("Running");

   $("#teamNumButton").on("click", function () {
       if (!currentUser) {
           $('#invalid').text("Need To Sign In to scout");
           $('#teamNum').addClass("is-invalid");
           return;
       }
        var teamNum = $("#teamNum").val();
        checkedBlueAlliance = false;
        team = db.collection("Teams").doc(teamNum);
        reset();
        getChoices(teamNum);
    }) 

    $("#event").change(function(){
        displayMatches();
    })
    $('#match').change(function () {
        $('#form').removeClass('hidden');
        resetForm();
    });
    $(".field button").on("click", function () {

        var type = $(this).text();
        var input = $(this).parent().parent().find("input");
        var inputVal = $(input).val();
        if (type == "-" && inputVal != "0")
            input.val(parseInt(inputVal) - 1);
        else if (type == "+")
            input.val(parseInt(inputVal) + 1);
    });
})

function resetForm()
{
    $(".record").each(function (index) {
        var val = $(this).val();
        if (val == "on")
            val = $(this).prop("checked", false);
        else if ($(this).attr('id') == "climbLevel" || $(this).attr('id') == "attempt" )
            $(this).val(1);
        else
            $(this).val(0);
    });
}


function getChoices(teamNum) {
    console.log("getting choices");
    team.get()
        .then(async snap => {
            $('#teamNum').removeClass("is-invalid");
            //Get event if snap does not exist
            if (!snap.exists) {
                console.log("Team Not in database");
                checkedBlueAlliance = true;
               await getEvents(teamNum)
                    .then(async ret => {
                        await sendToFirebase(ret);
                        getChoices();
                    })
                   .catch(async err => {
                       $('#invalid').text(err);
                       $('#teamNum').addClass("is-invalid");
                    })
            }
            else
            {
                console.log("Team exists");
                $('#match').parent().parent().parent().addClass("hidden");
                $('#form').addClass('hidden');
                $('#event').text("");
                $('#event').append("<option disabled selected value> -- select an option -- </option>");
                $('#match').text("");
                $('#match').append("<option disabled selected value> -- select an option -- </option>");
                $("#event").parent().parent().parent().removeClass("hidden");
                snap.data().collectionNames.forEach(function (event) {
                    $('#event').append("<option>" + event + "</option>");
                });
            }
        })
}
/**
 * Displays the match options, only the matches the user hasn't scouted
 */
function displayMatches() {
    $('#match').text("");
    $('#match').append("<option disabled selected value> -- select an option -- </option>");
    $('#match').parent().parent().parent().removeClass("hidden");
    $('#form').addClass('hidden');

    var collectionName = $('#event option:selected').text();
    var teamNum = $('#teamNum').val();
    team.collection(collectionName).get()
        .then(snap => {
            
            snap.docs.forEach(function (match) {
             /*   if (userData.matchesScouted.includes(teamNum + match.data().key))
                    return; */
                console.log(match.id);
                console.log(snap.size + " " + checkedBlueAlliance);
                //If the match is a practice match, and that is the only thing, and blue alliance hasn't already been checked
                //Check to see for update
                if (match.id == "PracticeMatch" && snap.size == 1 && !checkedBlueAlliance)
                {
                    checkedBlueAlliance = true;
                    console.log("geting events");
                    getEvents(teamNum)
                    .then(ret=>{
                        
                        sendToFirebase(ret);
                        displayMatches();
                    })
                    .catch(err =>{
                        
                    })
                }
                else
                    $('#match').append("<option>" + match.id + "</option>");
            });
        })
}