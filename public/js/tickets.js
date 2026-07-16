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

                    data-id="${ticket.orderId}"

                >

                    View

                </button>

            </td>

        </tr>

    `;

}