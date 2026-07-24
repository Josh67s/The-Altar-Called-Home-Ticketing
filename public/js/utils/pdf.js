import { formatCurrency, formatTicketName } from "./formatter.js";

export async function downloadTicketPDF(order){

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

    let y = 50;

    pdf.setFontSize(11);
    pdf.setTextColor(0);

    const row = (label,value)=>{

        pdf.setFont("helvetica","bold");
        pdf.text(label,20,y);

        pdf.setFont("helvetica","normal");
        pdf.text(String(value),55,y);

        y += 10;

    };

    row("Order ID:",order.id || order.orderId);

    row("Buyer:",order.buyer?.name||"-");

    row("Email:",order.buyer?.email||"-");

    row("Phone:",order.buyer?.phone||"-");

    row("Ticket:",formatTicketName(order.ticket?.type));

    row(
        "Attendees:",
        order.attendees?.length ||
        order.ticket?.quantity ||
        0
    );

    row(
        "Amount:",
        formatCurrency(order.totals?.total)
    );

    pdf.setFont("helvetica","bold");
    pdf.text("Status:",20,y);

    if(order.payment?.status==="Paid"){

        pdf.setTextColor(0,150,0);

    }else if(order.payment?.status==="Pending"){

        pdf.setTextColor(220,140,0);

    }else{

        pdf.setTextColor(220,0,0);

    }

    pdf.text(
        order.payment?.status || "-",
        55,
        y
    );

    pdf.setTextColor(0);

    y += 20;

    pdf.line(20,y,190,y);

    y += 10;

    pdf.setFontSize(13);

    pdf.setTextColor(212,175,55);

    pdf.text(
        "PREMIERE INFORMATION",
        20,
        y
    );

    y += 12;

    pdf.setFontSize(11);

    pdf.setTextColor(0);

    pdf.text(
        "Date: Friday, September 4, 2026",
        20,
        y
    );

    y += 8;

    pdf.text(
        "Time: 4:00 PM",
        20,
        y
    );

    y += 8;

    pdf.text(
        "Venue: Assemblies of God Church Umudibia Nekede",
        20,
        y
    );

    y += 8;

    pdf.text(
        "Owerri, Imo State",
        20,
        y
    );

    const qrCanvas =
    document.querySelector("#orderQR canvas");

    if(qrCanvas){

        const img =
        qrCanvas.toDataURL("image/png");

        pdf.addImage(

            img,

            "PNG",

            140,

            170,

            45,

            45

        );

    }

    pdf.setFontSize(10);

    pdf.setTextColor(100);

    pdf.text(

        "Powered by Amazing Crew TV Production",

        105,

        262,

        {

            align:"center"

        }

    );

    pdf.save(`TACH-${order.id || order.orderId}.pdf`);

}