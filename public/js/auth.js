import{

    auth,

    db,

    doc,

    getDoc,

    onAuthStateChanged

}

from "./firebase-config.js";

import{

signOut

}

from "./firebase-config.js";

export function protectPage(requiredRole){

    onAuthStateChanged(

        auth,

        async(user)=>{

            if(!user){

                window.location="login.html";

                return;

            }

            try{

                const staffRef=

                    doc(

                        db,

                        "staff",

                        user.uid

                    );

                const snap=

                    await getDoc(staffRef);

                if(!snap.exists()){

                    await signOut(auth);

                    window.location="login.html";

                    return;

                }

                const staff=

                    snap.data();

                if(!staff.active){

                    await signOut(auth);

                    window.location="login.html";

                    return;

                }

                if(staff.role!==requiredRole){

                    alert("Access Denied");

                    window.location="login.html";

                    return;

                }

                window.loggedInStaff=

                    staff;

                    if(window.onUserReady){

    window.onUserReady(staff);

}

            }

            catch(error){

                console.error(error);

            }

        }

    );

}