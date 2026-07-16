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

form.addEventListener(

"submit",

async(e)=>{

e.preventDefault();

message.textContent="";

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

await signOut(auth);

return;

}

const staff=

staffSnap.data();

if(staff.active!==true){

message.textContent=

"Account disabled.";

await signOut(auth);

return;

}

if(staff.role==="admin"){

window.location="admin.html";

}

else if(staff.role==="usher"){

window.location="verify.html";

}

else{

message.textContent=

"Unknown role.";

await auth.signOut();

}
}

catch(error){

message.style.color="#ff5b5b";

message.textContent=

error.message;

console.error(error);

}

});