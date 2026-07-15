console.log("=== VERIFY.JS LOADED ===");
console.log("Module URL:", import.meta.url);
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

} from "../js/firebase-config.js";

const params =
    new URLSearchParams(window.location.search);

const id =
    params.get("id");

const card =
    document.getElementById("verificationCard");

loadTicket();

async function loadTicket(){

    if(!id){

        card.innerHTML = "<h2>Invalid QR Code</h2>";

        return;

    }

    // Load the order
    const orderRef =
        doc(db,"orders",id);

    const orderSnap =
        await getDoc(orderRef);

    if(!orderSnap.exists()){

        card.innerHTML =
            "<h2>Order Not Found</h2>";

        return;

    }

    const order =
        orderSnap.data();

    // Find the ticket belonging to this order
    const q =
        query(

            collection(db,"tickets"),

            where("orderId","==",id)

        );

    const ticketSnap =
        await getDocs(q);

    if(ticketSnap.empty){

        card.innerHTML =
            "<h2>Ticket Not Found</h2>";

        return;

    }

    const ticket =
        ticketSnap.docs[0].data();

    displayTicket(order,ticket);

}

function displayTicket(order,ticket){

    console.log("ORDER:");
console.log(order);

console.log("TICKET:");
console.log(ticket);

    const badgeColor =
        ticket.used ? "#dc2626" : "#16a34a";

    const badgeText =
        ticket.used ? "USED" : "VALID";

    card.innerHTML = `

        <h2>${ticket.ticketNumber}</h2>

        <p>

            <strong>Buyer:</strong>

            ${order.buyer.name}

        </p>

        <p>

            <strong>Ticket:</strong>

            ${order.ticket.type}

        </p>

        <p>

            <strong>Quantity:</strong>

            ${order.ticket.quantity}

        </p>

        <p>

            <strong>Payment:</strong>

            ${order.payment.status}

        </p>

        <p>

            <strong>Status:</strong>

            <span style="
                color:white;
                background:${badgeColor};
                padding:6px 12px;
                border-radius:20px;
                font-weight:bold;
            ">

                ${badgeText}

            </span>

        </p>

    `;

 console.log("ticket.used =", ticket.used);

if(ticket.used === true){

    }else{

        card.innerHTML += `

            <br>

            <button id="checkInBtn">

                Admit Guest

            </button>

        `;

        document
            .getElementById("checkInBtn")
            .addEventListener(

                "click",

                checkInGuest

            );

    }

}

async function checkInGuest(){

    try{
        const checkIn =
            httpsCallable(
                functions,
                "checkInTicket"
            );

        const result =
            await checkIn({

                orderId: id,

                usher: "Gate 1"

            });

        console.log(result.data);

        alert("Guest admitted successfully!");

        location.reload();

    }

    catch(error){

        console.error(error);

        alert(error.message);

    }

}

