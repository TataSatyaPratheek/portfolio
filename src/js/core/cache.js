/**
 * cache.js - Caching system for portfolio website
 * Provides a simple interface for storing and retrieving data from localStorage
 * with automatic expiration.
 */

// Cache Manager class
class CacheManager {
    /**
     * Initialize the cache manager
     * @param {string} prefix - Prefix for cache keys (default: 'portfolio-cache')
     * @param {number} defaultTTL - Default time-to-live in seconds (default: 3600 = 1 hour)
     */
    constructor(prefix = 'portfolio-cache', defaultTTL = 3600) {
        this.prefix = prefix;
        this.defaultTTL = defaultTTL;
        this.isAvailable = this.checkAvailability();
        
        // Clean expired entries on initialization
        if (this.isAvailable) {
            this.cleanExpired();
        }
    }
    
    /**
     * Check if localStorage is available
     * @returns {boolean} - Whether localStorage is available
     */
    checkAvailability() {
        try {
            const testKey = `${this.prefix}-test`;
            localStorage.setItem(testKey, 'test');
            localStorage.removeItem(testKey);
            return true;
        } catch (error) {
            console.warn('localStorage is not available. Caching will be disabled.', error);
            return false;
        }
    }
    
    /**
     * Generate the full cache key with prefix
     * @param {string} key - Cache key
     * @returns {string} - Prefixed cache key
     */
    getFullKey(key) {
        return `${this.prefix}-${key}`;
    }
    
    /**
     * Store data in cache
     * @param {string} key - Cache key
     * @param {any} data - Data to store
     * @param {number} ttl - Time-to-live in seconds (default: this.defaultTTL)
     * @returns {boolean} - Whether the operation was successful
     */
    set(key, data, ttl = this.defaultTTL) {
        if (!this.isAvailable) return false;
        
        try {
            const fullKey = this.getFullKey(key);
            const expiresAt = Date.now() + (ttl * 1000);
            
            const cacheItem = {
                data,
                expiresAt
            };
            
            localStorage.setItem(fullKey, JSON.stringify(cacheItem));
            return true;
        } catch (error) {
            console.error('Error storing data in cache:', error);
            return false;
        }
    }
    
    /**
     * Retrieve data from cache
     * @param {string} key - Cache key
     * @returns {any|null} - Cached data or null if not found/expired
     */
    get(key) {
        if (!this.isAvailable) return null;
        
        try {
            const fullKey = this.getFullKey(key);
            const cacheItem = localStorage.getItem(fullKey);
            
            if (!cacheItem) return null;
            
            const { data, expiresAt } = JSON.parse(cacheItem);
            
            // Check if expired
            if (Date.now() > expiresAt) {
                this.remove(key);
                return null;
            }
            
            return data;
        } catch (error) {
            console.error('Error retrieving data from cache:', error);
            return null;
        }
    }
    
    /**
     * Remove item from cache
     * @param {string} key - Cache key
     * @returns {boolean} - Whether the operation was successful
     */
    remove(key) {
        if (!this.isAvailable) return false;
        
        try {
            const fullKey = this.getFullKey(key);
            localStorage.removeItem(fullKey);
            return true;
        } catch (error) {
            console.error('Error removing item from cache:', error);
            return false;
        }
    }
    
    /**
     * Clean expired cache entries
     * @returns {number} - Number of items cleaned
     */
    cleanExpired() {
        if (!this.isAvailable) return 0;
        
        try {
            let cleaned = 0;
            const now = Date.now();
            
            // Iterate through all localStorage items
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                
                // Check if it's one of our cache items
                if (key.startsWith(this.prefix)) {
                    try {
                        const cacheItem = JSON.parse(localStorage.getItem(key));
                        
                        // If expired, remove it
                        if (cacheItem.expiresAt && now > cacheItem.expiresAt) {
                            localStorage.removeItem(key);
                            cleaned++;
                        }
                    } catch (parseError) {
                        // If we can't parse it, it's probably corrupted, so remove it
                        localStorage.removeItem(key);
                        cleaned++;
                    }
                }
            }
            
            return cleaned;
        } catch (error) {
            console.error('Error cleaning expired cache entries:', error);
            return 0;
        }
    }
    
    /**
     * Clear all cache entries with our prefix
     * @returns {boolean} - Whether the operation was successful
     */
    clear() {
        if (!this.isAvailable) return false;
        
        try {
            // Collect keys first to avoid issues with changing array during iteration
            const keysToRemove = [];
            
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key.startsWith(this.prefix)) {
                    keysToRemove.push(key);
                }
            }
            
            // Remove collected keys
            keysToRemove.forEach(key => localStorage.removeItem(key));
            
            return true;
        } catch (error) {
            console.error('Error clearing cache:', error);
            return false;
        }
    }
    
    /**
     * Get cache statistics
     * @returns {Object} - Cache statistics
     */
    getStats() {
        if (!this.isAvailable) return { available: false };
        
        try {
            let totalItems = 0;
            let totalSize = 0;
            let expiredItems = 0;
            const now = Date.now();
            
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                
                if (key.startsWith(this.prefix)) {
                    const item = localStorage.getItem(key);
                    totalSize += item.length;
                    totalItems++;
                    
                    try {
                        const cacheItem = JSON.parse(item);
                        if (cacheItem.expiresAt && now > cacheItem.expiresAt) {
                            expiredItems++;
                        }
                    } catch (e) {
                        // Ignore parsing errors in stats
                    }
                }
            }
            
            return {
                available: true,
                totalItems,
                totalSize: `${Math.round(totalSize / 1024)} KB`,
                expiredItems,
                prefix: this.prefix
            };
        } catch (error) {
            console.error('Error getting cache statistics:', error);
            return { available: false, error: error.message };
        }
    }
}

// Initialize cache manager and expose to global scope
window.CacheManager = new CacheManager();