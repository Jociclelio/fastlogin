const { exec } = require("child_process");// required to execute powersheel commands

module.exports = {
    // close the steam (without logout the account)
    killSteam() {
        exec("taskkill /F /IM steam.exe /T", (error, stdout, stderr) => {});
    },
    //Change the AutoLoginUser registry key of the steam to the target user and mark to remember checkbox to be able to login again in the future
    loginUser(user) {
        exec(`reg add \"HKCU\\Software\\Valve\\Steam\" /v AutoLoginUser /t REG_SZ /d ${user} /f`, (error, stdout, stderr) => {
            if (error) {
                console.log(`error: ${error.message}`);
                return;
            }
            if (stderr) {
                console.log(`stderr: ${stderr}`);
                return;
            }
        });
        exec("reg add \"HKCU\\Software\\Valve\\Steam\" /v RememberPassword /t REG_DWORD /d 1 /f", (error, stdout, stderr) => {
            if (error) {
                console.log(`error: ${error.message}`);
                return;
            }
            if (stderr) {
                console.log(`stderr: ${stderr}`);
                return;
            }
        });
    },
    //open the main steam calling the protocol, maybe it best to do it by the the native eletron func
    openSteamMain() {
        exec("cmd /c start steam://open/main", (error, stdout, stderr) => {
            if (error) {
                console.log(`error: ${error.message}`);
                return;
            }
            if (stderr) {
                console.log(`stderr: ${stderr}`);
                return;
            }
        });
    },
    //to open and run a steam game (maybe in the future can login and open a specific game)
    openSteamGame(gameid) {
        exec(`cmd /c start steam://rungameid/${gameid}`, (error, stdout, stderr) => {
            if (error) {

                console.log(`error: ${error.message}`);
                return;
            }
            if (stderr) {
                console.log(`stderr: ${stderr}`);
                return;
            }
        });
    },
    //simple func to login the user and open main
    fastlogin(user) {
        //console.log(user);
        this.killSteam();
        this.loginUser(user);
        this.openSteamMain();
    },
    //simple func to login the user and open a game
    fastlogin(user, gameid) {
        this.killSteam();
        this.loginUser(user);
        if (typeof gameid == Number) {
            this.openSteamGame(gameid);
        }
        this.openSteamMain();
    }
}