const { Campaign } = require('./patreon-discord')

let campaignId = '8285837'
let secretClient = 'xUfHBOfXTE_wqAbcyiDEXpTgJumnF3mBRumuMmMo0mI'

const myCampaign = new Campaign({ 
    patreonToken: secretClient,
    campaignId: campaignId
})

let paidUsers = []; // {id discord: data}

initializePatrons()

function findDiscordPatron(discordId) {
    return paidUsers.find(patron => patron.discordId == discordId);
}

async function isPremium(discordId) {
    let patron = findDiscordPatron(discordId);

    if (!patron) 
        return false

    if (patron.status != "active_patron")
        return false;

    if (Date.now > Date.parse(patron.nextCharge)) {
        return ((await verifyPatron(discordId, patron.pledgeId)).success && patron.status == "active_patron")
    } else {
        return true
    }
}

function registerPatron(patron) {
    paidUsers.push({discordId: patron['discord_user_id'], nextCharge: patron['next_charge_date'], mail: patron['email'], name: patron['full_name'], pledgeId: patron['pledge_id'], userId: patron['patron_id'], status: patron['patron_status']});
}

async function verifyPatron(discordId) {
    return myCampaign.lookForPatron(discordId)
    .then(patron => { 
        console.log(patron)
        if (patron == undefined)
            return {'success': false, 'message': 'Please link your Discord account to your Patreon account: https://www.patreon.com/settings/apps'}

        console.log(paidUsers)
        let alreadyExist = paidUsers.find(user => user.userId == patron.patron_id);
        if (alreadyExist && alreadyExist.discord_user_id != discordId)
            return {'success': false, 'message': 'This Patreon account is already linked to another Discord account.'}

        registerPatron(patron);
        return {'success': true, 'message': 'Your Patron account has been successfully associated with your Discord account.'}
    })
}

function initializePatrons() {
    myCampaign.fetchPatrons(['active_patron', 'former_patron'])
    .then(patrons => { 
        patrons.forEach(patron => registerPatron(patron));
    })
}

module.exports = {findDiscordPatron, isPremium, verifyPatron, paidUsers};