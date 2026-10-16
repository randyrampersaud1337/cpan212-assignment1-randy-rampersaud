export class Cache {
    constructor(ttlSeconds) {
        this.ttlSeconds = ttlSeconds;
        this.store = new Map();
        this.hits = 0;
        this.misses = 0;
    }
    get(key) {
        const entry = this.store.get(key);

        if(!entry || entry.expiresAt <= Date.now()) {
            this.misses += 1;
            return undefined;
        }
        this.hits += 1;
        return entry.value;
    }
    set(key, value) {
        this.store.set(key, {
            value,
            expiresAt: Date.now() + this.ttlSeconds * 1000
        });
    }
    stats() {
        return {
            entries: this.store.size,
            hits: this.hits,
            misses: this.misses,
            ttlSeconds: this.ttlSeconds
        };
    }
}