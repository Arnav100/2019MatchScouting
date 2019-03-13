
document.addEventListener("DOMContentLoaded", event => {
    $('#test').on("click", getMatches);
});


async function getMatches()
{
    console.log("Making request");
    var url = 'https://www.thebluealliance.com/api/v3/event/2019qcmo/matches/simple';
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
                throw "No data Recieved";

            console.log("Getting all Matches");
            console.log(data);
            for(var i = 0; i < data.length; i ++)
            {
              //  console.log(data[i]);
                if(data[i].comp_level == 'qm')
                {
                    var teams = {}
                    for (var j = 0; j < data[i].alliances.blue.team_keys.length; j ++)
                        teams[data[i].alliances.blue.team_keys[j].substring(3)] = [];
                    for (var j = 0; j < data[i].alliances.red.team_keys.length; j++)
                        teams[data[i].alliances.red.team_keys[j].substring(3)] = [];
                    var num = "" + data[i].match_number;
                    for (var j = num.length; j < 3; j++) 
                        num = "0" + num;
                    
                    console.log(teams);
                    db.collection('Matches').doc(num).set(teams);
                }
                
            }
        })
        .catch(err => {
            throw err;
        })
}