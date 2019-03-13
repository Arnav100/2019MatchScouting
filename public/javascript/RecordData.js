var teamNum;
var event;
var match;

document.addEventListener("DOMContentLoaded", event =>{
  $("#submit").on("click", async function(){
    console.log("submit clicked");
    var newData = record();
    var updatedData = await getCurrentData(newData); 
    updateFirebase(updatedData);
  });
  
});

function updateFirebase(update)
{
  update = convertToSendableData(update);
  console.log(update);

  db.collection("Teams").doc(teamNum).collection(event).doc(match).update(update);
}

function record()
{
  var dataValues = new Array(17);
  $(".record").each(function (index) {
    console.log(index + ": " + $(this).val() + "  " + $(this).attr('id') + " " + $(this).attr('data-record'));
    var i = $(this).attr('data-record') -1;
    var val = $(this).val();
    if(val == "on")
      val = $(this).is(":checked");
    else
      val = parseInt(val, 10);
    dataValues[i] = val;
  });
  return dataValues;

}

async function getUserPersonalData(newData)
{
//   teamNum = $("#teamNum").val();
//   event = $('#event option:selected').text();
//   match = $('#match option:selected').text();
//   var eventKey;
//  await db.collection("Teams").doc(teamNum).get()
//   .then(snap => {
//     var i = snap.data().collectionNames.indexOf(event)
//     eventKey = snap.data().keys[i];
//   })

//   var matchId = teamNum + " " + eventKey + " " + match;

  //console.log(matchId);

 var empty =  makeEmptyMatchData();
alphabetize(empty);

//  console.log(JSON.stringify(empty));
//   var record = convertToRecordableData(empty);
//   recordData(record, newData, 0);
//   var final = convertToSendableData(record);
//   console.log("final is: ");
//   console.log(final);

}

async function getCurrentData(newData)
{
  console.log("getting data");

   teamNum = $("#teamNum").val();
   event = $('#event option:selected').text();
   match = $('#match option:selected').text();

  var data;
  await db.collection("Teams").doc(teamNum).collection(event).doc(match).get()
  .then(async snap =>{
    console.log("Current Data recieved")
   await console.log(snap.data());
     data = await snap.data();
  })

  console.log("Pulled Data");
  var recordableData = convertToRecordableData(data)

  recordData(recordableData, newData, 0);
  
  return recordableData;
}

function addNewData(currentData, newData)
{
  console.log(currentData);
  var updated = recordData(currentData, newData);
  console.log(updated);
}