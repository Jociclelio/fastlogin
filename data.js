const fs = require('fs'); // sistema de aquivos
const vdf = require('./vdf-parser'); // tradutor vdf para json
const { execSync } = require('child_process'); // executar comandos
const https = require('https'); // baixar imaguem
const stream = require('stream').Transform; // baixar imaguem
const { ipcMain, dialog } = require('electron'); // comunicação
const tp = require('./template');//template

module.exports = {
    steampath: null,
    usersDisk: null,
    usersWeb: null,
    getSteamPath() {
        if (this.steampath == null) {
            stdout = execSync("reg query HKCU\\Software\\Valve\\Steam /v SteamPath /t REG_SZ").toString();
            stdout = stdout.substring(stdout.indexOf('REG_SZ')+10)
            this.steampath = stdout.substring(0,stdout.indexOf('\n')-1)
        }
        return this.steampath;
    },
    readUsers() {
        this.usersDisk = Object.entries(vdf.parse(String(fs.readFileSync(this.getSteamPath() + "/config/loginusers.vdf"))).users);
        this.getWebUsers();
        return this.usersDisk;
    },
    setUsers() {
        fs.writeFileSync(this.getSteamPath() + "/config/loginusers.vdf", vdf.stringify({ users: Object.fromEntries(this.usersDisk) }, true, 2));
    },
    getWebUsers() {
        if (this.usersDisk == null) {
            this.getUsers();
        }
        let steamids = "";
        this.usersDisk.map((user) => {
            steamids += user[0] + " ";
        });
        https.get(`https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=16464C7E103DEC58BEC7BD72E12AAC49&steamids=${steamids}`, (res) => {
            let data = new stream();
            res.setEncoding('utf8');
            res.on('data', (chunk) => {
                data.push(chunk);
            });
            res.on('end', () => {
                this.usersWeb = JSON.parse(data.read());
                ipcMain.emit('users-web', this.usersWeb);
                this.updateUsers();
            });
        });
    },
    updateUsers() {
        if (this.usersWeb == null) {
            this.getWebUsers();
        }
        if (!fs.existsSync(this.getSteamPath() + `/config/avatarcache`)){
            fs.mkdirSync(this.getSteamPath() + `/config/avatarcache`);
        }
        this.usersWeb.response.players.map((userweb) => {
            this.usersDisk.map((userdisk) => {
                if (userdisk[0] == userweb.steamid) {
                    if (userdisk[1].PersonaName != userweb.personaname) {
                        userdisk[1].PersonaName = userweb.personaname
                    }
                }
            });
            if (!fs.existsSync(this.getSteamPath() + `/config/avatarcache/${userweb.steamid}.png`)) {
                this.downloadAvatar(userweb.steamid, userweb.avatarfull, userweb.avatarhash);
            } else if (!fs.existsSync(this.getSteamPath() + `/config/avatarcache/${userweb.steamid}.hash`)) {
                this.downloadAvatar(userweb.steamid, userweb.avatarfull, userweb.avatarhash);
            } else if (fs.readFileSync(this.getSteamPath() + `/config/avatarcache/${userweb.steamid}.hash`) != userweb.avatarhash) {
                this.downloadAvatar(userweb.steamid, userweb.avatarfull, userweb.avatarhash);
            }
        });
        this.setUsers(this.usersDisk);
        ipcMain.emit('atualizado');
    },
    downloadAvatar(userid, url, hash) {
        https.get(url, (res) => {
            let img = new stream();
            res.on('data', (chunk) => {
                img.push(chunk);
            });
            res.on('close', () => {
                fs.writeFileSync(this.getSteamPath() + `/config/avatarcache/${userid}.png`, img.read());
                ipcMain.emit('recarregar-img', userid, url);
            });
        })
        fs.writeFileSync(this.getSteamPath() + `/config/avatarcache/${userid}.hash`, hash);
    },
    deleteUser(user) {
        this.usersDisk.findIndex((element, index, array) => {
            console.log('deteledUser()'+ element + "  " + user)
            if (element[0] === user[0]) {
                dialog.showMessageBox(tp.removeDialog(user, this.steampath))
                    .then((resposta) => {
                        console.log(resposta);
                        if (resposta.response === 0) {
                            this.usersDisk.splice(index, 1);
                            this.setUsers();
                            ipcMain.emit('deleted-user', null, user);
                            fs.unlinkSync(this.getSteamPath() + `/config/avatarcache/${user[0]}.hash`);
                            fs.unlinkSync(this.getSteamPath() + `/config/avatarcache/${user[0]}.png`);
                        }
                    });
            }
        });
    }
}