---


---

<h1 id="fastlogin">FastLogin</h1>
<p>A quicker way to switch Steam accounts on your computer.<br>
Allowing you to switch between steam accounts with one click.</p>
<h2 id="fetures">Fetures</h2>
<ul>
<li>Ignores steamgard</li>
<li>Profile images</li>
<li>Menu in tray</li>
<li>Account states</li>
</ul>
<h3 id="requirements">Requirements</h3>
<ul>
<li>Windows</li>
<li>Steam</li>
<li>internet connection</li>
</ul>
<h2 id="how-it-works">How it works</h2>
<p>This works in three steps our three powershell commands</p>
<h3 id="kill-steam-process">Kill Steam process</h3>
<p>Use the taskkill to kill the steam process, and the childreen too, included open games</p>
<pre><code>taskkill /F /IM steam.exe /T
</code></pre>
<h3 id="change-the-loged-user">Change the loged user</h3>
<p>Change the loged user in the windows regedit</p>
<pre><code>reg add \"HKCU\\Software\\Valve\\Steam\" /v AutoLoginUser /t REG_SZ /d username /f
</code></pre>
<p>And mark to remember the password</p>
<pre><code>reg add \"HKCU\\Software\\Valve\\Steam\" /v RememberPassword /t REG_DWORD /d 1 /f
</code></pre>
<h3 id="open-steam-again">Open Steam again</h3>
<p>Open the steam main calling the steam protocol</p>
<pre><code>cmd /c start steam://open/main
</code></pre>
<h2 id="how-to-use">How to use</h2>
<p>To Switch accounts with the FastLogin you must to:</p>
<ul>
<li>Never logout in the steam app<br>
<img src="https://github.com/Jociclelio/fastlogin/blob/master/src/img/readme/ChangeAccount.png?raw=true" alt="Change account button"></li>
<li>Sign in to accounts at least once</li>
</ul>
<h2 id="download">Download</h2>
<p><a href="https://github.com/Jociclelio/fastlogin/releases">Releases</a></p>
<h1 id="fastlogin-português">FastLogin (Português)</h1>
<p>Uma forma rápida de trocar de contas steam no PC.<br>
podendo trocar de contas com a facilicade de um click.</p>
<h2 id="fetures-1">Fetures</h2>
<ul>
<li>Ignora steamgard</li>
<li>Tem imagens de perfil</li>
<li>Tem ícone na bandeja</li>
<li>Estados de conta</li>
</ul>
<h3 id="requisitos">Requisitos</h3>
<ul>
<li>Windows</li>
<li>Steam</li>
<li>Internet</li>
</ul>
<h2 id="como-funciona">Como funciona</h2>
<p>Funciona com três etapas ou três comandos do powershell</p>
<h3 id="mata-o-processo-da-steam">Mata o processo da steam</h3>
<p>Usa o comando taskkill para matar o processo da steam, e os filhos do processo, incluindo jogos abertos</p>
<pre><code>taskkill /F /IM steam.exe /T
</code></pre>
<h3 id="muda-o-usuário-logado">Muda o usuário logado</h3>
<p>Muda o usuário logado pelo regedit</p>
<pre><code>reg add \"HKCU\\Software\\Valve\\Steam\" /v AutoLoginUser /t REG_SZ /d username /f
</code></pre>
<p>E marca a opção de lembrar a senha</p>
<pre><code>reg add \"HKCU\\Software\\Valve\\Steam\" /v RememberPassword /t REG_DWORD /d 1 /f
</code></pre>
<h3 id="abre-a-steam-novamente">Abre a Steam novamente</h3>
<p>Abre a steam chamando ela pelo protocolo própio</p>
<pre><code>cmd /c start steam://open/main
</code></pre>
<h2 id="como-usar">Como usar</h2>
<p>Para trocar de contas usando o FastLogin voce tem que:</p>
<ul>
<li>Nunca deslogar as contas da steam<br>
<img src="https://github.com/Jociclelio/fastlogin/blob/master/src/img/readme/TrocarConta.png?raw=true" alt="Botão de trocar conta"></li>
<li>Logar em cada conta pelo menos uma vez</li>
</ul>
<h2 id="baixar">Baixar</h2>
<p><a href="https://github.com/Jociclelio/fastlogin/releases">Releases</a></p>

