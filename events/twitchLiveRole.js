const dayjs = require("dayjs");
module.exports = {
    name: 'presenceUpdate',
    once: true,
    async execute(member) {
        const {nowLiveRoleID} = require('./guild.json');
        let status = member.activities;
        let user = member.member;
        let guild = user.guild
        let userRoles = user._roles;
        let allActivities = status.toString();

        if (allActivities.includes("Twitch")) {
            if (!userRoles.includes(nowLiveRoleID)) {
                return await giveRole(member, user, nowLiveRoleID, guild);
            }

        } else {
            if (userRoles.includes(nowLiveRoleID)) {
                return await removeRole(member, user, nowLiveRoleID, guild);
            }
        }
    // function to giveRole live to user
    async function giveRole(activity, user, roleID, guild) {
        // cache get if you have an ID of the role
        let role = guild.roles.cache.get(roleID)
        user.roles.add(role);
        console.log(`${dayjs()}: ${user.displayName} has been detected as streaming. ${role.name} role has been given.`);
    }
    // function to removeRole live to user
    async function removeRole(activity, user, roleID, guild) {
        // cache get if you have an ID of the role
        let role = guild.roles.cache.get(roleID)
        user.roles.remove(role);
        console.log(`${dayjs()}: ${user.displayName} has not been detected as streaming. ${role.name} role has been removed.`);
    }
    },
};