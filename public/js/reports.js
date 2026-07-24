import{

protectPage

}from "./auth.js";

import{

initializeLayout

}from "./layout.js";

import {
    showAlert
} from "./utils/alerts.js";

import{

db,
collection,
getDocs,
onSnapshot

}from "./firebase-config.js";

protectPage ("admin");

let revenueChart = null;

let ticketChart = null;

let reportOrders = [];

let allOrders = [];

let filteredOrders = [];

let reportCurrentPage = 1;

const reportRowsPerPage = 10;

let selectedTicketType = "all";
let selectedRevenueDate = null;

// Stores previous values for smooth number animation
const previousValues = {};
let analytics = {};

window.onUserReady = async()=>{

    initializeLayout();

    await loadReportStatistics();

    initializeLiveReports();

};

async function loadReportStatistics(){

    const ordersSnap =
    await getDocs(
        collection(db,"orders")
    );

    allOrders = [];

ordersSnap.forEach(doc=>{

    allOrders.push({

        id:doc.id,

        ...doc.data()

    });

});

    const ticketsSnap =
    await getDocs(
        collection(db,"tickets")
    );

    const staffSnap =
    await getDocs(
        collection(db,"staff")
    );

    let totalRevenue = 0;

    let todayRevenue = 0;

    let ticketsSold = 0;

    let checkedIn = 0;

    let today = new Date();

    today.setHours(0,0,0,0);

    ordersSnap.forEach(doc=>{

        const order = doc.data();

        if(order.payment?.status==="Paid"){

            ticketsSold++;

            totalRevenue +=
            Number(order.totals?.total || 0);

            if(order.createdAt){

                const orderDate =
                order.createdAt.toDate();

                orderDate.setHours(0,0,0,0);

                if(orderDate.getTime()===today.getTime()){

                    todayRevenue +=
                    Number(order.totals?.total || 0);

                }

            }

        }

    });

    ticketsSnap.forEach(doc=>{

        const ticket = doc.data();

        if(ticket.used){

            checkedIn++;

        }

    });

    let activeStaff = 0;

    staffSnap.forEach(doc=>{

        if(doc.data().active){

            activeStaff++;

        }

    });

const remainingGuests = ticketsSold - checkedIn;

analytics = {
    totalRevenue,
    todayRevenue,
    ticketsSold,
    checkedIn,
    remainingGuests,
    activeStaff
};

    animateValue(
    "todayRevenue",
    previousValues.todayRevenue ?? 0,
    analytics.todayRevenue,
    1200,
    "₦"
);
previousValues.todayRevenue = analytics.todayRevenue;

animateValue(
    "totalRevenue",
    previousValues.totalRevenue ?? 0,
    analytics.totalRevenue,
    1200,
    "₦"
);
previousValues.totalRevenue = analytics.totalRevenue;

animateValue(
    "ticketsSold",
    previousValues.ticketsSold ?? 0,
    analytics.ticketsSold,
    800
);
previousValues.ticketsSold = analytics.ticketsSold;

animateValue(
    "checkedIn",
    previousValues.checkedIn ?? 0,
    analytics.checkedIn,
    800
);
previousValues.checkedIn = analytics.checkedIn;

animateValue(
    "remainingGuests",
    previousValues.remainingGuests ?? 0,
    analytics.remainingGuests,
    800
);
previousValues.remainingGuests = analytics.remainingGuests;

animateValue(
    "activeStaff",
    previousValues.activeStaff ?? 0,
    analytics.activeStaff,
    800
);
previousValues.activeStaff = analytics.activeStaff;

// Executive Summary

document.getElementById("checkinRate").textContent =
(
    analytics.checkedIn /
    Math.max(analytics.ticketsSold, 1)
    * 100
).toFixed(1) + "%";

}

function animateValue(elementId, start, end, duration = 1000, prefix = "", suffix = ""){

    const element = document.getElementById(elementId);

    if(!element) return;

    if(start === end){

        element.textContent =
        prefix +
        Number(end).toLocaleString() +
        suffix;

        return;

    }

    const startTime = performance.now();

    function update(currentTime){

        const progress = Math.min(
            (currentTime - startTime) / duration,
            1
        );

        const value = Math.floor(
            start + (end - start) * progress
        );

        element.textContent =
        prefix +
        Number(value).toLocaleString() +
        suffix;

        if(progress < 1){

            requestAnimationFrame(update);

        }

    }

    requestAnimationFrame(update);

}

function initializeLiveReports(){

    onSnapshot(

        collection(db,"orders"),

        (snapshot)=>{

            loadReportStatistics();

            buildRevenueChart(snapshot);

            buildTicketChart(snapshot);

            loadReportsTable(snapshot);

        }

    );

}

function buildRevenueChart(snapshot){

    const revenueMap = {};

    snapshot.forEach(doc=>{

        const order = doc.data();

        if(order.payment?.status !== "Paid") return;
        if(!order.createdAt) return;

        const date = order.createdAt.toDate();

        const key =
            date.getFullYear() + "-" +
            String(date.getMonth()+1).padStart(2,"0") + "-" +
            String(date.getDate()).padStart(2,"0");

        if(!revenueMap[key]){

            revenueMap[key] = {

                revenue:0,
                tickets:0

            };

        }

        revenueMap[key].revenue +=
            Number(order.totals?.total || 0);

        revenueMap[key].tickets +=
            Number(order.ticket?.quantity || 1);

    });

    // No data
    if(Object.keys(revenueMap).length === 0){

        if(revenueChart){

            revenueChart.destroy();

        }

        return;

    }

    const sortedDates =
        Object.keys(revenueMap).sort();

    const labels = sortedDates.map(date=>{

        return new Date(date).toLocaleDateString(

            "en-NG",

            {

                day:"2-digit",
                month:"short"

            }

        );

    });

    const revenueData =
        sortedDates.map(d=>revenueMap[d].revenue);

    const ticketData =
        sortedDates.map(d=>revenueMap[d].tickets);

    const canvas =
        document.getElementById("revenueChart");

    const ctx =
        canvas.getContext("2d");

    if(revenueChart){

        revenueChart.destroy();

    }

    const gradient =
        ctx.createLinearGradient(0,0,0,350);

    gradient.addColorStop(
        0,
        "rgba(255,212,0,.45)"
    );

    gradient.addColorStop(
        1,
        "rgba(255,212,0,0)"
    );

    revenueChart = new Chart(ctx,{

        type:"line",

        data:{

            labels,

            datasets:[

                {

                    label:"Revenue",

                    data:revenueData,

                    borderColor:"#FFD400",

                    backgroundColor:gradient,

                    fill:true,

                    borderWidth:4,

                    pointRadius:6,

                    pointHoverRadius:9,

                    pointBackgroundColor:"#FFD400",

                    pointBorderColor:"#ffffff",

                    pointBorderWidth:2,

                    tension:0.45,

                    cubicInterpolationMode:"monotone",

                    yAxisID:"y"

                },

                {

                    label:"Tickets Sold",

                    data:ticketData,

                    borderColor:"#22c55e",

                    backgroundColor:"rgba(34,197,94,.15)",

                    fill:false,

                    borderWidth:2,

                    pointRadius:4,

                    pointHoverRadius:6,

                    pointBackgroundColor:"#22c55e",

                    pointBorderColor:"#ffffff",

                    pointBorderWidth:2,

                    tension:0.35,

                    cubicInterpolationMode:"monotone",

                    yAxisID:"y1"

                }

            ]

        },

        options:{

            responsive:true,

            maintainAspectRatio:false,

            interaction:{

                mode:"index",

                intersect:false

            },

            layout:{

                padding:20

            },

            animation:{

                duration:2200,

                easing:"easeOutExpo"

            },

            plugins:{

                legend:{

                    position:"bottom",

                    labels:{

                        color:"#ffffff",

                        usePointStyle:true,

                        pointStyle:"circle",

                        padding:25,

                        font:{

                            size:13,

                            weight:"600"

                        }

                    }

                },

                tooltip:{

                    backgroundColor:"#1c1c1c",

                    titleColor:"#FFD400",

                    bodyColor:"#ffffff",

                    borderColor:"#FFD400",

                    borderWidth:1,

                    padding:14,

                    displayColors:true,

                    callbacks:{

                        label(context){

                            if(context.dataset.label==="Revenue"){

                                return "Revenue: ₦" +
                                Number(context.raw)
                                .toLocaleString();

                            }

                            return "Tickets Sold: " +
                            context.raw;

                        }

                    }

                }

            },

            scales:{

                x:{

                    grid:{

                        display:false

                    },

                    ticks:{

                        color:"#bfbfbf"

                    }

                },

                y:{

                    type:"linear",

                    position:"left",

                    grid:{

                        color:"rgba(255,255,255,.08)"

                    },

                    border:{

                        display:false

                    },

                    ticks:{

                        callback(value){

                            return "₦" +
                            Number(value)
                            .toLocaleString();

                        }

                    }

                },

                y1:{

                    type:"linear",

                    position:"right",

                    grid:{

                        drawOnChartArea:false

                    },

                    border:{

                        display:false

                    }

                }

            }

        }

    });

}

const centerTextPlugin = {

    id:"centerText",

    beforeDraw(chart){

        const {

            width,

            height,

            ctx

        } = chart;

        ctx.save();

        const total =

        chart.data.datasets[0].data

        .reduce(

            (a,b)=>a+b,

            0

        );

        ctx.font =

        "bold 28px Arial";

        ctx.fillStyle =

        "#FFD400";

        ctx.textAlign="center";

        ctx.textBaseline="middle";

        ctx.fillText(

            total,

            width/2,

            height/2-10

        );

        ctx.font =

        "14px Arial";

        ctx.fillStyle="#bbb";

        ctx.fillText(

            "Tickets",

            width/2,

            height/2+20

        );

        ctx.restore();

    }

};

function buildTicketChart(snapshot){

    let regular = 0;
    let standard = 0;
    let premium = 0;

    snapshot.forEach(doc=>{

        const order = doc.data();

        if(order.payment?.status !== "Paid") return;

        const qty =
            Number(order.ticket?.quantity || 1);

        switch((order.ticket?.type || "").toLowerCase()){

            case "regular":
                regular += qty;
                break;

            case "standard":
                standard += qty;
                break;

            case "premium":
                premium += qty;
                break;

        }

    });

    const total =
        regular + standard + premium;

    const ctx =
        document
        .getElementById("ticketChart")
        .getContext("2d");

    if(ticketChart){

        ticketChart.destroy();

    }

    ticketChart = new Chart(ctx,{

        type:"doughnut",

        data:{

            labels:[
                "Regular",
                "Standard",
                "Premium"
            ],

            datasets:[{

                data:[
                    regular,
                    standard,
                    premium
                ],

                backgroundColor:[

                    "#22c55e",

                    "#FFD400",

                    "#3b82f6"

                ],

                hoverBackgroundColor:[

                    "#4ade80",

                    "#ffe45c",

                    "#60a5fa"

                ],

                borderColor:"#141414",

                borderWidth:5,

                hoverBorderWidth:7,

                hoverOffset:28,

                spacing:3

            }]

        },

        options:{

            responsive:true,

            maintainAspectRatio:false,

            cutout:"74%",

            layout:{

                padding:25

            },

            animation:{

                animateRotate:true,

                animateScale:true,

                duration:2000,

                easing:"easeOutExpo"

            },

            plugins:{

                legend:{

                    position:"bottom",

                    labels:{

                        color:"#ffffff",

                        usePointStyle:true,

                        pointStyle:"circle",

                        padding:25,

                        font:{

                            size:13,

                            weight:"600"

                        }

                    }

                },

                tooltip:{

                    backgroundColor:"#1c1c1c",

                    titleColor:"#FFD400",

                    bodyColor:"#ffffff",

                    borderColor:"#FFD400",

                    borderWidth:1,

                    padding:14,

                    displayColors:true,

                    callbacks:{

                        label(context){

                            const value =
                                context.raw;

                            const percent =
                                total===0
                                ?0
                                :(value/total)*100;

                            return `${context.label}: ${value} Tickets (${percent.toFixed(1)}%)`;

                        }

                    }

                }

            }

        },

        plugins:[centerTextPlugin]

    });

    updateTicketSummary(

    regular,

    standard,

    premium

);

}

function updateTicketSummary(

    regular,
    standard,
    premium

){

    const total =
        regular +
        standard +
        premium;

    const percent = value =>

        total===0

        ?0

        :((value/total)*100).toFixed(1);

    document.getElementById(

        "ticketSummary"

    ).innerHTML = `

<div class="ticket-total">

Total Tickets Sold:
<strong>${total}</strong>

</div>

<div class="ticket-row">

<div class="ticket-name">

<span
class="ticket-dot"
style="background:#22c55e"></span>

Regular

</div>

<div class="ticket-value">

${regular}
(${percent(regular)}%)

</div>

</div>

<div class="ticket-row">

<div class="ticket-name">

<span
class="ticket-dot"
style="background:#FFD400"></span>

Standard

</div>

<div class="ticket-value">

${standard}
(${percent(standard)}%)

</div>

</div>

<div class="ticket-row">

<div class="ticket-name">

<span
class="ticket-dot"
style="background:#3b82f6"></span>

Premium

</div>

<div class="ticket-value">

${premium}
(${percent(premium)}%)

</div>

</div>

`;

}

function filterReportTable(){

    let rows = [...allOrders];

    // Ticket Type Filter
    if(selectedTicketType !== "all"){

        rows = rows.filter(order=>{

            return (

                order.ticket?.type || ""

            ).toLowerCase() === selectedTicketType;

        });

    }

    // Revenue Date Filter
    if(selectedRevenueDate){

        rows = rows.filter(order=>{

            if(!order.createdAt) return false;

            const date =
                order.createdAt.toDate();

            const key =

                date.getFullYear()+"-"+

                String(date.getMonth()+1).padStart(2,"0")+"-"+

                String(date.getDate()).padStart(2,"0");

            return key===selectedRevenueDate;

        });

    }

    loadReportsTable(rows);

}

function loadReportsTable(snapshot){

    reportOrders = [];

    snapshot.forEach(doc=>{

        reportOrders.push({

            id:doc.id,

            ...doc.data()

        });

    });

    reportOrders.sort((a,b)=>{

        const aTime =
            a.createdAt
            ?
            a.createdAt.toMillis()
            :
            0;

        const bTime =
            b.createdAt
            ?
            b.createdAt.toMillis()
            :
            0;

        return bTime-aTime;

    });

    filteredOrders = [...reportOrders];

    reportCurrentPage = 1;

    renderReportTable();

}

function renderReportTable(){

    const tbody =

    document.getElementById("reportBody");

    tbody.innerHTML = "";

    if(filteredOrders.length===0){

        tbody.innerHTML = `

<tr>

<td colspan="6">

No matching records found.

</td>

</tr>

`;

        document.getElementById("reportPageInfo").textContent =
        "Page 0 of 0";

        return;

    }

    const totalPages =

    Math.ceil(

        filteredOrders.length /

        reportRowsPerPage

    );

    if(reportCurrentPage > totalPages){

        reportCurrentPage = totalPages;

    }

    const start =

    (reportCurrentPage-1) *

    reportRowsPerPage;

    const end =

    start +

    reportRowsPerPage;

    const pageData =

    filteredOrders.slice(start,end);

    let html = "";

    pageData.forEach(order=>{

        html += `

<tr>

<td>

${order.ticketNumber || order.orderId || order.id}

</td>

<td>

${order.buyer?.name || "-"}

</td>

<td>

${order.ticket?.type || "-"}

</td>

<td>

₦${Number(order.totals?.total || 0).toLocaleString()}

</td>

<td>

${order.payment?.status || "-"}

</td>

<td>

${order.createdAt

?

order.createdAt.toDate().toLocaleDateString()

:

"-"}

</td>

</tr>

`;

    });

    tbody.innerHTML = html;

    document.getElementById("reportPageInfo").textContent =

    `Page ${reportCurrentPage} of ${totalPages}`;

    document.getElementById("prevReportPage").disabled =

    reportCurrentPage===1;

    document.getElementById("nextReportPage").disabled =

    reportCurrentPage===totalPages;

    updateExecutiveInsights();

}

function updateExecutiveInsights(){

    if(reportOrders.length === 0) return;

    const totals = {

        regular:0,
        standard:0,
        premium:0

    };

    const revenue = {

        regular:0,
        standard:0,
        premium:0

    };

    reportOrders.forEach(order=>{

        if(order.payment?.status !== "Paid") return;

        const qty = Number(order.ticket?.quantity || 1);

        const amount = Number(order.totals?.total || 0);

        const type = (order.ticket?.type || "").toLowerCase();

        if(totals[type] !== undefined){

            totals[type] += qty;
            revenue[type] += amount;

        }

    });

    const bestSeller = Object.keys(totals).reduce((a,b)=>

        totals[a] > totals[b] ? a : b

    );

    const highestRevenue = Object.keys(revenue).reduce((a,b)=>

        revenue[a] > revenue[b] ? a : b

    );

    document.getElementById("bestTicketType").textContent =
    bestSeller.toUpperCase();

    document.getElementById("highestRevenue").textContent =
    highestRevenue.toUpperCase();

    document.getElementById("averageTicketValue").textContent =
    "₦" +
    Math.round(
        analytics.totalRevenue /
        Math.max(analytics.ticketsSold,1)
    ).toLocaleString();

    generateDashboardInsights();

}

function generateDashboardInsights(){

    const insights = [

        `💰 Total revenue generated is ₦${analytics.totalRevenue.toLocaleString()}.`,

        `✅ ${analytics.checkedIn} guests have successfully checked in.`,

        `⚠️ ${analytics.remainingGuests} paid guests are yet to check in.`,

        `🏆 ${document.getElementById("highestRevenue").textContent} tickets generated the highest revenue.`

    ];

    document.getElementById("dashboardInsights").innerHTML =

        insights.map(text =>

            `<div class="insight-card">${text}</div>`

        ).join("");

}

document

.getElementById("refreshReports")

.onclick = ()=>{

showAlert(

"Reports are updating automatically.",

"success"

);

};

document.getElementById("exportExcel").onclick = exportExcel;

function exportExcel(){

    let csv = [];

    csv.push([

        "Ticket Number",

        "Buyer",

        "Ticket Type",

        "Amount",

        "Payment",

        "Date"

    ].join(","));

    reportOrders.forEach(order=>{

        csv.push([

            `"${order.ticketNumber || order.orderId || order.id}"`,

            `"${order.buyer?.name || ""}"`,

            `"${order.ticket?.type || ""}"`,

            order.totals?.total || 0,

            order.payment?.status || "",

            order.createdAt

            ?

            order.createdAt.toDate().toLocaleDateString()

            :

            ""

        ].join(","));

    });

    const blob = new Blob(

        [csv.join("\n")],

        {

            type:"text/csv"

        }

    );

    const url =

    URL.createObjectURL(blob);

    const a =

    document.createElement("a");

    a.href = url;

    a.download =

    `TACH_Sales_Report_${new Date().toISOString().slice(0,10)}.csv`;

    a.click();

    URL.revokeObjectURL(url);

}

document.getElementById("exportPDF").onclick = exportPDF;

function exportPDF(){

    const { jsPDF } = window.jspdf;

    const pdf = new jsPDF();

    pdf.setFontSize(18);

    pdf.text(

        "THE ALTAR CALLED HOME",

        14,

        18

    );

    pdf.setFontSize(12);

    pdf.text(

        "Sales Report",

        14,

        26

    );

    pdf.autoTable({

        startY:35,

        head:[[

            "Ticket No",

            "Buyer",

            "Type",

            "Amount",

            "Status",

            "Date"

        ]],

        body: reportOrders.map(order=>[

            order.ticketNumber || order.orderId || order.id,

            order.buyer?.name || "-",

            order.ticket?.type || "-",

            "₦"+Number(order.totals?.total || 0).toLocaleString(),

            order.payment?.status || "-",

            order.createdAt

            ?

            order.createdAt.toDate().toLocaleDateString()

            :

            "-"

        ])

    });

    pdf.save(

        "TACH_Sales_Report.pdf"

    );

}

document.getElementById("reportSearch")

.addEventListener("input",function(){

    const search =

    this.value

    .toLowerCase()

    .trim();

    filteredOrders = reportOrders.filter(order=>{

        return(

            (order.ticketNumber||"")

            .toLowerCase()

            .includes(search)

            ||

            (order.orderId||"")

            .toLowerCase()

            .includes(search)

            ||

            (order.buyer?.name||"")

            .toLowerCase()

            .includes(search)

            ||

            (order.ticket?.type||"")

            .toLowerCase()

            .includes(search)

            ||

            (order.payment?.status||"")

            .toLowerCase()

            .includes(search)

        );

    });

    renderReportTable();

});

document.getElementById(

    "prevReportPage"

).onclick = ()=>{

    if(reportCurrentPage>1){

        reportCurrentPage--;

        renderReportTable();

    }

};

document.getElementById(

    "nextReportPage"

).onclick = ()=>{

    const totalPages =

    Math.ceil(

        filteredOrders.length/

        reportRowsPerPage

    );

    if(reportCurrentPage<totalPages){

        reportCurrentPage++;

        renderReportTable();

    }

};