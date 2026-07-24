import {
    downloadPDF,
    resendEmail
} from "./ticketActions.js";

export function showTicketModal(order, options = {}) {

    const {

        allowPrint = true,
        allowPDF = true,
        allowEmail = true,
        allowCheckIn = false,
        onCheckIn = null

    } = options;

    const modal =
    document.getElementById("ticketModal");

    const body =
    document.getElementById("ticketModalBody");

    body.innerHTML = createTicketHTML(

        order,

        allowPrint,

        allowPDF,

        allowEmail,

        allowCheckIn

    );

    modal.style.display = "flex";

    attachActions(

        order,

        allowPrint,

        allowPDF,

        allowEmail,

        allowCheckIn,

        onCheckIn

    );

}

function createTicketHTML(

    order,

    allowPrint,

    allowPDF,

    allowEmail,

    allowCheckIn

){

    return `

<h2>

Ticket Details

</h2>

<div class="ticket-details">

<p>

<strong>

Ticket Number:

</strong>

${order.ticketNumber || "-"}

</p>

<p>

<strong>

Buyer:

</strong>

${order.buyer.name}

</p>

<p>

<strong>

Email:

</strong>

${order.buyer.email}

</p>

<p>

<strong>

Phone:

</strong>

${order.buyer.phone}

</p>

<p>

<strong>

Ticket:

</strong>

${order.ticket.type}

</p>

<p>

<strong>

Quantity:

</strong>

${order.ticket.quantity}

</p>

<p>

<strong>

Total:

</strong>

₦${Number(order.totals.total).toLocaleString()}

</p>

<div class="ticket-buttons">

${allowPrint ? `<button id="printTicket">🖨 Print</button>` : ""}

${allowPDF ? `<button id="downloadTicket">📄 PDF</button>` : ""}

${allowEmail ? `<button id="resendTicket">📧 Email</button>` : ""}

${allowCheckIn ? `<button id="checkInTicket">✅ Admit Guest</button>` : ""}

</div>

</div>

`;

}

function attachActions(

    order,

    allowPrint,

    allowPDF,

    allowEmail,

    allowCheckIn,

    onCheckIn

){

    if(allowPrint){

        document
        .getElementById("printTicket")
        ?.addEventListener("click",()=>{

            window.print();

        });

    }

    if(allowPDF){

        document
        .getElementById("downloadTicket")
        ?.addEventListener("click",()=>{

            downloadPDF(order);

        });

    }

    if(allowEmail){

        document
        .getElementById("resendTicket")
        ?.addEventListener("click",()=>{

            resendEmail(order);

        });

    }

    if(allowCheckIn && onCheckIn){

        document
        .getElementById("checkInTicket")
        ?.addEventListener("click",()=>{

            onCheckIn(order);

        });

    }

}