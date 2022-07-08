import { Store } from "cache-manager";
export declare class RedisStore implements Store {
    private redisCache;
    private storeArgs;
    name: string;
    isCacheableValue: any;
    constructor(...args: any[]);
    getClient(): any;
    set(key: any, value: any, options: any, cb: any): Promise<unknown>;
    get(key: any, options: any, cb: any): Promise<unknown>;
    del(key: any, options: any, cb: any): any;
    reset(cb: any): any;
    keys(pattern: any, cb: any): Promise<unknown>;
    ttl(key: any, cb: any): any;
}
declare const _default: {
    create: (...args: any[]) => RedisStore;
};
export default _default;
//# sourceMappingURL=index.d.ts.map