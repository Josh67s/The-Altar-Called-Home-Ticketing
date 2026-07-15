import {
    db,
    functions,
    httpsCallable,
    collection,
    doc,
    setDoc,
    serverTimestamp
} from "../js/firebase-config.js";

console.log("Firebase Connected!");

console.log(db);

async function testCloudFunction(){

    try{

        const verifyPayment =
            httpsCallable(functions, "verifyPayment");

        const result =
            await verifyPayment({

                reference: "TEST-12345"

            });

        console.log(result.data);

    }

    catch(error){

        console.error(error);

    }

}
/*==================================
STEP WIZARD
==================================*/

const panels = document.querySelectorAll(".step-panel");
const steps = document.querySelectorAll(".step");

/*==================================
TICKET SELECTION
==================================*/

const cards = document.querySelectorAll(".ticket-card");


/*==================================
QUANTITY
==================================*/

const quantityText = document.getElementById("quantity");
const ticketPrice = document.getElementById("ticketPrice");
const totalPrice = document.getElementById("totalPrice");

const plusBtn = document.getElementById("plusBtn");
const minusBtn = document.getElementById("minusBtn");

const quantityContinue = document.getElementById("quantityContinue");

const downloadTicketBtn = document.getElementById("downloadTicketBtn");


/*==================================
BUYER
==================================*/

const buyerContinue = document.getElementById("buyerContinue");

function showStep(stepNumber){

    panels.forEach(panel=>{

        panel.classList.remove("active");

    });

    steps.forEach(step=>{

        step.classList.remove("active");

    });

    document
        .getElementById(`step${stepNumber}`)
        .classList
        .add("active");

    steps[stepNumber-1]
        .classList
        .add("active");

}



const prices = {

    regular:1000,

    standard:2000,

    premium:5000

};

const order = {

    ticket:{

        type:null,

        price:0,

        quantity:1

    },

    buyer:{

        name:"",

        email:"",

        phone:""

    },

    attendees:[],

    totals:{

        subtotal:0,

        serviceFee:0,

        total:0

    },

    payment:{

    status:"Pending",

    reference:null,

    firestoreId:null,

    gateway:"Paystack",

    paidAt:null

}

};

function generatePaymentReference(){

    if(order.payment.reference){

        return;

    }

    order.payment.reference =
        "TACH-" + Date.now();

}

async function saveOrder(){

    try{

        const orderRef =
            doc(collection(db,"orders"));

        order.payment.firestoreId =
            orderRef.id;

        await setDoc(orderRef,{

            ticket:order.ticket,

            buyer:order.buyer,

            attendees:order.attendees,

            totals:order.totals,

            payment:order.payment,

            createdAt:serverTimestamp()

        });

        console.log(
            "Order Saved:",
            orderRef.id
        );

        return orderRef.id;

    }

    catch(error){

        console.error(error);

        alert("Unable to save order.");

        return null;

    }

}

function updateSummary(){

    quantityText.textContent = order.ticket.quantity;

    ticketPrice.textContent =
    "₦" + order.ticket.price.toLocaleString();

    totalPrice.textContent =
    "₦" + (
            order.ticket.price *
            order.ticket.quantity
        ).toLocaleString();

}

cards.forEach(card=>{

    card.addEventListener("click",()=>{

        cards.forEach(c=>c.classList.remove("selected"));

        card.classList.add("selected");

    order.ticket.type = card.dataset.ticket;

order.ticket.price = prices[order.ticket.type];

        updateSummary();

        showStep(2);

    });

});

plusBtn.addEventListener("click",()=>{

    order.ticket.quantity++;

    updateSummary();

});

minusBtn.addEventListener("click",()=>{

    if(order.ticket.quantity > 1){

        order.ticket.quantity--;

        updateSummary();

    }

});

function generateAttendeeForms(){

    const container = document.getElementById("attendeeContainer");

    container.innerHTML="";

    for(let i=1;i<=order.ticket.quantity;i++){

        container.innerHTML += `

<div class="attendee-card">

    <h3>

        Attendee ${i}

    </h3>

    <input
        type="text"
        class="attendee-name"
        placeholder="Full Name">

    <input
        type="email"
        class="attendee-email"
        placeholder="Email Address">

    <input
        type="tel"
        class="attendee-phone"
        placeholder="Phone Number">

</div>

`;

const buyerAttending =
    document.getElementById("buyerAttending");

if (buyerAttending.checked) {

    const firstCard =
        container.querySelector(".attendee-card");

    if (firstCard) {

        firstCard.querySelector(".attendee-name").value =
            document.getElementById("buyerName").value;

        firstCard.querySelector(".attendee-email").value =
            document.getElementById("buyerEmail").value;

        firstCard.querySelector(".attendee-phone").value =
            document.getElementById("buyerPhone").value;

    }

}

    }

}


updateSummary();

quantityContinue.addEventListener("click",()=>{

    showStep(3);

});

buyerContinue.addEventListener("click", () => {

    const buyerName =
        document.getElementById("buyerName").value.trim();

    const buyerEmail =
        document.getElementById("buyerEmail").value.trim();

    const buyerPhone =
        document.getElementById("buyerPhone").value.trim();

    if(!buyerName || !buyerEmail || !buyerPhone){

        alert("Please complete all buyer information.");

        return;

    }

    order.buyer.name = buyerName;

order.buyer.email = buyerEmail;

order.buyer.phone = buyerPhone;

    showStep(4);

generateAttendeeForms();

});

function saveAttendees(){

    order.attendees = [];

    const attendeeCards =
        document.querySelectorAll(".attendee-card");

    attendeeCards.forEach(card=>{

        order.attendees.push({

            name:
                card.querySelector(".attendee-name").value,

            email:
                card.querySelector(".attendee-email").value,

            phone:
                card.querySelector(".attendee-phone").value

        });

    });

    order.totals.subtotal =
    order.ticket.price * order.ticket.quantity;

order.totals.serviceFee = 0;

order.totals.total =
    order.totals.subtotal +
    order.totals.serviceFee;

}

function populateReview(){

    document.getElementById("reviewTicket").textContent =
        order.ticket.type.charAt(0).toUpperCase() +
        order.ticket.type.slice(1);

    document.getElementById("reviewPrice").textContent =
        "₦" + order.ticket.price.toLocaleString();

    document.getElementById("reviewQuantity").textContent =
        order.ticket.quantity;

        document.getElementById("reviewSubtotal").textContent =
    "₦" + order.totals.subtotal.toLocaleString();

document.getElementById("reviewServiceFee").textContent =
    "₦" + order.totals.serviceFee.toLocaleString();

    document.getElementById("reviewTotal").textContent =
"₦" + order.totals.total.toLocaleString();

    document.getElementById("reviewBuyer").textContent =
    order.buyer.name;

document.getElementById("reviewEmail").textContent =
    order.buyer.email;

document.getElementById("reviewPhone").textContent =
    order.buyer.phone;

    const attendeeList =
        document.getElementById("reviewAttendees");

    attendeeList.innerHTML = "";

    order.attendees.forEach((attendee,index)=>{

    attendeeList.innerHTML += `

        <div class="review-attendee">

            <strong>Attendee ${index+1}</strong>

            <p><strong>Name:</strong> ${attendee.name}</p>

            <p><strong>Email:</strong> ${attendee.email}</p>

            <p><strong>Phone:</strong> ${attendee.phone}</p>

        </div>

    `;

});

}

function populatePayment(){

    document.getElementById("paymentTicket").textContent =
        order.ticket.type.charAt(0).toUpperCase() +
        order.ticket.type.slice(1);

        document.getElementById("paymentReference").textContent =
    order.payment.reference;

    document.getElementById("paymentQuantity").textContent =
        order.ticket.quantity;

    document.getElementById("paymentSubtotal").textContent =
        "₦" + order.totals.subtotal.toLocaleString();

    document.getElementById("paymentServiceFee").textContent =
        "₦" + order.totals.serviceFee.toLocaleString();

    document.getElementById("paymentTotal").textContent =
        "₦" + order.totals.total.toLocaleString();

    document.getElementById("payNowBtn").textContent =
        `Pay ₦${order.totals.total.toLocaleString()}`

}

const attendeeBack =
    document.getElementById("attendeeBack");

const attendeeContinue =
    document.getElementById("attendeeContinue");

attendeeBack.addEventListener("click", () => {

    showStep(3);

});

attendeeContinue.addEventListener("click",()=>{

    saveAttendees();

    populateReview();

    showStep(5);

});

const reviewBack =
    document.getElementById("reviewBack");

const reviewContinue =
    document.getElementById("reviewContinue");

reviewBack.addEventListener("click",()=>{

    showStep(4);

});

reviewContinue.addEventListener("click", async ()=>{

    generatePaymentReference();

    const firestoreId = await saveOrder();

    if(!firestoreId){

        return;

    }

    populatePayment();

    showStep(6);

});

const paymentBack =
    document.getElementById("paymentBack");

const payNowBtn =
    document.getElementById("payNowBtn");

paymentBack.addEventListener("click",()=>{

    showStep(5);


});

payNowBtn.addEventListener("click",()=>{

    startPayment();

});


function startPayment(){
    const handler = PaystackPop.setup({ key: "pk_test_548002a8e57df2518abb4b105557b055ff916ffe", 
        email: order.buyer.email, 
        amount: order.totals.total * 100, 
        ref: order.payment.reference, 
        currency: "NGN", 
        metadata:{ 
            custom_fields:[ 
                { display_name:"Buyer Name", 
                    variable_name:"buyer_name", 
                    value:order.buyer.name }, 
                    { display_name:"Ticket Type", 
                        variable_name:"ticket_type", 
                        value:order.ticket.type }, 
                        { display_name:"Quantity", 
                            variable_name:"quantity", 
                            value:order.ticket.quantity } ] },

callback: function(response){

    verifyPaymentOnServer(response);

},

onClose:function(){

            alert("Payment window closed.");

        }

  });

handler.openIframe();

}

async function verifyPaymentOnServer(response){

    try{

        const verifyPayment =
            httpsCallable(functions, "verifyPayment");

        const result =
            await verifyPayment({

                reference: response.reference

            });

        console.log("Verification Result:");
console.log(result.data);

order.payment.firestoreId =
    result.data.orderId;

order.ticket.ticketNumber =
    result.data.ticketNumber;


    populateDigitalTicket();

showStep(7);

alert(
    `Payment verified!\n\nTicket Number:\n${result.data.ticketNumber}`
);

    }

    catch(error){

        console.error(error);

        alert("Payment verification failed.");

    }

}
        

function populateDigitalTicket(){

    document.getElementById("ticketNumberDisplay").textContent =
        order.ticket.ticketNumber;

    document.getElementById("ticketBuyerDisplay").textContent =
        order.buyer.name;

    document.getElementById("ticketTypeDisplay").textContent =
    order.ticket.type.charAt(0).toUpperCase() +
    order.ticket.type.slice(1);

    document.getElementById("ticketQuantityDisplay").textContent =
        order.ticket.quantity;

        const badge =
    document.getElementById("ticketCategoryBadge");

badge.textContent =
    order.ticket.type.toUpperCase();

badge.className = "ticket-category-badge";

badge.classList.add(
    "badge-" + order.ticket.type.toLowerCase()
);

const qrContainer =
    document.getElementById("qrcode");

    console.log(order.payment.firestoreId);

qrContainer.innerHTML = "";

const verificationUrl =

    `${window.location.origin}/verify.html?id=${order.payment.firestoreId}`;

new QRCode(qrContainer,{

    text: verificationUrl,

    width:180,

    height:180

});

}

downloadTicketBtn.addEventListener("click", downloadTicket);

async function downloadTicket(){

    const ticket =
        document.querySelector(".digital-ticket");

    try{

        const canvas = await html2canvas(ticket,{

            scale:3,

            useCORS:true,

            backgroundColor:"#111111"

        });

        const image =
            canvas.toDataURL("image/png");

        const link =
            document.createElement("a");

        link.href = image;

        link.download =
            `${order.ticket.ticketNumber}.png`;

        link.click();

    }

    catch(error){

        console.error(error);

        alert("Unable to download ticket.");

    }

}

