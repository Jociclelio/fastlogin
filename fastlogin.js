const { exec } = require("child_process");

module.exports = {
    killSteam() {
        exec("taskkill /F /IM steam.exe /T", (error, stdout, stderr) => {});
    },
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
    fastlogin(user) {
        console.log(user);
        this.killSteam();
        this.loginUser(user);
        this.openSteamMain();
    },
    fastlogin(user, gameid) {
        this.killSteam();
        this.loginUser(user);
        if (typeof gameid == Number) {
            this.openSteamGame(gameid);
        }
        this.openSteamMain();
    }
}