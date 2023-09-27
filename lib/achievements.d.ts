import HTTPChannel from "./channel";

/**
 * The Achievements service. This class is used to update the progress of an achievement for the 
 * current user, and loading achievements of other users. All achievements have to be defined in the 
 * admin panel first.
 */
export = class Achievements {
    constructor(channel: HTTPChannel);
    protected channel: HTTPChannel;

    myAchievements: Achievement[];
    onCompleteHandlers: function()[];

    currentVersion: unknown;

    /**
     * Add an OnComplete event handler that will be called every time an achievement is completed.
     * @param onCompleteHandler 
     */
    addOnComplete(onCompleteHandler: function(Achievement)): void;

    /**
     * Get an achievement by id
     * @param achievementId Id of the achievement to get.
     */
    get(achievementId: string): Achievement;

    /**
     * Refresh the list of achievements.
     */
    refresh(): Promise<Achievement[]>;

    /**
     * Load the achivements for multiple users by their connectUserId.
     * @param userIds The list of users to load achievements for.
     */
    load(userIds: string[]): Promise<{[userId: string]: Achievement[]}>;

    /**
     * Sets the progress of the specified achievement
     * @param achievementId The id of the achievement to set the progress for.
     * @param progress The value to set the progress to
     */
    progressSet(achievementId: string, progress: number): Promise<Achievement>;

    /**
     * Adds the delta to the progress of the specified achievement
     * @param achievementId The id of the achievement to add to the progress for.
     * @param progressDelta The value to add to the progress.
     */
    progressAdd(achievementId: string, progressDelta: number): Promise<Achievement>;

    /**
     * Sets the progress of the specified achievement to the bigger value of the current value and the given value.
     * @param achievementId The id of the achievement to set the progress for.
     * @param progress The value to set the progress to, if it's bigger than the current value.
     */
    progressMax(achievementId: string, progress: number): Promise<Achievement>;

    /**
     * Completes the specified achievement by setting the progress to the progress goal.
     * @param achievementId The id of the achievement to complete.
     */
    progressComplete(achievementId: string): Promise<Achievement>;

    protected update(achievement: Object, completednow: boolean): Achievement;
}

/**
 * This class encapsulates all the data of a single achievement.
 */
export class Achievement {
    constructor(id: string, title: string, description: string, imageUrl: string, progress: number, progressGoal: number, lastUpdated: number);
    /**
     * The id of this achievement.
     */
    id: string;
    /**
     * The title of this achievement.
     */
    title: string;
    /**
     * The description of this achievement.
     */
    description: string;
    /**
     * The image url of this achievement.
     */
    imageUrl: string;
    /**
     * The progress of this achievement.
     */
    progress: Number;
    /**
     * The progress goal of this achievement.
     */
    progressGoal: Number;
    /**
     * When this achievement was last updated.
     */
    lastUpdated: Date;
    /**
     * The progress ratio of this achievement.
     */
    progressRatio: number;
    /**
     * If this achievement is completed.
     */
    completed: boolean;
}