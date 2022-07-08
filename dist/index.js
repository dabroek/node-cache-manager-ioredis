import Redis from 'ioredis';

class RedisStore {
    constructor(...args) {
        this.name = "redis";
        if (args.length > 0 && args[0].redisInstance) {
            this.redisCache = args[0].redisInstance;
        }
        else if (args.length > 0 && args[0].clusterConfig) {
            const { nodes, options } = args[0].clusterConfig;
            this.redisCache = new Redis.Cluster(nodes, options || {});
        }
        else {
            this.redisCache = new Redis(...args);
        }
        this.storeArgs = this.redisCache.options;
        this.isCacheableValue = this.storeArgs.isCacheableValue || ((value) => value !== undefined && value !== null);
    }
    getClient() {
        return this.redisCache;
    }
    set(key, value, options, cb) {
        return new Promise((resolve, reject) => {
            if (typeof options === "function") {
                cb = options;
                options = {};
            }
            options = options || {};
            if (!cb) {
                cb = (err, result) => (err ? reject(err) : resolve(result));
            }
            if (!this.isCacheableValue(value)) {
                return cb(new Error(`"${value}" is not a cacheable value`));
            }
            const ttl = options.ttl || options.ttl === 0 ? options.ttl : this.storeArgs.ttl;
            const val = JSON.stringify(value) || '"undefined"';
            if (ttl) {
                this.redisCache.setex(key, ttl, val, handleResponse(cb));
            }
            else {
                this.redisCache.set(key, val, handleResponse(cb));
            }
        });
    }
    get(key, options, cb) {
        return new Promise((resolve, reject) => {
            if (typeof options === "function") {
                cb = options;
            }
            if (!cb) {
                cb = (err, result) => (err ? reject(err) : resolve(result));
            }
            this.redisCache.get(key, handleResponse(cb, { parse: true }));
        });
    }
    del(key, options, cb) {
        if (typeof options === "function") {
            cb = options;
        }
        return this.redisCache.del(key, handleResponse(cb));
    }
    reset(cb) {
        return this.redisCache.flushdb(handleResponse(cb));
    }
    keys(pattern, cb) {
        return new Promise((resolve, reject) => {
            if (typeof pattern === "function") {
                cb = pattern;
                pattern = "*";
            }
            if (!cb) {
                cb = (err, result) => (err ? reject(err) : resolve(result));
            }
            this.redisCache.keys(pattern, handleResponse(cb));
        });
    }
    ttl(key, cb) {
        return this.redisCache.ttl(key, handleResponse(cb));
    }
}
function handleResponse(cb, opts = {}) {
    return (err, result) => {
        if (err) {
            return cb && cb(err);
        }
        if (opts.parse) {
            try {
                result = JSON.parse(result);
            }
            catch (e) {
                return cb && cb(e);
            }
        }
        return cb && cb(null, result);
    };
}
var index = { create: (...args) => new RedisStore(...args) };

export { RedisStore, index as default };
