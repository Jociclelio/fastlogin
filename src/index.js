const { ipcRenderer } = require('electron');
const { language } = require('../config.json');
let lang;
if(language !== "english"){
    try {
        lang = require(`../lang/${language}.json`);
    } catch{
    }
}else{
    lang = {
        body:{
            personastate: ["Offline", "Online", "Ocupado", "Away", "Dormindo", "Trade", "jogando"]
        },
    }
}

function useDefaultAvatar(img) {
    $(img).attr("src", __dirname + "/img/avatardefault.png").addClass("sem-avatar");
}

ipcRenderer.on('users-disk', (event, users, steampath) => {
    
    let divs = "";
    users.map((user) => {
        divs += (`
            <div class="player card bg-dark border-secondary text-white d-inline-flex" id="${user[0]}" value='${user[1].AccountName}'>
                <div class="card-header p-2">
                    <img class="avatar card-img-top" id="${user[0]}" src="${steampath + "/config/avatarcache/" + user[0] + ".png"}" onerror="useDefaultAvatar(this)">
                    <p class="state card-img-overlay text-secondary p-2"></p>
                </div>
                <p class="name h6 p-2">${user[1].PersonaName}</p>
            </div>
        `);
    });
    $("#fastlogin").html(divs);

    $(".card").hover(function() {
        $(this).removeClass("bg-dark");
        $(this).addClass("bg-darker");

    }, function() {
        $(this).removeClass("bg-darker")
        $(this).addClass("bg-dark");
    });
    $(".card").click(function() {
        console.log($(this).attr("value"));
        ipcRenderer.send('login', $(this).attr("value"));
    });
    
});
ipcRenderer.on('users-web', (event, webusers) => {
    //let personastate = ['Offline', 'Online', 'Busy', 'Away', 'Snooze', 'Looking to trade', 'Looking to play'];
    let color = ['secondary', 'primary', 'danger', 'light', 'info', 'success', 'warning'];
    webusers.response.players.map((player) => {
        $(`#${player.steamid}`).removeClass('border-secondary').addClass(`border-${color[player.personastate]}`); // Troca a borda
        $(`#${player.steamid} .state`).text(lang.body.personastate[player.personastate]).removeClass('text-secondary').addClass(`text-${color[player.personastate]}`); //troca do status
        if ($(`#${player.steamid} .name`).text() != player.personaname) { //verifica se o nome trocou, se sim troca o nome
            $(`#${player.steamid} .name`).text(player.personaname);
        }
        if ($(`#${player.steamid} .avatar`).hasClass("sem-avatar")) {
            $(`#${player.steamid} .avatar`).attr("src", player.avatarfull).removeClass("sem-avatar");
        }
    });
})
ipcRenderer.on('reload-img', (event, userid, url) => {
    $(`#${userid} .avatar`).attr("src", url);
})
ipcRenderer.on('deleted-user', (event, user) => {
    $(`#${user[0]}`).remove();
})