const { ipcRenderer } = require('electron');


$(document).ready(function() {
    $(".box").hover(function() {
        $(this).removeClass("bg-dark");
        $(this).addClass("bg-darker");

    }, function() {
        $(this).removeClass("bg-darker")
        $(this).addClass("bg-dark");
    }).click(function() {
        ipcRenderer.send('abrir-rede', $(this).attr("value"));
    })

});


function abrir(rede) {
    ipcRenderer.send('abrir-rede', rede);
}
ipcRenderer.on('versao', (event, versao) => {
    $('.title').text(`Fastlogin - v${versao}`);
});
$.get(`http://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=16464C7E103DEC58BEC7BD72E12AAC49&steamids=76561198254066736`, (data, status) => {
    $('.steamimg').attr('src', data.response.players[0].avatarfull);
    $('.steamname').text(data.response.players[0].personaname);
});