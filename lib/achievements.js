const PlayerIOError = require("./playerioerror.js");
const PlayerIOErrorCode = PlayerIOError.PlayerIOErrorCode;

/**
 * The Achievements service. This class is used to update the progress of an achievement for the 
 * current user, and loading achievements of other users. All achievements have to be defined in the 
 * admin panel first.
 */
module.exports = class Achievements {
    /**
     * @param {import("./channel")} channel 
     */
    constructor(channel) {
        this.channel = channel;

        /**
         * The list of achievements for the current user. You must call refresh() first to initialize this list.
         * @type {Achievement[]}
         */
        this.myAchievements = "[ERROR: You tried to access achievements.myAchievements before loading them. You have to call the refresh method first.]";
		this.onCompleteHandlers = [];

        /**
         * If null, the achievements has not been refreshed.
         */
        this.currentVersion = null;
    }

    /**
     * @param {function(Achievement)} onCompleteHandler
     */
    addOnComplete(onCompleteHandler) {
        if (typeof onCompleteHandler === 'function' && onCompleteHandler.length == 1) {
            this.onCompleteHandlers.push(onCompleteHandler);
        } else {
            throw new PlayerIOError(PlayerIOErrorCode.InvalidArgument, "Expects argument to be a function that takes an achievement as an argument.");
        }
    }

    /**
     * Get an achievement by id
     * @param {string} achievementId Id of the achievement to get.
     */
    get(achievementId) {
        if (typeof this.myAchievements === 'string') { return null; }
        for (var i = 0; i < this.myAchievements.length; i++) {
            if (this.myAchievements[i].id == achievementId) {
                return this.myAchievements[i];
            }
        }
        return null;
    }

    /**
     * Refresh the list of achievements.
     */
    refresh() {
        return this.channel.achievementsRefresh(this.currentVersion).then((result) => {
            if (result.errorcode) return new PlayerIOError(result.errorcode, result.message);
            if (this.currentVersion == result.version) return this.myAchievements;

            this.currentVersion = result.version;
            if (result.achievements == null || result.achievements.length == 0) {
                this.myAchievements = [];
            } else {
                let achs = [];
                for (let i = 0; i < result.achievements.length; i++) {
                    let item = result.achievements[i];
                    achs.push(new Achievement(item.identifier, item.title, item.description, item.imageurl, item.progress, item.progressgoal, item.lastupdated));
                }

                this.myAchievements = achs;
                return achs;
            }
        })
    }

    /**
     * Load the achivements for multiple users by their connectUserId
     * @param {string[]} userIds The list of users to load achievements for.
     */
    load(userIds) {
        if (!Array.isArray(userIds)) {
            throw new PlayerIOError("The first argument to load should be an array: client.achievements.load(['user1', 'user2', ...], ...)");
        }

        return this.channel.achievementsLoad(userIds).then(result => {
            if (result.errorcode) return new PlayerIOError(result.errorcode, result.message);
            if (result == null || result.length == 0) { return {}; }

            let users = {};

            for (let i = 0; i < result.userachievements.length; i++) {
                let user = result.userachievements[i]; let achs = [];
                
                for (let j = 0; j < user.achievements.length; j++) {
                    let item = user.achievements[j];
                    achs.push(new Achievement(item.identifier, item.title, item.description, item.imageurl, item.progress, item.progressgoal, item.lastupdated));
                }; users[user.userid] = achs;
            }; return users;
        })
    }

    /**
     * Sets the progress of the specified achievement
     * @param {string} achievementId The id of the achievement to set the progress for.
     * @param {number} progress The value to set the progress to
     */
    progressSet(achievementId, progress) {
        return this.channel.achievementsProgressSet(achievementId, progress).then(result => {
            if (result.errorcode) return new PlayerIOError(result.errorcode, result.message);
            return this.update(result.achievement, result.completednow);
        })
    }

    /**
     * Adds the delta to the progress of the specified achievement
     * @param {string} achievementId The id of the achievement to add to the progress for.
     * @param {number} progressDelta The value to add to the progress.
     */
    progressAdd(achievementId, progressDelta) {
        return this.channel.achievementsProgressAdd(achievementId, progressDelta).then(result => {
            if (result.errorcode) return new PlayerIOError(result.errorcode, result.message);
            return this.update(result.achievement, result.completednow);
        })
    }

    /**
     * Sets the progress of the specified achievement to the bigger value of the current value and the given value.
     * @param {string} achievementId The id of the achievement to set the progress for.
     * @param {number} progress The value to set the progress to, if it's bigger than the current value.
     */
    progressMax(achievementId, progress) {
        return this.channel.achievementsProgressMax(achievementId, progress).then(result => {
            if (result.errorcode) return new PlayerIOError(result.errorcode, result.message);
            return this.update(result.achievement, result.completednow);
        })
    }

    /**
     * Completes the specified achievement by setting the progress to the progress goal.
     * @param {string} achievementId The id of the achievement to complete.
     */
    progressComplete(achievementId) {
        return this.channel.achievementsProgressMax(achievementId).then(result => {
            if (result.errorcode) return new PlayerIOError(result.errorcode, result.message);
            return this.update(result.achievement, result.completednow);
        })
    }

    /**
     * THIS IS FOR INTERNAL USE!
     * @returns {Achievement}
     */
    update(achievement, completednow) {
        // Convert received achievement data into client achievement object
        let ach = new Achievement(achievement.identifier, achievement.title, achievement.description, achievement.imageurl, achievement.progress, achievement.progressgoal, achievement.lastupdated);

        if (typeof this.myAchievements !== 'string') {
            for (var i = 0; i < this.myAchievements.length; i++) {
                if (this.myAchievements[i].id == ach.id) {
                    this.myAchievements[i] = ach;
                    //Clear version, because we can't be sure our current local state is the latest.
                    this.currentVersion = null;
                }
            }
        }

        if (completednow) {
            for (let i = 0; i < this.onCompleteHandlers.length; i++) {
                this.onCompleteHandlers[i](ach);
            }
        }

        return ach;
    }
};

class Achievement {
    /**
     * @param {string} id
     * @param {string} title
     * @param {string} description
     * @param {string} imageUrl
     * @param {number} progress
     * @param {number} progressGoal
     * @param {number} lastUpdated
     */
    constructor(id, title, description, imageUrl, progress, progressGoal, lastUpdated) {
        /** The id of this achievement.
        * @type string
        */
        this.id = id;
        /** The title of this achievement.
        * @type string
        */
        this.title = title;
        /** The description of this achievement.
        * @type string
        */
        this.description = description;
        /** The image url of this achievement.
        * @type string
        */
        this.imageUrl = imageUrl;
        /** The progress of this achievement.
        * @type Number
        */
        this.progress = (typeof progress === 'undefined') ? 0 : progress;
        /** The progress goal of this achievement.
        * @type Number
        */
        this.progressGoal = progressGoal;
        /** When this achievement was last updated.
        * @type Date
        */
        this.lastUpdated = new Date(lastUpdated * 1000);
        /** The progress ratio of this achievement.
        * @type Number
        */
        this.progressRatio = this.progress / this.progressGoal;
        /** If this achievement is completed.
        * @type bool
        */
        this.completed = (this.progress == this.progressGoal);
    }
}

module.exports.Achievement = Achievement;