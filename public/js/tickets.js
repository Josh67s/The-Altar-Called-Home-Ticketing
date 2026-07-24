import{

protectPage,
logout

}from "./auth.js";

import {

initializeLayout

}from "./layout.js";

import{

createTicketCard

}from "./components/ticket-card.js";

import{

downloadPDF,

resendEmail

}from "./components/ticketActions.js";

import{

openModal,

closeModal,

registerModal

}from "./components/modal.js";

import{

generateQRCode

}

from "./components/qr.js";

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

    initializeLayout();

    await loadTickets();

};

protectPage("admin");

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

registerModal(modal);

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

closeModal(modal);

});

async function openTicket(ticketNumber){

const ticket =

allTickets.find(

t=>t.ticketNumber===ticketNumber

);

if(!ticket) return;

const order = {

    buyer: ticket.buyer,

    ticket: ticket.ticket,

    totals: ticket.totals,

    payment: ticket.payment,

    ticketNumber: ticket.ticketNumber,

    orderId: ticket.orderId

};

if(!ticket) return;

modalBody.innerHTML =

createTicketCard(

    ticket,

    {

        showActions:true,

        showCheckIn:true

    }

);

generateQRCode(

"ticketQR",

`${window.location.origin}/verify.html?id=${ticket.orderId}`

);

attachTicketActions(ticket);

openModal(modal);

}

function attachTicketActions(ticket){

    const printBtn =
    document.getElementById("printTicketBtn");

    const pdfBtn =
    document.getElementById("pdfTicketBtn");

    const emailBtn =
    document.getElementById("emailTicketBtn");

    const admitBtn =
    document.getElementById("admitGuestBtn");

    if(printBtn){

        printBtn.onclick = ()=>{

            const content =

            document.getElementById("modalBody").innerHTML;

            const win =

            window.open("", "_blank");

            win.document.write(`
                <html>
                <head>
                    <title>Print Ticket</title>
                    <style>

                        body{

                            font-family:Arial;

                            padding:30px;

                        }

                        button{

                            display:none;

                        }

                    </style>
                </head>

                <body>

                ${content}

                </body>

                </html>
            `);

            win.document.close();

            win.print();

            win.close();

        };

    }

    if(pdfBtn){

        pdfBtn.onclick = ()=>{

            downloadPDF(ticket);

        };

    }

    if(emailBtn){

        emailBtn.onclick = ()=>{

            resendEmail({

                id:ticket.orderId

            });

        };

    }

    if(admitBtn){

        admitBtn.onclick = ()=>{

            window.location.href =

            `verify.html?id=${ticket.orderId}`;

        };

    }

}