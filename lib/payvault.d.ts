import HTTPChannel from "./channel";

export = class PayVault {
    constructor(channel: HTTPChannel);

    protected channel: HTTPChannel;
    currentVersion: string;

    /**
     * The number of coins in this user's Vault. You must call refresh() first to initialize this value.
     */
    coins: number;

    /**
     * The list of items in this user's Vault. You must call refresh() first to initialize this value.
     */
    items: VaultItem[];

    /**
     * This method checks if the Vault contains at least one item of the given itemKey. This method can only be called on an up-to-date vault.
     * @param itemKey The itemKey to check for.
     * @returns True if the user has at least one item of the given type (itemKey).
     */
    has(itemKey: string): boolean;

    /**
     * Returns the first item of the given itemKey from this Vault. This method can only be called on an up-to-date vault.
     * @param itemKey The itemKey of the item to get.
     * @returns A VaultItem if one was found, or null if not.
     */
    first(itemKey: string): number;

    /**
     * Returns the number of items of a given itemKey is in this Vault. This method can only be called on an up-to-date vault.
     * @param itemKey The itemKey of the items to count.
     * @return The number of items of the given type that the user has in the vault.
     */
    count(itemKey: string): number;

    /**
     * Refreshes this Vault, making sure the Items and Coins are up-to-date.
     */
    count(): Promise<boolean>;

    /**
    * Loads a page of entries from this Vaults history, in reverse chronological order, i.e. newest first.
    * @param page The page of entries to load. The first page has number 0.
    * @param pageSize The number of entries per page.
    */
    readHistory(page: string, pageSize: string): Promise<PayVaultHistoryEntry[]>;

    /**
    * Give coins to this Vault
    * @param coinAmount The amount of coins to give.
    * @param reason Your reason for giving the coins to this user. This will show up in the vault history, and in the PayVault admin panel for this user.
    */
    credit(coinAmount: number, reason: string): Promise<boolean>;

    /**
    * Give coins from this Vault
    * @param coinAmount The amount of coins to take.
    * @param reason Your reason for giving the coins from this user. This will show up in the vault history, and in the PayVault admin panel for this user.
    */
    debit(coinAmount: number, reason: string): Promise<boolean>;

    /**
    * Consume items in this Vault. This will cause them to be removed, but this action will not show up in the vault history.
    * 
    * You don't need to call refresh after this call
    * @param items VaultItems to use from the users vault - this should be instances of items in this Vault.
    */
    debit(items: VaultItem[]): Promise<boolean>;

    /**
    * Buy items with Coins.
    * @param items A list of items to buy. Each item must have a property called 'itemkey' with the item key. Any additional properties will be converted to item payload.
    * @param storeItems Whether or not to store the items in the vault after purchase
    */
    buy(items: { itemkey: string }[], storeItems: boolean): Promise<boolean>;

    /**
    * Give the user items without taking any of his coins from the vault.
    * @param items A list of items to give. Each item must have a property called 'itemkey' with the item key. Any additional properties will be converted to item payload.
    */
    buy(items: Object[], storeItems: boolean): Promise<boolean>;

    /**
    * Gets information about how to make a coin purchase with the specified PayVault provider.
    * @param provider The name of the PayVault provider to use for the coin purchase.
    * @param purchaseArguments Any additional information that will be given to the PayVault provider to configure this purchase.
    */
    getBuyCoinsInfo(provider: string, purchaseArguments: Object): Promise<Object>;

    /**
    * Gets information about how to make a direct item purchase with the specified PayVault provider.
    * @param provider The name of the PayVault provider to use for the item purchase.
    * @param purchaseArguments Any additional information that will be given to the PayVault provider to configure this purchase.
    * @param items A list of items to buy. Each item must have a property called 'itemkey' with the item key. Any additional properties will be converted to item payload.
    */
    getBuyDirectInfo(provider: string, purchaseArguments: Object, items: Object[]): Promise<Object>;

    readContent(content: { version: string, coins: number, items: { id: string, itemkey: string, purchasedate: number, properties: unknown }[]}): boolean;
}

/**
 * This class represents an item in a user's Vault
 */
export class VaultItem {
    constructor(id: string, itemKey: string, purchaseDate: Date);

    /**
     * The unique id of this particular vault item in the user's vault.
     */
    id: string;
    
    /**
     * The key of the underlying item in the PayVaultItems BigDB table.
     */
    itemKey: string;

    /**
     * The time when the vault item was originally purchased.
     */
    purchaseDate: string;
}

/**
* This class represents an entry in a user's PayVault history.
*/
export class PayVaultHistoryEntry {
    constructor(type: string, amount: number, timestamp: number, itemkeys: string[], reason: string, providerTransactionId: string, providerPrice: string);

    /**
     * The type of this entry, for example 'buy','credit','debit'...
     */
    type: string;

    /**
     * The coin amount of this entry.
     */
    amount: number;

    /**
     * When this entry was created.
     */
    timestamp: Date;

    /**
     * The item keys related to this entry (entries with type 'buy').
     */
    itemkeys: string[];

    /**
     * The developer supplied reason for entries of type 'credit' and 'debit'.
     */
    reason: string;

    /**
     * The transaction id from the PayVault provider corresponding to this entry.
     */
    providerTransactionId: string;

    /**
     * The price in real currency of this entry formatted as a human readable currency string, e.g. $10.00 USD
     */
    providerPrice: string;
}