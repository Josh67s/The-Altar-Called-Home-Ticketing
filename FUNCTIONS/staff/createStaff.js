const {

    sendStaffWelcomeEmail,

    gmailEmail,

    gmailPassword

} = require("../services/emailService");

const { onCall, HttpsError } =
require("firebase-functions/v2/https");

const {
    defineSecret
} = require("firebase-functions/params");

const admin =
require("firebase-admin");

const db =
admin.firestore();

exports.createStaff = onCall(

{

    secrets:[

        gmailEmail,

        gmailPassword

    ]

},

async(request)=>{

    const data = request.data;

    if(
        !data.fullName ||
        !data.email ||
        !data.phone ||
        !data.password ||
        !data.role
    ){

        throw new HttpsError(

            "invalid-argument",

            "All fields are required."

        );

    }

    const {

    fullName,

    email,

    phone,

    password,

    role

} = data;

// Check if email already exists

try{

    console.log({

    fullName,

    email,

    phone,

    role,

    password,

    passwordType: typeof password,

    passwordLength: password ? password.length : 0

});

    await admin.auth().getUserByEmail(email);

    throw new HttpsError(

        "already-exists",

        "A staff account with this email already exists."

    );

}catch(error){

    if(error.code !== "auth/user-not-found"){

        throw error;

    }

}

const userRecord =

await admin.auth().createUser({

    displayName: fullName,

    email,

    password,

    disabled:false

});

await db.collection("staff")

.doc(userRecord.uid)

.set({

    fullName,

    email,

    phone,

    role,

    status:"Active",

    active: true,

    authUid:userRecord.uid,

    photoURL:"",

    lastLogin:null,

    createdBy:

        request.auth?.uid || "System",

    createdAt:

        admin.firestore.FieldValue.serverTimestamp(),

    updatedAt:

        admin.firestore.FieldValue.serverTimestamp()

});

await sendStaffWelcomeEmail({

    fullName,

    email,

    password,

    role

});

return{

    success:true,

    uid:userRecord.uid

};

});