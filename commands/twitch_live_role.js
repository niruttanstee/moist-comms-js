/*
* This is to purely test if the database is functioning.
* when someone says check it adds the user in the database and prints it out.
 */
const dayjs = require('dayjs');
const {nowLiveRoleID} = require("./guild.json");

module.exports = {
    name: "twitch_live_role",
    description: "Give role to Twitch streamer.",
    // put all functions in the execute() function
    async execute(newMember) {
        await checkTwitch(newMember)
        /*
        *   CheckTwitch function
        *   check if user is streaming on twitch.
        *   IF the user is streaming on twitch give them a role if they don't already have a role.
        *   If the user is not streaming on twitch remove the role if they have the role.
        */
        async function checkTwitch(activity) {

            const {nowLiveRoleID} = require('./guild.json');
            let status = activity.activities;
            let user = activity.member;
            let guild = user.guild
            let userRoles = user._roles;
            let allActivities = status.toString();

            if (allActivities.includes("Twitch")) {
                if (!userRoles.includes(nowLiveRoleID)) {
                    return await giveRole(activity, user, nowLiveRoleID, guild);
                }

            } else {
                if (userRoles.includes(nowLiveRoleID)) {
                    return await removeRole(activity, user, nowLiveRoleID, guild);
                }
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
    }
};

