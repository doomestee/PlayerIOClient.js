const { bigDBDeserialize } = require("./bigdb.js");
const PlayerIOError = require("./playerioerror.js");
const { compareForChanges, convertFromKVArray } = require("./utilities.js");
const PlayerIOErrorCode = PlayerIOError.PlayerIOErrorCode;

/**
 * The PayVault service.
 */
module.exports = class PayVault {
    /**
     * @param {import("./channel")} channel 
     */
    constructor(channel) {
        this.channel = channel;
        this.currentVersion = null;

        /** The number of coins in this user's Vault. You must call refresh() first to initialize this value.
        * @type {number}
        */
        this.coins = "[ERROR: you tried to access payVault.coins before the vault was loaded. You have to refresh the vault before the .coins property is set to the right value]";

        /** The list of items in this user's Vault. You must call refresh() first to initialize this value.
        * @type {number}
        */
        this.items = "[ERROR: you tried to access payVault.items before the vault was loaded. You have to refresh the vault before the .items property is set to the right value]";
    }

    /**
    * This method checks if the Vault contains at least one item of the given itemKey. This method can only be called on an up-to-date vault.
    * @param {string} itemKey The itemKey to check for.
    * @return {boolean} True if the user has at least one item of the given type (itemKey).
    */
    has(itemKey) {
        if (currentVersion == null) { throw new PlayerIOError(PlayerIOErrorCode.VaultNotLoaded, "Cannot access items before vault has been loaded. Please refresh the vault first"); }
        for (let i = 0; i != this.items.length; i++) {
            if (this.items[i].itemKey == itemKey) {
                return true;
            }
        }
        return false;
    }

    /**
    * Returns the first item of the given itemKey from this Vault. This method can only be called on an up-to-date vault.
    * @param {string} itemKey The itemKey of the item to get.
    * @return {number} A VaultItem if one was found, or null if not.
    */
    first(itemKey) {
        if (currentVersion == null) { throw new PlayerIOError(PlayerIOErrorCode.VaultNotLoaded, "Cannot access items before vault has been loaded. Please refresh the vault first"); }
        for (let i = 0; i != this.items.length; i++) {
            if (this.items[i].itemKey == itemKey) {
                return this.items[i];
            }
        }
        return null;
    }
    /**
    * Returns the number of items of a given itemKey is in this Vault. This method can only be called on an up-to-date vault.
    * @param string itemKey The itemKey of the items to count.
    * @return {number} The number of items of the given type that the user has in the vault.
    */
    count(itemKey) {
        if (currentVersion == null) { throw new PlayerIOError(PlayerIOErrorCode.VaultNotLoaded, "Cannot access items before vault has been loaded. Please refresh the vault first"); }
        let result = 0;
        for (let i = 0; i != this.items.length; i++) {
            if (this.items[i].itemKey == itemKey) {
                result++;
            }
        }
        return result;
    }

    /**
    * Refreshes this Vault, making sure the Items and Coins are up-to-date.
    * @return {Promise<boolean>}
    */
    refresh() {
        return this.channel.payVaultRefresh(this.currentVersion, null)
            .then(result => { return this.readContent(result.vaultcontents); });
    }

    /**
    * Loads a page of entries from this Vaults history, in reverse chronological order, i.e. newest first.
    * @param {number} page The page of entries to load. The first page has number 0.
    * @param {number} pageSize The number of entries per page.
    */
    readHistory(page, pageSize) {
        return this.channel.payVaultReadHistory(page, pageSize, null)
            .then(result => {
                let arr = [];

                for (let i = 0; i < result.entries.length; i++) {
                    let item = result.entries[i];

                    arr.push(new payVaultHistoryEntry(item.type, item.amount, item.timestamp, item.itemkeys || [], item.reason, item.providertransactionid, item.providerprice));
                }
                
                return arr;
            });
    }

    /**
    * Give coins to this Vault
    * @param {number} coinAmount The amount of coins to give.
    * @param {string} reason Your reason for giving the coins to this user. This will show up in the vault history, and in the PayVault admin panel for this user.
    */
    credit(coinAmount, reason) {
        return this.channel.payVaultCredit(coinAmount, reason, null)
            .then(result => { return this.readContent(result.vaultcontents); });
    }

    /**
    * Take coins from this Vault
    * @param {number} coinAmount The amount of coins to take.
    * @param {string} reason Your reason for taking the coins from this user. This will show up in the vault history, and in the PayVault admin panel for this user.
    */
    debit(coinAmount, reason) {
        return this.channel.payVaultDebit(coinAmount, reason, null)
            .then(result => { return this.readContent(result.vaultcontents); });
    }

    /**
    * Consume items in this Vault. This will cause them to be removed, but this action will not show up in the vault history.
    * 
    * You don't need to call refresh after this call.
    * @param {VaultItem[]} items The VaultItems to use from the users vault - this should be instances of items in this Vault.
    */
    consume(items) {
        if (typeof (items) != 'object' && !items.length) {
            return Promise.reject("The first argument to consume should be an array: client.payVault.consume([item], ...)");
        }

        let ids = [];

        for (let i = 0; i < items.length; i++) {
            let id = items[i].id;
            if (id) ids.push(id);
            else return Promise.reject("No PayVault item id found on item#" + i + ". You have to use items from the payVault.items array. For instance: client.payVault.consume([client.payVault.first('sportscar')], ...)");
        }

        return this.channel.payVaultConsume(ids, null)
            .then(result => { return this.readContent(result.vaultcontents); });
    }


    /**
    * Buy items with Coins.
    * @param {object[]} items A list of items to buy. Each item must have a property called 'itemkey' with the item key. Any additional properties will be converted to item payload.
    * @param {boolean} storeItems Whether or not to store the items in the vault after purchase
    */
    buy(items, storeItems) {
        return this.channel.payVaultBuy(convertBuyItems(items), storeItems, null)
            .then(result => { return this.readContent(result.vaultcontents); });
    }

    /**
    * Give the user items without taking any of his coins from the vault.
    * @param {object[]} items A list of items to give. Each item must have a property called 'itemkey' with the item key. Any additional properties will be converted to item payload.
    */
    give(items) {
        return this.channel.payVaultGive(convertBuyItems(items), null)
            .then(result => { return this.readContent(result.vaultcontents); });
    }

    /**
    * Gets information about how to make a coin purchase with the specified PayVault provider.
    * @param {string} provider The name of the PayVault provider to use for the coin purchase.
    * @param {object} purchaseArguments Any additional information that will be given to the PayVault provider to configure this purchase.
    */
    getBuyCoinsInfo(provider, purchaseArguments) {
        return this.channel.payVaultPaymentInfo(provider, _pio.convertToKVArray(purchaseArguments), null)
            .then(result => { return convertFromKVArray(result.providerarguments); });
    }

    /**
    * Gets information about how to make a direct item purchase with the specified PayVault provider.
    * @param {string} provider The name of the PayVault provider to use for the item purchase.
    * @param {object} purchaseArguments Any additional information that will be given to the PayVault provider to configure this purchase.
    * @param {object[]} items A list of items to buy. Each item must have a property called 'itemkey' with the item key. Any additional properties will be converted to item payload.
    */
    getBuyDirectInfo(provider, purchaseArguments, items) {
        return this.channel.payVaultPaymentInfo(provider, _pio.convertToKVArray(purchaseArguments), _pio.convertBuyItems(items))
        .then(result => { return convertFromKVArray(result.providerarguments); });
    }

    readContent(content) {
        if (content != null) {
            this.currentVersion = content.version;

            this.coins = content.coins || 0;
            this.items = [];

            if (content.items?.length) {
                for (let i = 0; i < content.items.length; i++) {
                    let item = content.items[i];
                    let obj = this.items[i] = new VaultItem(item.id, item.itemkey, new Date(item.purchasedate));

                    bigDBDeserialize(item.properties, obj, true);
                    this.items[i] = obj; // idk much but i just don't believe it mutates like that.
                }
            }

            return true;
        } return false;
    }
};

/**
 * This class represents an item in a user's Vault
 */
class VaultItem {
    constructor(id, itemKey, purchaseDate) {
		/** The unique id of this particular vault item in the user's vault
		* @type string
		*/
		this.id = id;

		/** The key of the underlying item in the PayVaultItems BigDB table
		* @type string
		*/
		this.itemKey = itemKey;

		/** The time when the vault item was originally purchased
		* @type Date
		*/
		this.purchaseDate = purchaseDate;
    }
}

/**
* This class represents an entry in a user's PayVault history.
*/
class payVaultHistoryEntry {
    constructor(type, amount, timestamp, itemkeys, reason, providerTransactionId, providerPrice) {
        /** The type of this entry, for example 'buy','credit','debit'... 
        * @type string
        */
        this.type = type;
        /** The coin amount of this entry. 
        * @type number
        */
        this.amount = amount;
        /** When this entry was created. 
        * @type Date
        */
        this.timestamp = new Date().setTime(timestamp);
        /** The item keys related to this entry (entries with type 'buy'). 
        * @type string[]
        */
        this.itemKeys = itemkeys;
        /** The developer supplied reason for entries of type 'credit' and 'debit'. 
        * @type string
        */
        this.reason = reason;
        /** The transaction id from the PayVault provider corresponding to this entry. 
        * @type string
        */
        this.providerTransactionId = providerTransactionId;
        /** The price in real currency of this entry formatted as a human readable currency string, e.g. $10.00 USD 
        * @type string
        */
        this.providerPrice = providerPrice;
    }
}

let convertBuyItems = function(items) {
    if (items == null) return [];
    let results = [];

    for (let i = 0; i != items.length; i++) {
        let itemKey = items[i].itemkey

        if (!itemKey) {
            throw Error("You have to specify an itemkey for the payvault item. Example:  {itemkey:'car'}");
        }

        results.push({
            itemkey: itemKey,
            payload: compareForChanges({ itemkey: itemKey }, items[i], true, true)
        })
    }

    return results;
}

module.exports.VaultItem = VaultItem;
module.exports.payVaultHistoryEntry = payVaultHistoryEntry;