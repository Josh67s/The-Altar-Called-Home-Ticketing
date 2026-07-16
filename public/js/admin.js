/*
=========================================
 THE ALTAR CALLED HOME
 ADMIN DASHBOARD
 Version 1.0
=========================================
*/

import { protectPage } from "./auth.js";

import {

    db,

    collection,

    getDocs

} from "./firebase-config.js";

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

const modal=

document.getElementById(

"ticketModal"

);

const body=

document.getElementById(

"modalBody"

);

modal.style.display="flex";

body.innerHTML="Loading...";

const snapshot=

await getDocs(

collection(db,"orders")

);

let order=null;

snapshot.forEach(doc=>{

if(doc.id===id){

order=doc.data();

}

});

if(!order){

body.innerHTML="Ticket not found.";

return;

}

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

`;

};

document

.getElementById(

"closeModal"

)

.onclick=()=>{

document

.getElementById(

"ticketModal"

)

.style.display="none";

};