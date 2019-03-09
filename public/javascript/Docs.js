var teamNum;
// Client ID and API key from the Developer Console
var CLIENT_ID = '804985057161-mvuntk7e9qf6rfmui59q6v9jull2b7fb.apps.googleusercontent.com ';
var API_KEY = 'AIzaSyBY-3H966nbCQ20tR1CXWsecQRfLadEsGM';
var SPREADSHEET = '1EqBmUZnEssyDzMkaBlIaiSf_lweFg9ZRLL4tEwIOtq4';
// Array of API discovery doc URLs for APIs used by the quickstart
var DISCOVERY_DOCS = ["https://sheets.googleapis.com/$discovery/rest?version=v4"];

// Authorization scopes required by the API; multiple scopes can be
// included, separated by spaces.
var SCOPES = "https://www.googleapis.com/auth/spreadsheets";
document.addEventListener("DOMContentLoaded", async event => {
    await handleClientLoad();
    $('#teamNumButton').on("click", function () {
        teamNum = $('#teamNum').val();
        displayEvents(teamNum);
    })
    $("#event").change(function () {
        displayMatches(teamNum);
    })
    $('#displayBtn').on("click", displayData);
    $('#send').on("click", sendToGoogle);
});

/**
 *  On load, called to load the auth2 library and API client library.
 */
async function handleClientLoad() {
    await gapi.load('client:auth2', await initClient);
}
/**
 *  Initializes the API client library and sets up sign-in state
 *  listeners.
 */
async function initClient() {
    await gapi.client.init({
        apiKey: API_KEY,
        clientId: CLIENT_ID,
        discoveryDocs: DISCOVERY_DOCS,
        scope: SCOPES
    }).then(async function () {
        console.log("Loaded Client");
        // Listen for sign-in state changes.
        gapi.auth2.getAuthInstance().isSignedIn.listen(updateSigninStatus);

        // Handle the initial sign-in state.
        updateSigninStatus(gapi.auth2.getAuthInstance().isSignedIn.get());
    }, function (error) {
        console.log(error);
    });
}

function updateSigninStatus(isSignedIn) {
    //if(isSignedIn)
    //   makeApiCall();
}

/**
 *  Sign in the user upon button click.
 */
function handleAuthClick(event) {
    gapi.auth2.getAuthInstance().signIn();
}

/**
 *  Sign out the user upon button click.
 */
function handleSignoutClick(event) {
    gapi.auth2.getAuthInstance().signOut();
}
function displayEvents(teamNum) {
    console.log("getting events");
    $('#teamNum').removeClass("is-invalid");
    db.collection("Teams").doc(teamNum).get()
        .then(snap => {
            $('#event').text("");
            $('#event').append("<option disabled selected value> -- select an option -- </option>");
            $('#match').text("");
            $('#match').append("<option disabled selected value> -- select an option -- </option>");
            snap.data().collectionNames.forEach(function (event) {
                $('#event').append("<option>" + event + "</option>");
            })
        })
        .catch(err => {
            $("#invalid").text(err);
            $('#teamNum').addClass("is-invalid");
        })
}

function displayMatches(teamNum) {
    $('#match').text("");
    $('#match').append("<option disabled selected value> -- select an option -- </option>");
    $('#match').parent().parent().parent().removeClass("hidden");
    $('#form').addClass('hidden');

    var collectionName = $('#event option:selected').text();
    db.collection("Teams").doc(teamNum).collection(collectionName).get()
        .then(snap => {
            snap.docs.forEach(function (match) {
                $('#match').append("<option>" + match.id + "</option>");
            });
        })
}

function displayData() {
    console.log("displaying data")
   var teamNum = $('#teamNum').val();
    var collectionName = $('#event option:selected').text();
    var match = $('#match option:selected').text();
    $("#team").text(teamNum);
    $("#eventName").text(collectionName);
    $("#matchNum").text(match);

    db.collection("Teams").doc(teamNum).collection(collectionName).doc(match).get()
        .then(snap => {
            console.log("got data");
                var data = snap.data();
                var displayData = convertToRecordableData(data);
                console.log(displayData);
            $(".autoTable").each(function (index) {
                    var id = $(this).attr('id')
                    if(!id)
                        return;
                    var value = displayData['auto'][id].getValue();
                    if(value == true)
                        value = 1;
                    else if(value == false)
                        value = 0;
                    $(this).text(value);
                })
                $(".teleTable").each(function(index){
                    var ids = $(this).attr('id').split('_');
                    if (!ids)
                        return;
                    var value = displayData['teleop'];
                    for(var i = 0; i < ids.length; i ++)
                        value = value[ids[i]];
                    
                    value = value.getValue();
                    if(value == true)
                        value = 1;
                    else if(value == false)
                        value = 0;
                    $(this).text(value);
                })
        })
}

async function sendToGoogle()
{
    var vals = [];
    $("#data").children("td").each(function(index){
        console.log();
        var newVal = parseInt($(this).text());
        if(!newVal)
            newVal = $(this).text();
        console.log(newVal);
        vals.push([newVal]);
    })
    console.log(vals);
    var col = await findEmptyColumn();
    
    col = String.fromCharCode(col + 65);
    console.log("col: " + col);
    var params = {
        // The ID of the spreadsheet to update.
        spreadsheetId: SPREADSHEET,  // TODO: Update placeholder value.
        // The A1 notation of the values to update.
        range: 'ScoutAppTest!' + col + ":" + col,  // TODO: Update placeholder value.
        // How the input data should be interpreted.
        valueInputOption: 'RAW',  // TODO: Update placeholder value.
    };
    var valueRangeBody = {
        "values": vals
    };
    var request = gapi.client.sheets.spreadsheets.values.update(params, valueRangeBody);
    request.then(function (response) {
        // TODO: Change code below to process the `response` object:
        console.log(response.result);
    }, function (reason) {
        console.error('error: ' + reason.result.error.message);
    });
}
async function findEmptyColumn() {
    var ret = -1
    console.log(gapi.client);
    await gapi.client.sheets.spreadsheets.values.get({
        "spreadsheetId": SPREADSHEET,
        "range": "ScoutAppTest!1:1",
        "majorDimension": "ROWS"
    })
        .then(await function (response) {

            console.log("Response", response.result.values);
            ret = response.result.values[0].length + 1;
        })
        .catch(err => {
            console.error("Execute error", err)
        });
    return ret;
}