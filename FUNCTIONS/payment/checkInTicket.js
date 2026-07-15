const { onCall, HttpsError } =
require("firebase-functions/v2/https");

const admin = require("firebase-admin");

const db = admin.firestore();

exports.checkInTicket = onCall(

    async(request)=>{

        const orderId =
            request.data.orderId;

        const usher =
            request.data.usher || "Unknown";

        if(!orderId){

            throw new HttpsError(

                "invalid-argument",

                "Order ID required."

            );

        }

        const ticketSnapshot =
            await db
            .collection("tickets")
            .where("orderId","==",orderId)
            .limit(1)
            .get();

        if(ticketSnapshot.empty){

            throw new HttpsError(

                "not-found",

                "Ticket not found."

            );

        }

        const ticketDoc =
            ticketSnapshot.docs[0];

        const ticket =
            ticketDoc.data();

        if(ticket.used){

            throw new HttpsError(

                "already-exists",

                "Ticket already checked in."

            );

        }

        await ticketDoc.ref.update({

            used:true,

            checkedInAt:
                admin.firestore.FieldValue.serverTimestamp(),

            checkedInBy:usher

        });

        return{

            success:true,

            ticketNumber:
                ticket.ticketNumber

        };

    }

);