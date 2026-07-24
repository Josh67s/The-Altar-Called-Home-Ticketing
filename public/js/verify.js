import{

    protectPage,
    currentUser

}from "./auth.js";

protectPage("usher");

window.onUserReady = async () => {

    await initialize();
    startScanner();

};

import {

    db,

    functions,

    httpsCallable,

    doc,

    getDoc,

    collection,

    query,

    where,

    getDocs

} from "./firebase-config.js";

console.log("================================");

console.log("TACH Verification System v2");

console.log("================================");

const params =
    new URLSearchParams(window.location.search);

let currentOrderId =
    params.get("id");

const card =
    document.getElementById("verificationCard");

    const searchInput =
document.getElementById("ticketSearch");

const searchBtn =
document.getElementById("searchBtn");


searchBtn.addEventListener(

"click",

manualSearch

);

searchInput.addEventListener(

"keypress",

(e)=>{

if(e.key==="Enter"){

manualSearch();

}

}

);

async function manualSearch(){

const keyword =
searchInput.value.trim();

if(!keyword){

return;

}

card.innerHTML=`

<div class="loading">

<div class="spinner"></div>

<h2>

Searching...

</h2>

</div>

`;

try{

// Search Orders

const orderSnapshot =
await getDocs(collection(db,"orders"));

let foundOrder=null;

orderSnapshot.forEach(doc=>{

const order=doc.data();

if(

doc.id===keyword ||

order.ticketNumber===keyword ||

order.buyer?.name
?.toLowerCase()
.includes(keyword.toLowerCase()) ||

order.buyer?.phone
?.includes(keyword)

){

foundOrder={

id:doc.id,

...order

};

currentOrderId = foundOrder.id;

}

});

if(!foundOrder){

showError(

"Not Found",

"No matching ticket."

);

return;

}

// Find ticket

const ticketQuery=

query(

collection(db,"tickets"),

where(

"orderId",

"==",

foundOrder.id

)

);

const ticketSnap=

await getDocs(ticketQuery);

if(ticketSnap.empty){

showError(

"Ticket Missing",

"No ticket exists."

);

return;

}

renderTicket(

foundOrder,

ticketSnap.docs[0].data()

);

}

catch(error){

console.error(error);

showError(

"Search Failed",

error.message

);

}

}

async function initialize(){

    try{

        await loadTicket();

    }

    catch(error){

        console.error(error);

        showError(

            "Unable to load ticket.",

            "Please check your internet connection."

        );

    }

}

async function loadTicket(){

    if(!currentOrderId){

    return;

}

    const orderRef =
    doc(db,"orders",currentOrderId);

    const orderSnap =
        await getDoc(orderRef);

    if(!orderSnap.exists()){

        showError(

            "Order Not Found",

            "This order does not exist."

        );

        return;

    }

    const order =
        orderSnap.data();

    const ticketQuery =

    query(

        collection(db,"tickets"),

        where("orderId","==",currentOrderId)

    );

    const ticketSnap =
        await getDocs(ticketQuery);

    if(ticketSnap.empty){

        showError(

            "Ticket Not Found",

            "No ticket belongs to this order."

        );

        return;

    }

    const ticket =
        ticketSnap.docs[0].data();

    renderTicket(

        order,

        ticket

    );

}

function capitalize(text){

    if(!text) return "";

    return text.charAt(0).toUpperCase() +

           text.slice(1);

}

function formatDate(timestamp){

    if(!timestamp) return "-";

    const date =
        timestamp.toDate();

    return date.toLocaleString();

}

function showError(title,message){

    card.innerHTML = `

<div class="error">

<h2>

${title}

</h2>

<p>

${message}

</p>

</div>

`;

}

function renderTicket(order, ticket){

    const used =
        ticket.used === true;

    card.innerHTML = `

<div class="verify-header">

    <h1>

        THE ALTAR CALLED HOME

    </h1>

    <p>

        Official Premiere Ticket Verification

    </p>

</div>

<div class="ticket-number">

    ${ticket.ticketNumber}

</div>

<div class="status-wrap">

    <span class="status ${used ? "used" : "valid"}">

        ${used ? "🔴 USED" : "🟢 VALID"}

    </span>

</div>

<div class="details">

    ${createRow(
    "👤 Buyer",
    order.buyer.name
)}

${createRow(
    "📧 Email",
    order.buyer.email
)}

${createRow(
    "📞 Phone",
    order.buyer.phone
)}

${createRow(
    "🎟 Ticket",
    capitalize(order.ticket.type)
)}

${createRow(
    "🎫 Ticket Number",
    ticket.ticketNumber
)}

${createRow(
    "👥 Quantity",
    order.ticket.quantity
)}

${createRow(
    "💰 Amount",
    "₦"+Number(order.totals.total).toLocaleString()
)}

${createRow(
    "💳 Payment",
    "<span class='paid'>✔ Paid</span>"
)}

    ${used

        ?

        usedSection(ticket)

        :

        buttonSection()

    }

    <div class="footer">

        Amazing Crew TV Production

    </div>

</div>

`;

    if(!used){

        attachButton();

    }

}

function createRow(label,value){

    return `

<div class="row">

    <span>

        ${label}

    </span>

    <strong>

        ${value}

    </strong>

</div>

`;

}

function buttonSection(){

    return `

<button

    id="checkInBtn"

    class="checkin-btn">

    ✓ Admit Guest

</button>

`;

}

function usedSection(ticket){

    return `

<div class="used-box">

    <h3>

        Guest Already Checked In

    </h3>

    <p>

        <strong>Checked In By</strong>

        <br>

        ${ticket.checkedInBy || "-"}

    </p>

    <br>

    <p>

        <strong>Checked In At</strong>

        <br>

        ${formatDate(ticket.checkedInAt)}

    </p>

</div>

`;

}

function attachButton(){

    const button =

        document.getElementById(

            "checkInBtn"

        );

    if(!button) return;

    button.addEventListener(

        "click",

        checkInGuest

    );

}

async function checkInGuest(){

    const button =
        document.getElementById("checkInBtn");

    button.disabled = true;

    button.innerHTML = "Checking In...";

    try{

        const checkIn =

            httpsCallable(

                functions,

                "checkInTicket"

            );

        const result =

            await checkIn({

                orderId: currentOrderId,

                usher: window.loggedInStaff?.fullName || "Unknown Staff"

            });

        console.log(result.data);

        button.innerHTML =
            "✓ Guest Admitted";

        button.style.background =
            "#0f9d58";

        setTimeout(()=>{

            location.reload();

        },1200);

    }

    catch(error){

        console.error(error);

        button.disabled = false;

        button.innerHTML =
            "✓ Admit Guest";

        alert(

            error.message

        );

    }

}

function startScanner(){

    const scanner = new Html5Qrcode("reader");

    scanner.start(

        {

            facingMode:"environment"

        },

        {

            fps:10,

            qrbox:250

        },

        async(decodedText)=>{

            scanner.stop();

            processQRCode(decodedText);

        },

        ()=>{}

    );

}

async function processQRCode(text){

    try{

        const url = new URL(text);

        currentOrderId = url.searchParams.get("id");

        if(!currentOrderId){

            alert("Invalid QR Code.");

            return;

        }

        await loadTicket();

    }

    catch(error){

        alert("Invalid QR Code.");

    }

}