export function generateQRCode(elementId, text){

    const element = document.getElementById(elementId);

    if(!element) return;

    const url =

        "https://api.qrserver.com/v1/create-qr-code/"

        + "?size=280x280"

        + "&data="

        + encodeURIComponent(text);

    element.innerHTML = `

        <img

            src="${url}"

            alt="QR Code"

            class="ticketQR"

        >

    `;

}