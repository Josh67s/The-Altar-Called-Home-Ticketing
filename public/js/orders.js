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

db,
collection,
getDocs

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

₦${Number(order.totals?.total||0).toLocaleString()}

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

<p>₦${Number(order.totals?.total||0).toLocaleString()}</p>

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

new QRCode(

document.getElementById("orderQR"),

{

text:

window.location.origin+

"/verify.html?id="+

order.id,

width:180,

height:180

}

);

document
.getElementById("printTicket")
.onclick = ()=>{

printOrder(order);

};

document
.getElementById("downloadPDF")
.onclick = ()=>{

downloadPDF(order);

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

async function downloadPDF(order){

const { jsPDF } = window.jspdf;

const pdf = new jsPDF({

orientation:"portrait",

unit:"mm",

format:"a4"

});

pdf.setDrawColor(212,175,55);
pdf.setLineWidth(1.2);
pdf.rect(8,8,194,281);

pdf.setFont("helvetica","bold");

pdf.setFontSize(24);

pdf.setTextColor(212,175,55);

pdf.text(

"THE ALTAR CALLED HOME",

105,

20,

{align:"center"}

);

pdf.setFontSize(12);

pdf.setTextColor(80);

pdf.text(

"Amazing Crew TV Production",

105,

28,

{align:"center"}

);

pdf.line(20,35,190,35);

pdf.setDrawColor(212,175,55);

pdf.line(20,35,190,35);

pdf.setFontSize(11);

pdf.setTextColor(0);

let y = 50;

pdf.setFont("helvetica","bold");
pdf.text("Order ID:",20,y);

pdf.setFont("helvetica","normal");
pdf.text(String(order.id),55,y);

y+=10;

pdf.setFont("helvetica","bold");
pdf.text("Buyer:",20,y);

pdf.setFont("helvetica","normal");
pdf.text(String(order.buyer?.name || "-"),55,y);

y+=10;

pdf.setFont("helvetica","bold");
pdf.text("Email:",20,y);

pdf.setFont("helvetica","normal");
pdf.text(order.buyer?.email||"-",55,y);

y+=10;

pdf.setFont("helvetica","bold");
pdf.text("Phone:",20,y);

pdf.setFont("helvetica","normal");
pdf.text(order.buyer?.phone||"-",55,y);

y+=10;

pdf.setFont("helvetica","bold");
pdf.text("Ticket:",20,y);

pdf.setFont("helvetica","normal");

const ticketName =
order.ticket?.type==="premium"
? "Premium Access"
: order.ticket?.type==="standard"
? "Standard Access"
: "Regular Access";

pdf.text(ticketName,55,y);

y+=10;

pdf.setFont("helvetica","bold");
pdf.text("Attendees:",20,y);

pdf.setFont("helvetica","normal");
pdf.text(
String(order.attendees?.length || order.ticket?.quantity || 0),55,y);

y+=10;

pdf.setFont("helvetica","bold");
pdf.text("Amount:",20,y);

pdf.setFont("helvetica","normal");
const amount = new Intl.NumberFormat("en-NG").format(
Number(order.totals?.total || 0));

pdf.text(`₦${amount}`,55,y);

y+=10;

pdf.setFont("helvetica","bold");
pdf.text("Status:",20,y);

if(order.payment?.status==="Paid"){

pdf.setTextColor(0,150,0);

}else if(order.payment?.status==="Pending"){

pdf.setTextColor(220,140,0);

}else{

pdf.setTextColor(220,0,0);

}

pdf.text(String(order.payment?.status || "-"),55,y);

pdf.setTextColor(0);

y += 20;

pdf.setDrawColor(212,175,55);

pdf.line(20,y,190,y);

y += 10;

pdf.setFont("helvetica","bold");

pdf.setFontSize(13);

pdf.setTextColor(212,175,55);

pdf.text("PREMIERE INFORMATION",20,y);

y += 12;

pdf.setFont("helvetica","normal");

pdf.setTextColor(0);

pdf.text("Date: Friday, September 4, 2026",20,y);

y += 8;

pdf.text("Time: 4:00 PM",20,y);

y += 8;

pdf.text("Venue: Assemblies of God Church",20,y);

y += 8;

pdf.text("Umudibia Nekede, Owerri",20,y);


const qrCanvas =
document.querySelector("#orderQR canvas");

if(qrCanvas){

const qrImage =
qrCanvas.toDataURL("image/png");

pdf.setFontSize(11);
pdf.setTextColor(212,175,55);
pdf.text("Verification QR",140,168);

pdf.addImage(

qrImage,

"PNG",

140,175,40,40

);

pdf.setFontSize(9);

pdf.setTextColor(100);

pdf.text(

"Scan to Verify Ticket",

162,

220,

{align:"center"}

);

}

pdf.setDrawColor(212,175,55);

pdf.line(20,245,190,245);

pdf.setFontSize(10);

pdf.setTextColor(100);

pdf.text(

"Please present this ticket together with a valid means of identification.",

105,

255,

{align:"center"}

);

pdf.text(

"Powered by Amazing Crew TV Production",

105,

262,

{align:"center"}

);

pdf.text(

"© 2026 Amazing Crew TV Production",

105,

269,

{align:"center"}

);

pdf.save (`TACH-${order.id}.pdf`);

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

₦${Number(order.totals?.total || 0).toLocaleString()}

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



