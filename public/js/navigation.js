export function initializeNavigation(){

    const routes = {

        navDashboard: "admin.html",

        navTickets: "tickets.html",

        navOrders: "orders.html",

        navStaff: "staff.html",

        navReports: "reports.html",

        navSettings: "settings.html"

    };

    const currentPage =

        window.location.pathname.split("/").pop();

    Object.entries(routes).forEach(([id,page])=>{

        const item = document.getElementById(id);

        if(!item) return;

        item.style.cursor = "pointer";

        if(currentPage === page){

            item.classList.add("active");

        }else{

            item.classList.remove("active");

        }

        item.addEventListener("click",()=>{

            window.location.href = page;

        });

    });

}