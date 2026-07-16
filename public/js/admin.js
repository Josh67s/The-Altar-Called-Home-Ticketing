/*
=========================================
 THE ALTAR CALLED HOME
 ADMIN DASHBOARD
 Version 1.0
=========================================
*/

import { 
    protectPage, 
    logout
} from "./auth.js";

import{

db,
functions,
httpsCallable,
collection,
getDocs,
doc,
getDoc,
query,
where

}from "./firebase-config.js";

protectPage("admin");

window.onUserReady = async () => {

    await loadDashboard();

};

async function loadDashboard(){

    await loadAdmin();

    await loadStatistics();

    await loadRecentOrders();

}

async function loadAdmin(){

    const admin = window.loggedInStaff;

    if(!admin) return;

    document.getElementById("adminName").textContent =
        admin.name;

    document.getElementById("currentDate").textContent =
        new Date().toLocaleString(

            "en-NG",

            {

                weekday:"long",

                year:"numeric",

                month:"long",

                day:"numeric"

            }

        );

}

async function loadStatistics(){

    const ordersSnap =
        await getDocs(collection(db,"orders"));

    const ticketsSnap =
        await getDocs(collection(db,"tickets"));

    let revenue = 0;

    let sold = 0;

    let checked = 0;

    ordersSnap.forEach((docSnap)=>{

        const order = docSnap.data();

        if(order.payment.status === "Paid"){

            sold++;

            revenue += Number(order.totals.total || 0);

        }

    });

    ticketsSnap.forEach((docSnap)=>{

        const ticket = docSnap.data();

        if(ticket.used === true){

            checked++;

        }

    });

    document.getElementById("ticketsSold").textContent = sold;

    document.getElementById("checkedIn").textContent = checked;

    document.getElementById("remaining").textContent =
        sold - checked;

    document.getElementById("revenue").textContent =
        "₦" + revenue.toLocaleString();

}

async function loadRecentOrders(){

    const tbody =

        document.getElementById(

            "ordersBody"

        );

    tbody.innerHTML = "";

    const snapshot =

        await getDocs(

            collection(db,"orders")

        );

    const orders = [];

    snapshot.forEach(docSnap=>{

        orders.push({

            id:docSnap.id,

            ...docSnap.data()

        });

    });

    orders.sort(

        (a,b)=>

        b.createdAt.seconds-

        a.createdAt.seconds

    );

    const latest =

        orders.slice(0,10);

    latest.forEach(order=>{

        const tr =

        document.createElement("tr");

        tr.innerHTML = `

        <td>

            ${order.ticketNumber || "N/A"}

        </td>

        <td>

            ${order.buyer.name}

        </td>

        <td>

            ${order.ticket.type}

        </td>

        <td>

            ₦${Number(

                order.totals.total

            ).toLocaleString()}

        </td>

        <td>

            ${order.payment.status}

        </td>

        <td>

            <button

class="viewBtn"

onclick="window.viewTicket('${order.id}')">

View

</button>

        </td>

        `;

        tbody.appendChild(tr);

    });

}

window.viewTicket = async(id)=>{

const modal =

document.getElementById(

"ticketModal"

);

const body =

document.getElementById(

"modalBody"

);

modal.style.display="flex";
document.body.style.overflow = "hidden";

body.innerHTML="<p>Loading ticket...</p>";

try{

const orderRef =

doc(

db,

"orders",

id

);

const orderSnap =

await getDoc(orderRef);

if(!orderSnap.exists()){

body.innerHTML=

"<h3>Order not found.</h3>";

return;

}

const order=

orderSnap.data();

const ticketQuery=

query(

collection(db,"tickets"),

where(

"orderId",

"==",

id

)

);

const ticketSnap=

await getDocs(ticketQuery);

let ticket=null;

if(!ticketSnap.empty){

ticket=

ticketSnap.docs[0].data();

}

const badge=

ticket?.used

?

`<span class="status-used">

USED

</span>`

:

`<span class="status-valid">

VALID

</span>`;

body.innerHTML=`

<div class="modal-row">

<span>

Ticket Number

</span>

<strong>

${order.ticketNumber}

</strong>

</div>

<div class="modal-row">

<span>

Buyer

</span>

<strong>

${order.buyer.name}

</strong>

</div>

<div class="modal-row">

<span>

Email

</span>

<strong>

${order.buyer.email}

</strong>

</div>

<div class="modal-row">

<span>

Phone

</span>

<strong>

${order.buyer.phone}

</strong>

</div>

<div class="modal-row">

<span>

Ticket

</span>

<strong>

${order.ticket.type}

</strong>

</div>

<div class="modal-row">

<span>

Quantity

</span>

<strong>

${order.ticket.quantity}

</strong>

</div>

<div class="modal-row">

<span>

Amount

</span>

<strong>

₦${Number(order.totals.total).toLocaleString()}

</strong>

</div>

<div class="modal-row">

<span>

Payment

</span>

<strong>

${order.payment.status}

</strong>

</div>

<div class="modal-row">

<span>

Status

</span>

<strong>

${badge}

</strong>

</div>

`;

let qrHtml = "";

if(ticket){

const qrImage = ticket.qrCode ||

"https://api.qrserver.com/v1/create-qr-code/?size=220x220&data="+

encodeURIComponent(

window.location.origin +

"/verify.html?id="+

id

);

qrHtml = `

<div class="qr-section">

<h3>

QR Code

</h3>

<img

src="${qrImage}"

class="ticketQR">

</div>

`;

}

body.innerHTML += `

<div class="modal-actions">

<button

class="secondaryBtn"

onclick="window.printTicket('${id}')">

🖨 Print

</button>

<button

class="secondaryBtn"

onclick="window.downloadTicket('${id}')">

📄 PDF

</button>

<button

class="secondaryBtn"

onclick="window.resendTicket('${id}')">

📧 Email

</button>

</div>

`;

body.innerHTML += qrHtml;

if(ticket){

if(ticket.used){

body.innerHTML += `

<div class="checked-in-box">

✅ Checked in by

<strong>

${ticket.checkedInBy || "Unknown"}

</strong>

</div>

`;

}else{

body.innerHTML += `

<button

class="modal-btn"

onclick="window.admitGuest('${id}')">

Admit Guest

</button>

`;

}

}

}

catch(error){

console.error(error);

body.innerHTML=

"<h3>Error loading ticket.</h3>";

}

};

window.admitGuest = async(orderId)=>{

try{

const checkIn=

httpsCallable(

functions,

"checkInTicket"

);

await checkIn({

orderId,

usher:

window.loggedInStaff.name

});

alert(

"Guest admitted successfully."

);

document.getElementById("ticketModal").style.display="none";

document.body.style.overflow = "auto";

await loadStatistics();

await loadRecentOrders();

}

catch(error){

console.error(error);

alert(error.message);

}

};

document.getElementById("closeModal").onclick = ()=>{

document.getElementById("ticketModal").style.display = "none";

document.body.style.overflow = "auto";

};

window.printTicket=()=>{

alert("Coming in the next milestone.");

};

window.downloadTicket=()=>{

alert("Coming in the next milestone.");

};

window.resendTicket=()=>{

alert("Coming in the next milestone.");

};