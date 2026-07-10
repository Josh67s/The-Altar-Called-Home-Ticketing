const cards = document.querySelectorAll(".ticket-card");
const continueBtn = document.getElementById("continueBtn");

const quantityText = document.getElementById("quantity");
const ticketPrice = document.getElementById("ticketPrice");
const totalPrice = document.getElementById("totalPrice");

const plusBtn = document.getElementById("plusBtn");
const minusBtn = document.getElementById("minusBtn");

let quantity = 1;

let selectedTicket = null;

let price = 0;

const prices = {

    regular:1000,

    standard:2000,

    premium:5000

};

function updateSummary(){

    quantityText.textContent = quantity;

    ticketPrice.textContent =
        "₦" + price.toLocaleString();

    totalPrice.textContent =
        "₦" + (price * quantity).toLocaleString();

}

cards.forEach(card=>{

    card.addEventListener("click",()=>{

        cards.forEach(c=>c.classList.remove("selected"));

        card.classList.add("selected");

        selectedTicket = card.dataset.ticket;

        price = prices[selectedTicket];

        continueBtn.disabled = false;

        updateSummary();

    });

});

plusBtn.addEventListener("click",()=>{

    quantity++;

    updateSummary();

});

minusBtn.addEventListener("click",()=>{

    if(quantity>1){

        quantity--;

        updateSummary();

    }

});

continueBtn.addEventListener("click",()=>{

    alert(

        `Ticket: ${selectedTicket}
Quantity: ${quantity}
Total: ₦${(price*quantity).toLocaleString()}`

    );

});

updateSummary();