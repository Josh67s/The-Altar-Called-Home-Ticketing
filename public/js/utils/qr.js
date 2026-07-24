export function generateQRCode(containerId, text){

    const container =
    document.getElementById(containerId);

    if(!container) return;

    container.innerHTML = "";

    new QRCode(container,{

        text,

        width:180,

        height:180

    });

}