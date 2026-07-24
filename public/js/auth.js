import{

    auth,

    db,

    doc,

    getDoc,

    onAuthStateChanged,

    signOut

}

from "./firebase-config.js";

export let currentUser = null;

export function protectPage(requiredRole){

    onAuthStateChanged(

        auth,

        async(user)=>{

            if(!user){

                window.location="login.html";

                return;

            }

            try{

                const staffRef =

                    doc(

                        db,

                        "staff",

                        user.uid

                    );

                const snap =

                    await getDoc(staffRef);

                if(!snap.exists()){

                    await signOut(auth);

                    window.location="login.html";

                    return;

                }

                const staff =

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

                currentUser = {

                    uid:user.uid,

                    ...staff

                };

                window.loggedInStaff = currentUser;

                if(window.onUserReady){

                    window.onUserReady(currentUser);

                }

            }

            catch(error){

                console.error(error);

            }

        }

    );

}

export async function logout(){

    try{

        await signOut(auth);

        window.location="login.html";

    }

    catch(error){

        console.error(error);

    }

}