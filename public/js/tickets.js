import{

protectPage,
logout

}from "./auth.js";

import{

db,
collection,
getDocs

}from "./firebase-config.js";

let allTickets = [];

let filteredTickets = [];

let currentPage = 1;

const rowsPerPage = 10;

window.onUserReady = async ()=>{

loadPage();

await loadTickets();

};

function loadPage(){

const admin =

window.loggedInStaff;

if(!admin){

return;

}

const adminName =

document.getElementById(

"adminName"

);

if(adminName){

adminName.textContent =

admin.name;

}

const currentDate =

document.getElementById(

"currentDate"

);

if(currentDate){

currentDate.textContent =

new Date().toLocaleDateString(

"en-NG",

{

weekday:"long",

year:"numeric",

month:"long",

day:"numeric"

}

);

}

}

protectPage("admin");

const logoutBtn =

document.getElementById(

"logoutBtn"

);

if(logoutBtn){

logoutBtn.addEventListener(

"click",

logout

);

}

async function loadTickets(){

    const snapshot = await getDocs(

        collection(db,"tickets")

    );

    allTickets = [];

    snapshot.forEach((docSnap)=>{

        allTickets.push(docSnap.data());

    });

    filteredTickets = [...allTickets];

    renderTable();

}
function renderTable(){

    const tbody =

        document.getElementById("ticketsBody");

    tbody.innerHTML = "";

    if(filteredTickets.length===0){

        tbody.innerHTML = `

        <tr>

            <td colspan="6">

                No tickets found.

            </td>

        </tr>

        `;

        return;

    }

    const start =

        (currentPage-1)*rowsPerPage;

    const end =

        start+rowsPerPage;

    const pageTickets =

        filteredTickets.slice(

            start,

            end

        );

    pageTickets.forEach(ticket=>{

        tbody.innerHTML +=

            createRow(ticket);

    });

    const showingStart =

filteredTickets.length===0

?

0

:

start+1;

const showingEnd =

Math.min(

end,

filteredTickets.length

);

document

.getElementById(

"pageInfo"

)

.textContent =

`Showing ${showingStart}-${showingEnd} of ${filteredTickets.length} tickets`;

document

.getElementById(

"prevBtn"

)

.disabled =

currentPage===1;

document

.getElementById(

"nextBtn"

)

.disabled =

end>=filteredTickets.length;

}

function createRow(ticket){

    const status = ticket.used

        ? `<span class="used">USED</span>`

        : `<span class="valid">VALID</span>`;

    return `

        <tr>

            <td>${ticket.ticketNumber}</td>

            <td>${ticket.buyer?.name || "-"}</td>

            <td>${ticket.ticket?.type || "-"}</td>

            <td>

                ₦${Number(ticket.totals?.total || 0).toLocaleString()}

            </td>

            <td>${status}</td>

            <td>

<button

class="viewBtn"

data-ticket="${ticket.ticketNumber}"

>

View

</button>

</td>

        </tr>

    `;

}

const searchInput =

document.getElementById(

"searchTicket"

);

searchInput.addEventListener(

"input",

searchTickets

);

function searchTickets(){

    filterTickets();

}

const statusFilter =

document.getElementById(

"statusFilter"

);

statusFilter.addEventListener(

"change",

filterTickets

);

function filterTickets(){

    const status =

        statusFilter.value;

    const keyword =

        searchInput.value

        .trim()

        .toLowerCase();

    filteredTickets =

        allTickets.filter(ticket=>{

            const ticketNumber =

                (ticket.ticketNumber || "")

                .toLowerCase();

            const buyer =

                (ticket.buyer?.name || "")

                .toLowerCase();

            const type =

                (ticket.ticket?.type || "")

                .toLowerCase();

            const matchesSearch =

                ticketNumber.includes(keyword)

                ||

                buyer.includes(keyword)

                ||

                type.includes(keyword);

            let matchesStatus = true;

            if(status==="valid"){

                matchesStatus =

                    ticket.used===false;

            }

            if(status==="used"){

                matchesStatus =

                    ticket.used===true;

            }

            return(

                matchesSearch

                &&

                matchesStatus

            );

        });

    currentPage = 1;

    renderTable();

}

document

.getElementById(

"prevBtn"

)

.addEventListener(

"click",

()=>{

if(currentPage>1){

currentPage--;

renderTable();

}

});

document

.getElementById(

"nextBtn"

)

.addEventListener(

"click",

()=>{

const totalPages =

Math.ceil(

filteredTickets.length/

rowsPerPage

);

if(currentPage<totalPages){

currentPage++;

renderTable();

}

});

const modal =

document.getElementById("ticketModal");

const modalBody =

document.getElementById("modalBody");

document.addEventListener(

"click",

async(e)=>{

if(

e.target.classList.contains("viewBtn")

){

const ticketNumber =

e.target.dataset.ticket;

await openTicket(ticketNumber);

}

});

document

.getElementById("closeModal")

.addEventListener(

"click",

()=>{

modal.style.display="none";

});

async function openTicket(ticketNumber){

const ticket =

allTickets.find(

t=>t.ticketNumber===ticketNumber

);

if(!ticket) return;

modalBody.innerHTML = `

<div class="tach-ticket">

<div class="ticket-header">

<div>

<h2>

${ticket.ticketNumber}

</h2>

</div>

<div>

<span class="${
ticket.used ? "badge-used" : "badge-valid"
}">

${ticket.used ? "USED" : "VALID"}

</span>

</div>

</div>

<hr>

<div class="ticket-grid">

<div>

<label>

Buyer

</label>

<h3>

${ticket.buyer.name}

</h3>

</div>

<div>

<label>

Ticket

</label>

<h3>

${ticket.ticket.type}

</h3>

</div>

<div>

<label>

Email

</label>

<h3>

${ticket.buyer.email}

</h3>

</div>

<div>

<label>

Phone

</label>

<h3>

${ticket.buyer.phone}

</h3>

</div>

<div>

<label>

Amount

</label>

<h3>

₦${Number(ticket.totals.total).toLocaleString()}

</h3>

</div>

</div>

<div class="qrBox">

QR Code Coming Soon

</div>

<div class="ticket-actions">

<button class="greenBtn">

✔ Admit Guest

</button>

<button class="goldBtn">

🖨 Print

</button>

<button class="goldBtn">

📧 Resend Email

</button>

</div>

</div>

`;

modal.style.display="flex";

}