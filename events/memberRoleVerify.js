const dayjs = require("dayjs");
module.exports = {
    name: 'guildMemberUpdate',
    async execute(oldMember, newMember) {
        return await giveRole(oldMember, newMember);

        async function giveRole(oldMember, newMember) {
            if (!newMember.pending && oldMember.pending) {
                let guild = newMember.guild;
                const {verifiedRoleID} = require('./guild.json');
                let role = guild.roles.cache.get(verifiedRoleID);
                newMember.roles.add(role)
                console.log(`${dayjs()}: ${newMember.displayName} has accepted terms and conditions, giving ${role.name} role.`);
            }
        }

    },
};