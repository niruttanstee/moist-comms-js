const dayjs = require("dayjs");
module.exports = {
    name: 'guildMemberUpdate',
    async execute(oldMember, newMember) {
        if (!newMember.pending && oldMember.pending){
            let guild = newMember.guild;
            const {verifiedRoleID} = require('./guild.json');
            let role = guild.roles.cache.get(verifiedRoleID);
            newMember.roles.add(role)
            console.log(`${dayjs()}: ${user.displayName} has accepted terms and conditions, giving ${role.name} role.`);
        }

    },
};