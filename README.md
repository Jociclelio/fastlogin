# FastLogin

A quicker way to switch Steam accounts on your computer.
Allowing you to switch between steam accounts with one click.

## Fetures

- Ignores steamgard
- Avatar icons
- Menu in tray
- Account states

### Requirements

- Windows
- Steam
- internet connection

## How it works

This works in three steps our three powershell commands

### Kill Steam process
Use the taskkill to kill the steam process, and the childreen too, included open games
`taskkill /F /IM steam.exe /T`

### Change the loged user
Change the loged user in the windows regedit
`reg add \"HKCU\\Software\\Valve\\Steam\" /v AutoLoginUser /t REG_SZ /d username /f`

And mark to remember the password
`reg add \"HKCU\\Software\\Valve\\Steam\" /v RememberPassword /t REG_DWORD /d 1 /f`
### Open Steam again

Open the steam main calling the steam protocol
`cmd /c start steam://open/main`
	
## How to use

To Switch accounts with the FastLogin you must to:
- never logout in the steam app
- sign in to accounts at least once
