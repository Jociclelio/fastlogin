const fs = require('fs'); // system file
const vdf = require('./vdf-parser'); // vdf parser to read and write in .vdf
const { execSync } = require('child_process'); // execute powershell comands lines
const https = require('https'); // comunicate with the steam api
const stream = require('stream').Transform; // push packages data to a single file
const { ipcMain, dialog } = require('electron'); // comunication with the main.js file and the user
const tp = require('./template');//template

module.exports = {
    steampath: null, //once runned the getSteamPath(), this information will be save heree
    usersDisk: null, //where is will saved the users saved in the disk
    usersWeb: null, //where is will saved the users information downloaded from the web
    getSteamPath() {
        if (this.steampath == null) {
            // call the reg to ask where is the steam folder in the computer
            // and cut the string answer to get only the steam path ( i don't know what this is return if dont have steam instaled) 
            stdout = execSync("reg query HKCU\\Software\\Valve\\Steam /v SteamPath /t REG_SZ").toString();
            stdout = stdout.substring(stdout.indexOf('REG_SZ') + 10)
            this.steampath = stdout.substring(0, stdout.indexOf('\n') - 1)
        }
        return this.steampath;
    },
    readUsers() {
        //read the users located in <steampath>/config/loginusers.vdf, parse to json and save on this.usersdisk
        this.usersDisk = Object.entries(vdf.parse(String(fs.readFileSync(this.getSteamPath() + "/config/loginusers.vdf"))).users);
        this.getWebUsers(); //calls the getWebUsers to download updated data from the users
        return this.usersDisk;
    },
    setUsers() {
        //save the usersdisk updated file
        fs.writeFileSync(this.getSteamPath() + "/config/loginusers.vdf", vdf.stringify({ users: Object.fromEntries(this.usersDisk) }, true, 2));
    },
    getWebUsers() {
        //test if the users disk is null because is necessary read the Steamid64 to call the api
        if (this.usersDisk == null) {
            this.getUsers();
        }
        //load the steam ids to a string (separating by " ")
        let steamids = "";
        this.usersDisk.map((user) => {
            steamids += user[0] + " ";
        });
        //calls the api with GET passing in the parameters the steamIDs
        https.get(`https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=16464C7E103DEC58BEC7BD72E12AAC49&steamids=${steamids}`, (res) => {
            let data = new stream();
            res.setEncoding('utf8');
            // push all data to a single file
            res.on('data', (chunk) => {
                data.push(chunk);
            });
            //save the users web information and pass it to the main
            res.on('end', () => {
                this.usersWeb = JSON.parse(data.read());
                ipcMain.emit('users-web', this.usersWeb);
                this.updateUsers();
            });
        });
    },
    updateUsers() {
        //check if the users web is null
        if (this.usersWeb == null) {
            this.getWebUsers();
        }
        //check if the <steampath>/config/avatarcahche exists
        if (!fs.existsSync(this.getSteamPath() + `/config/avatarcache`)) {
            fs.mkdirSync(this.getSteamPath() + `/config/avatarcache`);
        }
        //check if que persona name change and the avatar image
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
        //update the usersDisk file (save the current userdisk updated file in .vdf)
        this.setUsers(this.usersDisk);
        ipcMain.emit('updated'); //inform que main.js that users is updated
    },
    //download the image of a user and save a hash of to know when change
    downloadAvatar(userid, url, hash) {

        https.get(url, (res) => {
            let img = new stream();
            // push all data to a single file
            res.on('data', (chunk) => {
                img.push(chunk);
            });
            //save the img and calls the main.js file to udate the image if the window is open
            res.on('close', () => {
                fs.writeFileSync(this.getSteamPath() + `/config/avatarcache/${userid}.png`, img.read());
                ipcMain.emit('updated-img', userid, url);
            });
        })
        //save the hash in a file <steamid64>.hash next to the image
        fs.writeFileSync(this.getSteamPath() + `/config/avatarcache/${userid}.hash`, hash);
    },
    deleteUser(user) {
        //search in the usersdisk the index of the user (there is passed a steam64id)
        this.usersDisk.findIndex((element, index, array) => {
            if (element[0] === user[0]) {
                //when find the user, show the dialog to confirm de delete
                dialog.showMessageBox(tp.removeDialog(user, this.steampath))
                    .then((resposta) => {
                        if (resposta.response === 0) {
                            //if the answer is YES, remove the user from usersDisk and save it in the disk file
                            this.usersDisk.splice(index, 1);
                            this.setUsers();
                            ipcMain.emit('deleted-user', null, user); //inform to the main.js that this user has been deleted (to remake the menus)
                            fs.unlinkSync(this.getSteamPath() + `/config/avatarcache/${user[0]}.hash`); //delete the hash
                            fs.unlinkSync(this.getSteamPath() + `/config/avatarcache/${user[0]}.png`); //delete the image 
                        }
                    });
            }
        });
    }
}