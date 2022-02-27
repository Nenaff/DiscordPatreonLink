const { Campaign } = require('./patreon-discord')

let campaignId = 'Your campaign ID'
let secretClient = 'Your secret client'

const myCampaign = new Campaign({ 
    patreonToken: secretClient,
    campaignId: campaignId
})

let paidUsers = {}; // {id discord: data}

initializePatrons()

async function isPremium(discordId) {
    if (!(discordId in paidUsers)) 
        return false

    let patron = paidUsers[discordId];

    if (patron.status != "active_patron")
        return false;

    if (Date.now > Date.parse(patron.nextCharge)) {
        return ((await verifyPatron(discordId, patron.pledgeId)).success && patron.status == "active_patron")
    } else {
        return true
    }
}

function registerPatron(patron) {
    paidUsers[patron['discord_user_id']] = {nextCharge: patron['next_charge_date'], mail: patron['email'], name: patron['full_name'], pledgeId: patron['pledge_id'], userId: patron['patron_id'], status: patron['patron_status']}
}

async function verifyPatron(discordId) {
    return myCampaign.lookForPatron(discordId)
    .then(patron => { 
        console.log(patron)
        if (patron == undefined)
            return {'success': false, 'message': 'Please link your Discord account to your Patreon account: https://www.patreon.com/settings/apps'}

        registerPatron(patron);
        return {'success': true, 'message': 'Your Patron account has been successfully associated with your Discord account.'}
    })
}

function initializePatrons() {
    myCampaign.fetchPatrons(['active_patron', 'former_patron'])
    .then(patrons => { 
        patrons.forEach(patron => registerPatron(patron));
        console.log(paidUsers)

    })
}

module.exports = {isPremium, verifyPatron, paidUsers};