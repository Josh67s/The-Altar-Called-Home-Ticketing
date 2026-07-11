import {

    db,

    collection,

    addDoc,

    serverTimestamp

} from "../js/firebase-config.js";
console.log("Firebase Connected!");

console.log(db);
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

async function saveOrder(){

    try{

        const docRef = await addDoc(

            collection(db,"orders"),

            {

                ticket:order.ticket,

                buyer:order.buyer,

                attendees:order.attendees,

                totals:order.totals,

                payment:order.payment,

                createdAt:serverTimestamp()

            }

        );

        order.payment.firestoreId = docRef.id;

        console.log("Order Saved:",docRef.id);

        return docRef.id;

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

    const firestoreId = await saveOrder();

    if(!firestoreId){

        return;

    }

    showStep(6);

});

const paymentBack =
    document.getElementById("paymentBack");

const payNowBtn =
    document.getElementById("payNowBtn");

paymentBack.addEventListener("click",()=>{

    showStep(5);

});

reviewContinue.addEventListener("click",()=>{

    generateOrderNumber();

    showStep(6);

});

function generateOrderNumber(){

    const orderNumber =
        "TACH-" +
        Date.now();

    order.payment.reference =
        orderNumber;

    document.getElementById("paymentOrderNumber").textContent =
        orderNumber;

    document.getElementById("paymentAmount").textContent =
        "₦" +
        order.totals.total.toLocaleString();

}