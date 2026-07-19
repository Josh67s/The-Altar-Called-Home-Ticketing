console.log("THE ALTAR CALLED HOME");

// Premiere Date
const premiereDate = new Date("August 07, 2026 16:00:00").getTime();

function updateCountdown() {

    const now = new Date().getTime();

    const difference = premiereDate - now;

    if (difference <= 0) {

        document.getElementById("days").textContent = "00";
        document.getElementById("hours").textContent = "00";
        document.getElementById("minutes").textContent = "00";
        document.getElementById("seconds").textContent = "00";

        return;
    }

    const days = Math.floor(difference / (1000 * 60 * 60 * 24));

    const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

    const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));

    const seconds = Math.floor((difference % (1000 * 60)) / 1000);

    document.getElementById("days").textContent = String(days).padStart(2, "0");
    document.getElementById("hours").textContent = String(hours).padStart(2, "0");
    document.getElementById("minutes").textContent = String(minutes).padStart(2, "0");
    document.getElementById("seconds").textContent = String(seconds).padStart(2, "0");

}

updateCountdown();

setInterval(updateCountdown, 1000);

window.addEventListener("load", () => {

    document.querySelector(".hero-content").classList.add("show");

});

const sections = document.querySelectorAll("section[id]");
const navLinks = document.querySelectorAll(".nav-links a");

window.addEventListener("scroll", () => {

    let current = "";

    sections.forEach(section => {

        const sectionTop = section.offsetTop - 120;

        const sectionHeight = section.offsetHeight;

        if (window.scrollY >= sectionTop &&
            window.scrollY < sectionTop + sectionHeight) {

            current = section.getAttribute("id");

        }

    });

    navLinks.forEach(link => {

        link.classList.remove("active");

        if (link.getAttribute("href") === "#" + current) {

            link.classList.add("active");

        }

    });

});

const trailerButtons =
document.querySelectorAll(".watchTrailer");

const trailerModal =
document.getElementById("trailerModal");

const trailerFrame =
document.getElementById("trailerFrame");

const closeTrailer =
document.getElementById("closeTrailer");

// Official Trailer URL
// Replace this with your YouTube embed link when the trailer is released.
const trailerURL = "";

trailerButtons.forEach(button=>{

button.addEventListener("click",(e)=>{

e.preventDefault();

if(!trailerURL){

alert("Official trailer coming soon.");

return;

}

trailerFrame.src =
trailerURL + "?autoplay=1";

trailerModal.style.display="flex";

});

});

closeTrailer.addEventListener("click",()=>{

trailerModal.style.display="none";

trailerFrame.src="";

});

window.addEventListener("click",(e)=>{

if(e.target===trailerModal){

trailerModal.style.display="none";

trailerFrame.src="";

}

});

const menuToggle =
document.getElementById("menuToggle");

const navMenu =
document.querySelector(".nav-links");

menuToggle.addEventListener("click",()=>{

navMenu.classList.toggle("active");

if(navMenu.classList.contains("active")){

menuToggle.innerHTML="✕";

}else{

menuToggle.innerHTML="☰";

}

});

document
.querySelectorAll(".nav-links a")
.forEach(link=>{

    link.addEventListener("click",()=>{

        navMenu.classList.remove("active");

        menuToggle.innerHTML="☰";

    });

});


const navbar =
document.querySelector(".navbar");

window.addEventListener("scroll",()=>{

if(window.scrollY>50){

navbar.classList.add("shrink");

}else{

navbar.classList.remove("shrink");

}

});