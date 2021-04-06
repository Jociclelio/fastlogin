# FastLogin

A quicker way to switch Steam accounts on your computer.
Allowing you to switch between steam accounts with one click.

## Fetures

- Ignores steamgard
- Profile images
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
```
taskkill /F /IM steam.exe /T
```

### Change the loged user
Change the loged user in the windows regedit
```
reg add \"HKCU\\Software\\Valve\\Steam\" /v AutoLoginUser /t REG_SZ /d username /f
```

And mark to remember the password
```
reg add \"HKCU\\Software\\Valve\\Steam\" /v RememberPassword /t REG_DWORD /d 1 /f
```
### Open Steam again

Open the steam main calling the steam protocol
```
cmd /c start steam://open/main
```
	
## How to use

To Switch accounts with the FastLogin you must to:
- Never logout in the steam app
![Change account button](https://github.com/Jociclelio/fastlogin/blob/master/src/img/readme/ChangeAccount.png?raw=true)
- Sign in to accounts at least once

## Download

[Releases](https://github.com/Jociclelio/fastlogin/releases)

# FastLogin (Português)

Uma forma rápida de trocar de contas steam no PC.
podendo trocar de contas com a facilicade de um click.

## Fetures

- Ignora steamgard
- Tem imagens de perfil
- Tem ícone na bandeja
- Estados de conta

### Requisitos

- Windows
- Steam
- Internet

## Como funciona

Funciona com três etapas ou três comandos do powershell

### Mata o processo da steam
Usa o comando taskkill para matar o processo da steam, e os filhos do processo, incluindo jogos abertos
```
taskkill /F /IM steam.exe /T
```

### Muda o usuário logado
Muda o usuário logado pelo regedit
```
reg add \"HKCU\\Software\\Valve\\Steam\" /v AutoLoginUser /t REG_SZ /d username /f
```

E marca a opção de lembrar a senha 
```
reg add \"HKCU\\Software\\Valve\\Steam\" /v RememberPassword /t REG_DWORD /d 1 /f
```
### Abre a Steam novamente
Abre a steam chamando ela pelo protocolo própio
```
cmd /c start steam://open/main
```
	
## Como usar

Para trocar de contas usando o FastLogin voce tem que:
- Nunca deslogar da steam 
![Botão de trocar conta](https://github.com/Jociclelio/fastlogin/blob/master/src/img/readme/TrocarConta.png?raw=true)
- Logar em cada conta pelo menos uma vez

## Baixar

[Releases](https://github.com/Jociclelio/fastlogin/releases)
