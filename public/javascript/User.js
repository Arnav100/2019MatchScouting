var test = "Hello World!"
var currentUser;
var userRef;
var userData;

document.addEventListener("DOMContentLoaded", event => {
    console.log("User stuff is running");
    $("#switchToSignUp").on("click", function(){
        console.log("clicked!");
        $("#signInForm").addClass("disappear");
        $("#signUp").removeClass("disappear");
    });
    $("#switchToSignIn").on("click", function () {
        console.log("clicked!");
        $("#signUp").addClass("disappear");
        $("#signInForm").removeClass("disappear");
    });
    $("#makeAccount").on("click", createAccount);
    $("#signInButton").on("click", signIn);
    checkForUser();
});

async function createAccount()
{
    $("#newTeamNum").removeClass("is-invalid");
    $("#newEmail").removeClass("is-invalid");
    var email = $("#newEmail").val();
    var password = $("#newPassword").val();
    var teamNum = $("#newTeamNum").val();
    var name = $("#newName").val();
    console.log("shhh, password is " + password);

    console.log("Printed");
    try
    {
    await checkInDataBase(teamNum)
    }
   catch(err) {
       $("#invalidTeam").text(err);
        $("#newTeamNum").addClass("is-invalid");
        return;
   }

    firebase.auth().createUserWithEmailAndPassword(email, password)
    .then(async ret => {
        console.log("Yay");
        console.log(ret);
        console.log(ret.user.uid);
        
        var userData = makeEmptyUserData();
  
        userData.team = teamNum;
        userData.name = name;
       await ret.user.updateProfile({
           displayName : name
       })
       await db.collection("Users").doc(ret.user.uid).set(userData);
       await  db.collection("Teams").doc(teamNum).get()
        .then(async snap =>{
            console.log(snap.data());
            var data = snap.data();
            data.members.push(ret.user.uid);
           await  db.collection("Teams").doc(teamNum).set(data);
        })

         if (document.location.pathname == "/signIn.html")
            {
                console.log("sending away");
                window.location.href = "index.html"
            }
    })
    .catch(function (error) {
        // Handle Errors here.
        var errorMessage = error.message;
        console.log("Error: " + errorMessage);
        $("#invalidEmail").text(errorMessage);
        $("#newEmail").addClass("is-invalid");
    })
}




function signIn()
{
    var email = $("#inputEmail").val();
    var password = $("#inputPassword").val();
    firebase.auth().signInWithEmailAndPassword(email, password)
    .then(ret =>{
        console.log("log in successful");
        if (document.location.pathname == "/signIn.html") {
            console.log("sending away");
            window.location.href = "index.html"
        }
    })
    .catch(function (error) {
        // Handle Errors here.
        var errorCode = error.code;
        var errorMessage = error.message;
        console.log(errorMessage);
        // ...
    });
}

function signOut()
{
    firebase.auth().signOut().then(function () {
        console.log('Signed Out');
    }, function (error) {
        console.error('Sign Out Error', error);
    });
}

/**
 * Gets the user's data, makes new user if it currently doesn't exist
 */
// async function getUserRef() {
//     userRef = db.collection("Users").doc(currentUser.uid);
//     await userRef.get()
//         .then(async snap => {
//             if (!snap.exists) {
//                 console.log("User currently not in database");
//                 var emptyData = getEmptyUserData()

//                 userRef.set(emptyData);
//                 getUserRef();
//             }
//             else
//                 userData = await snap.data();
//         })
// }

// /**
//  * Updates the user's data
//  */
// function setUserData() {
//     db.collection("Users").doc(currentUser.uid).update(userData);
// }

// /**
//  * Removes the given team from the list
//  */
// function removeFromTeamList(team) {
//     var i = userData.teamList.indexOf(team);
//     userData.teamList.splice(i, 1);
// }

// /**
//  * Logs in the user
//  */
// function googleLogin() {
//     const provider = new firebase.auth.GoogleAuthProvider();
//     firebase.auth().setPersistence(firebase.auth.Auth.Persistence.SESSION)
//         .then(function () {
//             firebase.auth().signInWithRedirect(provider);
//             firebase.auth().getRedirectResult()
//                 .then(result => {
//                     console.log("signed in");
//                     currentUser = result.user;
//                     loginToggle();
//                 })
//                 .catch(err => {
//                     console.log(err);
//                 });
//         })
// }

// /**
//  * Signs out the user
//  */
// function googleLogout() {
//     firebase.auth().signOut().then(function () {
//         console.log('Signed Out');
//         currentUser = null;
//         loginToggle();
//     }, function (error) {
//         console.error('Sign Out Error', error);
//     });
// }

/**
 * Toggles between the sign in or sign out, depending on if currentUser exists
 */
function loginToggle() {
    if (currentUser) {
        console.log("Switching to sign out");
        $('#signIn').text("Sign Out");
        $("#signIn a").attr('href', "");
        $('#signIn').attr('id', 'signOut');
       $('#signOut').on("click", signOut);
    }
    else {
        console.log("Switching to sign in");
        $('#signOut').html("<a href = 'signIn.html'>Sign In</a>");
     //   $("#signOut a").attr('href', "signIn.html");
        $('#signOut').attr('id', 'signIn');
 //       $('#signIn').on("click", googleLogin);
        
    }
}

/**
 * Checks if user is signed in and gets data.
 */
function checkForUser() {
    firebase.auth().onAuthStateChanged(async function (user) {

        if (user) {
            // User is signed in.
            currentUser = user;
            loginToggle();
            console.log(user.displayName + " is signed in");
        //    if (userData == null)
            //    await getUserRef();

        } else {
            console.log("USER IS SIGNED OUT");
            currentUser = user;
            loginToggle();
        }
        //This code is to run for the My List page, this is so that the list is made after 
        //Checking if the user is signed in.
     //   if (document.location.pathname == "/list.html")
           // makeUserList();
    });
}