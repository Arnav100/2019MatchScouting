var team;
var matches =[];
var keys = [];
var events = [];
document.addEventListener("DOMContentLoaded", event =>{

 /*   $("#teamNumButton").on("click", function(){
        var teamNum = $("#teamNum").val();
        team = db.collection("Teams").doc(teamNum);
        getChoices(teamNum);
    }) */
});

async function checkInDataBase(teamNum) {
    team = db.collection("Teams").doc(teamNum); 
   await db.collection("Teams").doc(teamNum).get()
        .then(async snap => {
            if (!snap.exists) {
                console.log("Team Not in database");
                await getEvents(teamNum)
                    .then(async ret => {
                       await sendToFirebase(ret);
                    })
                    .catch(async err => {
                            console.log("Throwing error: " + err)
                            throw err;
                    })
            }
        })
}

function reset()
{
     matches = [];
     keys = [];
     events = [];
}

/**
 * Used for creating teams in database, gets the events the team is participating in
 */
async function getEvents(teamNum) {
    errors = [];

    var url = 'https://www.thebluealliance.com/api/v3/team/frc' + teamNum + '/events/2019';
    await $.ajax({
        url: url,
        headers: {
            'X-TBA-Auth-Key': 'zTWiMdEibkf1pFn7GpzX3jlhaTzVXKmT2QFOxkQVyQWeqtiZ58YKkodGbeKoeIRV'
        },
        method: 'GET',
        dataType: 'json',

    })
        .then(async data => {
            if (data == "")
                throw "Team Is Not Competing in 2019";

            console.log("Getting events");
            for (var i = 0; i < data.length; i++)
                if (data[i].short_name != "")
                    events.push(data[i]);
            for (const event of events) {
                var err = await getMatches(teamNum, event);
                errors.push(err);
            }
        })
        .catch(err => {
            if (typeof err != "string")
                err = "Team Does Not Exist";
            throw err;
        })
    return errors;
}

/**
 * Used for creating teams in database, gets the matches the team is participating in the event
 */
async function getMatches(teamNum, event) {
    var error = 0;

    var key = event.key;
    keys.push(key);
    var url = 'https://www.thebluealliance.com/api/v3/team/frc' + teamNum + '/event/' + key + '/matches';
    await $.ajax({
        url: url,
        headers: {
            'X-TBA-Auth-Key': 'zTWiMdEibkf1pFn7GpzX3jlhaTzVXKmT2QFOxkQVyQWeqtiZ58YKkodGbeKoeIRV'
        },
        method: 'GET',
        dataType: 'json',
    })
    .then(async data =>{
        console.log("Getting matches")
        if (data == "") {
            console.log("Match data not yet made");
            error = -1
            matches.push([]);
            return;
        }
      
        var eventMatches = [];
        for (const match of data) {
            if (match.comp_level == "qm") {
                var num = "" + match.match_number;
                for (var i = num.length; i < 3; i++) {
                    num = "0" + num;
                }
                eventMatches.push(num);
            }
        }
        eventMatches.sort();
        await matches.push(eventMatches);
        error =  2;
    })
    return error;
}

function sendToFirebase(errs) {
    console.log("Sending to firebase");
    var eventNames = [];
    var eventKeys = [];
    for (var i = 0; i < events.length; i++) {
        eventNames.push(events[i].short_name);
        eventKeys.push(events[i].key);
        if(errs[i] == -1)
        {
            var emptyData = makeEmptyMatchData();
            var matchNum = "PracticeMatch";
            team.collection(events[i].short_name).doc(matchNum).set(emptyData);
            continue;
        }
        for (var j = 0; j < matches[i].length; j++) {

            var matchNum = 'match' + matches[i][j];
            var emptyData = makeEmptyMatchData();

            team.collection(events[i].short_name).doc(matchNum).set(emptyData);
        }
    }
    var data = {};
    data['collectionNames'] = eventNames;
    data['keys'] = eventKeys;
    team.set(data);
}