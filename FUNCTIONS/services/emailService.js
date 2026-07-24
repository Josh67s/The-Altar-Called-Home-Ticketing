const nodemailer = require("nodemailer");

const { defineSecret } = require("firebase-functions/params");

const gmailEmail =
defineSecret("GMAIL_EMAIL");

const gmailPassword =
defineSecret("GMAIL_APP_PASSWORD");


// Send Ticket Email
async function sendTicketEmail(order){

    const transporter = nodemailer.createTransport({

        service:"gmail",

        auth:{

            user:gmailEmail.value(),

            pass:gmailPassword.value()

        }

    });

    const ticketName =

order.ticket.type==="premium"

? "Premium Access"

: order.ticket.type==="standard"

? "Standard Access"

: "Regular Access";

    const html = `

    <div style="font-family:Arial,sans-serif;padding:30px;background:#f5f5f5;">

        <div style="max-width:650px;margin:auto;background:#ffffff;border-radius:12px;padding:30px;border-top:6px solid #D4AF37;">

            <h1 style="color:#D4AF37;text-align:center;margin-bottom:5px;">
                THE ALTAR CALLED HOME
            </h1>

            <p style="text-align:center;color:#777;">
                Amazing Crew TV Production
            </p>

            <hr>

            <h2>Hello ${order.buyer.name},</h2>

            <p>

                Thank you for purchasing your ticket for the premiere of

                <strong>THE ALTAR CALLED HOME.</strong>

            </p>

            <table style="width:100%;border-collapse:collapse;">

                <tr>

                    <td><strong>Order ID</strong></td>

                    <td>${order.id}</td>

                </tr>

                <tr>

                    <td><strong>Ticket Number</strong></td>

                    <td>${order.ticketNumber || "-"}</td>

                </tr>

                <tr>

                    <td><strong>Ticket</strong></td>

                    <td>${ticketName}</td>

                </tr>

                <tr>

                    <td><strong>Quantity</strong></td>

                    <td>${order.ticket.quantity}</td>

                </tr>

                <tr>

                    <td><strong>Total Paid</strong></td>

                    <td>₦${Number(order.totals.total).toLocaleString()}</td>

                </tr>

            </table>

            <br>

            <h3>Premiere Information</h3>

            <p>

                📅 Friday, September 4, 2026<br>

                🕓 4:00 PM<br>

                📍 Assemblies of God Church Umudibia Nekede, Owerri.

            </p>

            <p>

                Please keep this email for your records.

            </p>

            <hr>

            <p style="font-size:12px;color:#777;text-align:center;">

                © 2026 Amazing Crew TV Production

            </p>

        </div>

    </div>

    `;

     await transporter.sendMail({
        from: `"Amazing Crew TV Production" <${gmailEmail.value()}>`,
        to: order.buyer.email,
        subject: "Your Ticket - THE ALTAR CALLED HOME",
        html
    });

}

// Send Staff Login Credentials
async function sendStaffWelcomeEmail(staff){

    const transporter = nodemailer.createTransport({

        service: "gmail",

        auth:{

            user: gmailEmail.value(),

            pass: gmailPassword.value()

        }

    });

    const html = `

    <div style="font-family:Arial,sans-serif;padding:30px;background:#f5f5f5;">

        <div style="max-width:650px;margin:auto;background:#ffffff;padding:35px;border-radius:12px;border-top:6px solid #D4AF37;">

            <h1 style="color:#D4AF37;text-align:center;">

                Amazing Crew TV Production

            </h1>

            <hr>

            <h2>Hello ${staff.fullName},</h2>

            <p>

                Congratulations!

                Your staff account has been created successfully.

            </p>

            <table style="width:100%;border-collapse:collapse;">

                <tr>

                    <td><strong>Role</strong></td>

                    <td>${staff.role}</td>

                </tr>

                <tr>

                    <td><strong>Email</strong></td>

                    <td>${staff.email}</td>

                </tr>

                <tr>

                    <td><strong>Temporary Password</strong></td>

                    <td>${staff.password}</td>

                </tr>

            </table>

            <br>

            <p>

                Login here:

            </p>

            <p>

                <strong>

                https://the-altar-called-home-tickets.web.app/login.html

                </strong>

            </p>

            <p>

                Please change your password immediately after your first login.

            </p>

            <hr>

            <p style="font-size:12px;color:#777;text-align:center;">

                © 2026 Amazing Crew TV Production

            </p>

        </div>

    </div>

    `;

    await transporter.sendMail({

        from: `"Amazing Crew TV Production" <${gmailEmail.value()}>`,

        to: staff.email,

        subject: "Welcome to Amazing Crew TV Production",

        html

    });

}

async function sendPasswordResetEmail(staff){

    const transporter = nodemailer.createTransport({

        service:"gmail",

        auth:{

            user:gmailEmail.value(),

            pass:gmailPassword.value()

        }

    });

    const html = `

    <div style="font-family:Arial,sans-serif;padding:30px;background:#f5f5f5;">

        <div style="max-width:650px;margin:auto;background:#ffffff;padding:35px;border-radius:12px;border-top:6px solid #D4AF37;">

            <h1 style="color:#D4AF37;text-align:center;">

                THE ALTAR CALLED HOME

            </h1>

            <p style="text-align:center;">

                Amazing Crew TV Production

            </p>

            <hr>

            <h2>Hello ${staff.fullName},</h2>

            <p>

                Your staff password has been successfully reset.

            </p>

            <p>

                Your new temporary login credentials are:

            </p>

            <table style="width:100%;border-collapse:collapse;">

                <tr>

                    <td><strong>Email</strong></td>

                    <td>${staff.email}</td>

                </tr>

                <tr>

                    <td><strong>Temporary Password</strong></td>

                    <td>${staff.password}</td>

                </tr>

            </table>

            <br>

            <p>

                Login here:

            </p>

            <p>

                <strong>

                https://the-altar-called-home-tickets.web.app/login.html

                </strong>

            </p>

            <p>

                For security reasons, please change your password immediately after logging in.

            </p>

            <hr>

            <p style="font-size:12px;color:#777;text-align:center;">

                © 2026 Amazing Crew TV Production

            </p>

        </div>

    </div>

    `;

    await transporter.sendMail({

        from:`"Amazing Crew TV Production" <${gmailEmail.value()}>`,

        to:staff.email,

        subject:"Your Staff Password Has Been Reset",

        html

    });

}

module.exports = {

    sendTicketEmail,

    sendStaffWelcomeEmail,

    sendPasswordResetEmail,

    gmailEmail,

    gmailPassword

};