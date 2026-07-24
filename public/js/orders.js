import{

protectPage,
logout

}from "./auth.js";

import {

initializeLayout

}

from "./layout.js";

import{

openModal,

closeModal,

registerModal

}from "./components/modal.js";

import{

formatCurrency,
formatTicketName

}from "./utils/formatter.js";

import{

downloadTicketPDF

}from "./utils/pdf.js";

import{

generateQRCode

}from "./utils/qr.js";

import{

showAlert

}from "./utils/alerts.js";

import{

db,
collection,
getDocs,
functions,
    httpsCallable
}from "./firebase-config.js";


protectPage("admin");

let allOrders = [];

let filteredOrders = [];

let currentPage = 1;

const rowsPerPage = 10;

window.onUserReady = async ()=>{

    initializeLayout();

    await loadOrders();

};


const resendEmailCallable =
httpsCallable(
    functions,
    "resendTicketEmail"
);

async function loadOrders(){

    const snapshot = await getDocs(

        collection(db,"orders")

    );

    allOrders = [];

    snapshot.forEach(docSnap=>{

        allOrders.push({

            id:docSnap.id,

            ...docSnap.data()

        });

    });

    filteredOrders = [...allOrders];

    updateStats();

filterOrders();

}

function updateStats(){

    document.getElementById("totalOrders").textContent =

        allOrders.length;

    const paid =

allOrders.filter(

order=>order.payment?.status==="Paid"

);
    document.getElementById("paidOrders").textContent =

        paid.length;

    const revenue =

        paid.reduce(

            (sum,order)=>

            sum+(order.totals?.total||0),

            0

        );

    document.getElementById("totalRevenue").textContent =

        "₦"+revenue.toLocaleString();

    const tickets =

paid.reduce(

(sum,order)=>

sum+

(order.attendees?.length||0),

0

);

    document.getElementById("ticketsSold").textContent =

        tickets;

}

function renderTable(){

const tbody =
document.getElementById("ordersBody");

tbody.innerHTML="";

if(filteredOrders.length===0){

tbody.innerHTML=

`

<tr>

<td colspan="6">

No Orders Found

</td>

</tr>

`;

return;

}

const start =

(currentPage-1)*rowsPerPage;

const end =

start+rowsPerPage;

const pageOrders =

filteredOrders.slice(start,end);

pageOrders.forEach(order=>{

tbody.innerHTML +=

createRow(order);

});

document.getElementById("pageInfo").textContent =

`Showing ${Math.min(start+1,filteredOrders.length)}-${Math.min(end,filteredOrders.length)} of ${filteredOrders.length}`;

document.getElementById("prevBtn").disabled =

currentPage===1;

document.getElementById("nextBtn").disabled =

end>=filteredOrders.length;

}

function createRow(order){

let status = "";

if(order.payment?.status==="Paid"){

status =

'<span class="valid">PAID</span>';

}

else if(order.payment?.status==="Pending"){

status =

'<span class="used">PENDING</span>';

}

else{

status =

'<span class="used">FAILED</span>';

}

return`

<tr>

<td>

${order.id}

</td>

<td>

${order.buyer?.name||"-"}

</td>

<td>

${order.ticket?.type||"-"}

</td>

<td>

${formatCurrency(order.totals?.total)}

</td>

<td>

${status}

</td>

<td>

<button

class="viewBtn"

data-id="${order.id}">

View

</button>

</td>

</tr>

`;

}


const searchInput =
document.getElementById("searchOrder");

const statusFilter =
document.getElementById("statusFilter");

searchInput.addEventListener(
"input",
filterOrders
);

statusFilter.addEventListener(
"change",
filterOrders
);

function filterOrders(){

const keyword =
searchInput.value.trim().toLowerCase();

const status =
statusFilter.value;

filteredOrders =
allOrders.filter(order=>{

const paymentRef =
(order.id || "").toLowerCase();

const buyer =
(order.buyer?.name || "").toLowerCase();

const type =
(order.ticket?.type || "").toLowerCase();

const matchesSearch =

paymentRef.includes(keyword) ||

buyer.includes(keyword) ||

type.includes(keyword);

let matchesStatus = true;

if(status==="paid"){

matchesStatus =
order.payment?.status==="Paid";

}

else if(status==="pending"){

matchesStatus =
order.payment?.status==="Pending";

}

else if(status==="failed"){

matchesStatus =
order.payment?.status==="Failed";

}

// if status=="all"
// matchesStatus stays true

return matchesSearch && matchesStatus;

});

currentPage = 1;

renderTable();

}

const logoutBtn =
document.getElementById("logoutBtn");

logoutBtn.addEventListener(

"click",

logout

);

document
.getElementById("prevBtn")
.addEventListener(

"click",

()=>{

if(currentPage>1){

currentPage--;

renderTable();

}

});

document
.getElementById("nextBtn")
.addEventListener(

"click",

()=>{

const totalPages=

Math.ceil(

filteredOrders.length/

rowsPerPage

);

if(currentPage<totalPages){

currentPage++;

renderTable();

}

});

document.addEventListener("click",async(e)=>{

if(!e.target.classList.contains("viewBtn")) return;

const id = e.target.dataset.id;

const order = allOrders.find(o=>o.id===id);

showOrder(order);

});

function showOrder(order){

const modal =
document.getElementById("ticketModal");

const body =
document.getElementById("modalBody");

let badge="";

switch(order.payment?.status){

case "Paid":

badge='<span class="badge badge-paid">PAID</span>';

break;

case "Pending":

badge='<span class="badge badge-pending">PENDING</span>';

break;

default:

badge='<span class="badge badge-failed">FAILED</span>';

}

body.innerHTML=`

<div class="order-card" data-id="${order.id}">

<div class="order-header">

<h2>Order Details</h2>

${badge}

</div>

<div class="order-grid">

<div>

<label>Order ID</label>

<p>${order.id}</p>

</div>

<div>

<label>Buyer</label>

<p>${order.buyer?.name||"-"}</p>

</div>

<div>

<label>Email</label>

<p>${order.buyer?.email||"-"}</p>

</div>

<div>

<label>Phone</label>

<p>${order.buyer?.phone||"-"}</p>

</div>

<div>

<label>Ticket</label>

<p>${order.ticket?.type||"-"}</p>

</div>

<div>

<label>Quantity</label>

<p>${order.ticket?.quantity||0}</p>

</div>

<div>

<label>Total</label>

<p>${formatCurrency(order.totals?.total)}</p>

</div>

<div>

<label>Gateway</label>

<p>${order.payment?.gateway||"-"}</p>

</div>

</div>

<hr>

<h3>Attendees</h3>

<div class="attendee-list">

${(order.attendees||[]).map(a=>`

<div class="attendee">

${a.name}

</div>

`).join("")}

</div>

<hr>

<h3>Ticket QR Code</h3>

<div id="orderQR" class="qr-preview"></div>

<div class="order-buttons">

<button id="printTicket" class="goldBtn">

🖨 Print Ticket

</button>

<button id="downloadPDF" class="goldBtn">

⬇ Download PDF

</button>

<button id="resendTicket" class="greenBtn">

📧 Resend Email

</button>

</div>

</div>

`;

modal.style.display="flex";

generateQRCode(

"orderQR",

window.location.origin+
"/verify.html?id="+
order.id

);

document
.getElementById("printTicket")
.onclick = ()=>{

printOrder(order);

};

document
.getElementById("downloadPDF")
.onclick = ()=>{

downloadTicketPDF(order);

};

document
.getElementById("resendTicket")
.onclick = ()=>{

resendTicket(order);

};

}


function printOrder(order){

buildPrintTicket(order);

setTimeout(()=>{

window.print();

},500);

}


document.getElementById("closeModal")

.addEventListener("click",()=>{

document.getElementById("ticketModal").style.display="none";

});

window.addEventListener("click",(e)=>{

const modal = document.getElementById("ticketModal");

if(e.target===modal){

modal.style.display="none";

}

});


function buildPrintTicket(order){

const printArea =
document.getElementById("printArea");

printArea.innerHTML = `

<div class="print-ticket">

<div class="print-header">

<h1>
THE ALTAR CALLED HOME
</h1>

<p>
Amazing Crew TV Production
</p>

</div>

<div class="print-grid">

<div>

<strong>Order ID</strong><br>

${order.id}

</div>

<div>

<strong>Buyer</strong><br>

${order.buyer?.name || "-"}

</div>

<div>

<strong>Email</strong><br>

${order.buyer?.email || "-"}

</div>

<div>

<strong>Phone</strong><br>

${order.buyer?.phone || "-"}

</div>

<div>

<strong>Ticket</strong><br>

${order.ticket?.type || "-"}

</div>

<div>

<strong>Quantity</strong><br>

${order.ticket?.quantity || 0}

</div>

<div>

<strong>Total Paid</strong><br>

${formatCurrency(order.totals?.total)}

</div>

<div>

<strong>Status</strong><br>

${order.payment?.status || "-"}

</div>

</div>

<div
id="printQR"
class="printQR">

</div>

<div class="print-footer">

Please present this ticket at the entrance.

</div>

</div>

`;

const qrContainer =
document.getElementById("printQR");

new QRCode(qrContainer,{

text:
window.location.origin+
"/verify.html?id="+
order.id,

width:180,

height:180

});

}

async function resendTicket(order){

    try{

        const button =
        document.getElementById("resendTicket");

        button.disabled = true;

        button.textContent =
        "Sending...";

        await resendEmailCallable({

            orderId: order.id

        });

        button.textContent =
        "✓ Email Sent";

        showAlert(
    "Ticket email sent successfully.",
    "success"
);

    }catch(error){

        console.error(error);

        showAlert(
    error.message,
    "error"
);

    }finally{

        const button =
        document.getElementById("resendTicket");

        button.disabled = false;

        button.textContent =
        "📧 Resend Email";

    }

}


