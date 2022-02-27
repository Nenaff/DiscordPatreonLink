# DiscordPatreonLink

Link Discord.js with Patreon to allow use of certain commands to premium users only.</br>
<h4>Note that you should be using your own command system. This one is only used for demo purposes.</h4>

<h3>Instructions:</h3>
- Put your Discord bot token at the end of index.js<br/>
- Put your Patreon API credentials at the beginning of patreon.js
<br/>
<h3>Getting Patreon credentials:</h3>
- Create a Patreon creator account<br/>
- Head over to <a href="https://www.patreon.com/portal/registration/register-clients">your clients</a> and create a new client<br/>
- Grab "Creator access token" and put it in "secretClient" from patreon.js<br/>
- Get to your creator page https://www.patreon.com/user?u=whateveritis, open console and run <code>javascript:prompt('Campaign ID',window.patreon.bootstrap.creator.data.id);</code>. It will show you your compaign id that you will put in compaignId from patreon.js<br/>

<br/>
Every files under the folder patreon-discord comes from https://www.npmjs.com/package/patreon-discord by <a href="https://github.com/miramallows">miramallows</a><br/>
It couldn't be used with NPM as some changes were necessary.<br/>
<br/>
Project realized for Nidev.fr
