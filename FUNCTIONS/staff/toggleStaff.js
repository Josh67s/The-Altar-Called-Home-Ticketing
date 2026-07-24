const { onCall, HttpsError } =
require("firebase-functions/v2/https");

const admin =
require("firebase-admin");

const db =
admin.firestore();

exports.toggleStaff = onCall(

async(request)=>{

    const {

        uid,
        active

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

        active,

        updatedAt:
        admin.firestore.FieldValue.serverTimestamp()

    });

    await admin.auth()
    .updateUser(uid,{

        disabled: !active

    });

    return{

        success:true

    };

});