const { onCall, HttpsError } =
require("firebase-functions/v2/https");

const admin =
require("firebase-admin");

const {

    sendPasswordResetEmail,

    gmailEmail,

    gmailPassword

} = require("../services/emailService");

function generatePassword(){

    const chars =
    "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

    let part1 = "";
    let part2 = "";

    for(let i = 0; i < 4; i++){

        part1 += chars[
            Math.floor(Math.random() * chars.length)
        ];

        part2 += chars[
            Math.floor(Math.random() * chars.length)
        ];

    }

    return `TACH-${part1}-${part2}`;

}

exports.resetStaffPassword = onCall(

{

    secrets:[

        gmailEmail,

        gmailPassword

    ]

},

async(request)=>{

    const { uid } = request.data;

    if(!uid){

        throw new HttpsError(

            "invalid-argument",

            "Staff ID is required."

        );

    }

    const user =

    await admin.auth().getUser(uid);

    const password =

    generatePassword();

    await admin.auth().updateUser(

        uid,

        {

            password

        }

    );

    await sendPasswordResetEmail({

        fullName:

            user.displayName ||

            "Staff",

        email:

            user.email,

        password

    });

    return{

        success:true,

        message:

        "Password reset successfully."

    };

}

);