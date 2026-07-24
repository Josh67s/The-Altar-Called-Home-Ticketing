const { onCall, HttpsError } =
require("firebase-functions/v2/https");

const admin =
require("firebase-admin");

const db =
admin.firestore();

exports.updateStaff = onCall(

async(request)=>{

    const {

        uid,

        fullName,

        phone,

        role

    } = request.data;

    if(!uid){

        throw new HttpsError(

            "invalid-argument",

            "Staff ID required."

        );

    }

    await db
    .collection("staff")
    .doc(uid)
    .update({

        fullName,

        phone,

        role,

        updatedAt:
        admin.firestore.FieldValue.serverTimestamp()

    });

    return{

        success:true

    };

});