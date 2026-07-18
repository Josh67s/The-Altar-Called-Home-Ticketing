import{

auth,

db,

doc,

getDoc,

signInWithEmailAndPassword,

signOut

}

from "./firebase-config.js";

const form=

document.getElementById("loginForm");

const message=

document.getElementById("loginMessage");

const emailInput =
document.getElementById("email");

emailInput.value =
localStorage.getItem("lastEmail") || "";

form.addEventListener(

"submit",

async(e)=>{

e.preventDefault();

message.textContent="";

const loginBtn =
document.getElementById("loginBtn");

const loginText =
document.getElementById("loginText");

const spinner =
document.getElementById("loginSpinner");

loginBtn.disabled = true;

loginText.textContent = "Signing In...";

spinner.classList.remove("hidden");

const email=

document.getElementById("email").value;

const password=

document.getElementById("password").value;

try{

const credential =

await signInWithEmailAndPassword(

auth,

email,

password

);

const user = credential.user;

const staffRef =

doc(

db,

"staff",

user.uid

);

const staffSnap =

await getDoc(staffRef);

if(!staffSnap.exists()){

message.textContent=

"You are not authorized.";

loginBtn.disabled = false;

loginText.textContent = "Login";

spinner.classList.add("hidden");

await signOut(auth);

return;

}

const staff=

staffSnap.data();

if(staff.active!==true){

message.textContent =
"Account disabled.";

loginBtn.disabled = false;

loginText.textContent = "Login";

spinner.classList.add("hidden");

await signOut(auth);

return;

}

if(staff.role==="admin"){

    localStorage.setItem(
"lastEmail",
email
);

window.location="admin.html";

}

else if(staff.role==="usher"){

    localStorage.setItem(
"lastEmail",
email
);

window.location="verify.html";

}

else{

message.textContent =
"Unknown role.";

loginBtn.disabled = false;

loginText.textContent = "Login";

spinner.classList.add("hidden");

await signOut(auth);

return;

}
}

catch(error){

loginBtn.disabled = false;

loginText.textContent = "Login";

spinner.classList.add("hidden");

message.style.color = "#ff5b5b";

switch(error.code){

case "auth/invalid-credential":

message.textContent =
"Incorrect email or password.";

password.value = "";

password.focus();

break;

case "auth/user-disabled":

message.textContent =
"Your account has been disabled.";

break;

case "auth/network-request-failed":

message.textContent =
"No internet connection.";

break;

default:

message.textContent =
"Unable to sign in.";

}

console.error(error);

}

});

const password =

document.getElementById("password");

const toggle =

document.getElementById("togglePassword");

toggle.addEventListener("click",()=>{

if(password.type==="password"){

password.type="text";

toggle.textContent="🙈";

}else{

password.type="password";

toggle.textContent="👁";

}

});