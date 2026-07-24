import {
    functions,
    httpsCallable
} from "../firebase-config.js";

import {
    downloadTicketPDF
} from "../utils/pdf.js";

import {
    showAlert
} from "../utils/alerts.js";

const resendEmailCallable =
httpsCallable(
    functions,
    "resendTicketEmail"
);

export function downloadPDF(order){

    downloadTicketPDF(order);

}

export async function resendEmail(order){

    const button =document.getElementById("emailTicketBtn");

    try{

        button.disabled = true;
        button.textContent = "Sending...";

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

        button.disabled = false;

        button.textContent =
        "📧 Email";

    }

}