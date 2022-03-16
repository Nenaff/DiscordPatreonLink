const { Campaign } = require('./patreon-discord')

let campaignId = '8285837'
let secretClient = '0I9_UHR_lI414G0bkRLgfGO9Axv-5NY1OvIU_eVfFtk'

let tiers = [
    [undefined, ["Null", 0]],
    ["8360740", ["Premium", 1]]
]

const myCampaign = new Campaign({ 
    patreonToken: secretClient,
    campaignId: campaignId
})

myCampaign.grabTiers().then(() => console.log(myCampaign.tiers));

function getTierFromId(tierId) {
    return tiers.find(tier => tier[0] == tierId)[1];
}

async function patronFromDiscordId(discordId) {
    return (await db.query('SELECT * FROM premium_users WHERE discord_id = ?', [discordId]))[0]
}

async function findServerOwner(serverId) {
    return (await db.query('SELECT * FROM premium_servers, premium_users WHERE premium_servers.server_discord_id = ? and premium_servers.owner_discord_id = premium_users.discord_id', [serverId]))[0];
}

async function countPremiumServers(ownerId) {
    return (await db.query("SELECT COUNT(*) AS count FROM premium_servers WHERE owner_discord_id = ?", [ownerId]))[0].count
}

async function addServerToPatron(serverId, ownerId, patron) {
    let limit = getTierFromId(patron['tier'])[1];

    if (await countPremiumServers(ownerId) >= limit) 
        return {'success': false, 'message': `You reached your limit of ${limit} premium servers.`}

    if (await isServerPremium(serverId))
        return {'success': false, 'message': `This server is already premium.`}

    return await db.con.query("INSERT INTO premium_servers VALUES(?, ?)", [ownerId, serverId], function (insertionError) {
        if (insertionError) throw insertionError;
        return {'success': true, 'message': 'Your users can now use premium commands.'}
    });
}

function registerPatron(patron) {
    db.con.query("REPLACE INTO premium_users VALUES(?, ?, ?, ?, ?, ?, ?, ?)", [patron['patron_id'], patron['discord_user_id'], new Date(patron['next_charge_date']).toISOString().slice(0, 19).replace('T', ' '), patron['email'], patron['full_name'], patron['patron_status'], patron['pledge_id'], patron['currently_entitled_tier_id']], function (err, result) {
        if (err) throw err;
    });
}

async function isUserSubscribed(userId) {
    let patron = (await patronFromDiscordId(userId));
    return patron ? patron : false;
}

async function isServerPremium(serverId) {
    let patron = await findServerOwner(serverId);

    if (!patron || patron.status != "active_patron") 
        return false

    if (Date.now() > Date.parse(patron.next_charge)) {
        let verify = await verifyPatron(patron.discord_id, patron.pledge_id);
        return (verify.success && verify.patron.patron_status == "active_patron")
    } else {
        return true
    }
}

async function verifyPatron(discordId) {
    return myCampaign.lookForPatron(discordId)
    .then(patron => { 
        console.log(patron)

        if (patron == undefined)
            return {'success': false, 'message': 'Please link your Discord account to your Patreon account: https://www.patreon.com/settings/apps', 'patron': undefined}
        
        if (db.query('SELECT COUNT(*) FROM premium_users WHERE patreon_id = ? AND discord_id = ?', [patron.patron_id, discordId]) > 0)
            return {'success': false, 'message': 'This Patreon account is already linked to another Discord account.', 'patron': undefined}

        registerPatron(patron);
        return {'success': true, 'message': 'Your Patron account has been successfully associated with your Discord account.', 'patron': patron}
    })
}

module.exports = {getTierFromId, findServerOwner, countPremiumServers, isUserSubscribed, addServerToPatron, isServerPremium, verifyPatron};