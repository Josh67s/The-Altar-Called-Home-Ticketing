export function createTicketCard(ticket, options = {}){

    const {

        showActions = true,

        buyer = {},

        payment = {}

    } = options;

    const isUsed = ticket.used === true;

    return `

<div class="tach-ticket">

    <div class="ticket-header">

        <div>

            <h2>${ticket.ticketNumber}</h2>

        </div>

        <div>

            <span class="${isUsed ? "badge-used" : "badge-valid"}">

                ${isUsed ? "USED" : "VALID"}

            </span>

        </div>

    </div>

    <hr>

    <div class="ticket-grid">

        <div>

            <label>Buyer</label>

            <h3>${buyer.name || ticket.buyer?.name || "-"}</h3>

        </div>

        <div>

            <label>Ticket Type</label>

            <h3>${ticket.ticket?.type || "-"}</h3>

        </div>

        <div>

            <label>Email</label>

            <h3>${buyer.email || ticket.buyer?.email || "-"}</h3>

        </div>

        <div>

            <label>Phone</label>

            <h3>${buyer.phone || ticket.buyer?.phone || "-"}</h3>

        </div>

        <div>

            <label>Amount</label>

            <h3>

                ₦${Number(payment.total || ticket.totals?.total || 0).toLocaleString()}

            </h3>

        </div>

    </div>

    <div id="ticketQR" class="qrBox"></div>

    ${
        showActions
        ?
        `

        <div class="ticket-actions">

            ${
                isUsed
                ?
                `
                <div class="checked-in-box">

                    ✅ Already Checked In

                    <br>

                    <small>

                        ${ticket.checkedInBy || "Unknown Staff"}

                    </small>

                </div>
                `
                :
                `
                <button
                    id="admitGuestBtn"
                    class="greenBtn">

                    ✔ Admit Guest

                </button>
                `
            }

            <button
                id="printTicketBtn"
                class="goldBtn">

                🖨 Print

            </button>

            <button
                id="pdfTicketBtn"
                class="goldBtn">

                📄 PDF

            </button>

            <button
                id="emailTicketBtn"
                class="goldBtn">

                📧 Email

            </button>

        </div>

        `
        :
        ""
    }

</div>

`;

}