import {

    initializeNavigation

} from "./navigation.js";

import {

    logout

} from "./auth.js";

export function initializeLayout(){

    initializeNavigation();

    loadAdmin();

    registerLogout();

}

function loadAdmin(){

    const admin =

        window.loggedInStaff;

    if(!admin) return;

    const adminName =

        document.getElementById("adminName");

    if(adminName){

        adminName.textContent =

            admin.name;

    }

    const currentDate =

        document.getElementById("currentDate");

    if(currentDate){

        currentDate.textContent =

            new Date().toLocaleDateString(

                "en-NG",

                {

                    weekday:"long",

                    year:"numeric",

                    month:"long",

                    day:"numeric"

                }

            );

    }

}

function registerLogout(){

    const logoutBtn =

        document.getElementById("logoutBtn");

    if(!logoutBtn) return;

    logoutBtn.addEventListener(

        "click",

        logout

    );

}