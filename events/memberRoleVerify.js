const dayjs = require("dayjs");
module.exports = {
    name: 'guildMemberUpdate',
    async execute(oldMember, newMember) {
        if (newMember.pending && !oldMember.pending){
            let guild = newMember.guild;
            let user = newMember.user;
            const {verifiedRoleID} = require('./guild.json');
            let role = guild.roles.cache.get(verifiedRoleID);
            user.roles.add(role)
            console.log(`${dayjs()}: ${user.displayName} has accepted terms and conditions, giving ${role.name} role.`);
        }

    },
};