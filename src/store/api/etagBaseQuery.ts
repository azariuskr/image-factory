import {
    BaseQueryFn,
    FetchArgs,
    FetchBaseQueryError,
    FetchBaseQueryMeta,
    fetchBaseQuery
} from '@reduxjs/toolkit/query/react';

// ETag Storage Manager with proper typing
class ETagManager {
    private memoryCache: Map<string, { etag: string; timestamp: number }> = new Map();
    private readonly STORAGE_KEY = 'rtk-query-etags';
    private readonly MAX_AGE_MS = 24 * 60 * 60 * 1000; // 24 hours

    constructor() {
        this.loadFromStorage();
    }

    private loadFromStorage(): void {
        if (typeof window === 'undefined') return;

        try {
            const stored = localStorage.getItem(this.STORAGE_KEY);
            if (stored) {
                const parsed = JSON.parse(stored);
                Object.entries(parsed).forEach(([key, value]) => {
                    const typedValue = value as { etag: string; timestamp: number };
                    if (this.isValid(typedValue)) {
                        this.memoryCache.set(key, typedValue);
                    }
                });
            }
        } catch (error) {
            console.warn('Failed to load ETags from storage:', error);
        }
    }

    private saveToStorage(): void {
        if (typeof window === 'undefined') return;

        try {
            const data: Record<string, { etag: string; timestamp: number }> = {};
            this.memoryCache.forEach((value, key) => {
                if (this.isValid(value)) {
                    data[key] = value;
                }
            });
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
        } catch (error) {
            console.warn('Failed to save ETags to storage:', error);
        }
    }

    private isValid(entry: { etag: string; timestamp: number }): boolean {
        return Date.now() - entry.timestamp < this.MAX_AGE_MS;
    }

    get(key: string): string | null {
        const entry = this.memoryCache.get(key);
        if (entry && this.isValid(entry)) {
            return entry.etag;
        }
        if (entry) {
            this.memoryCache.delete(key);
        }
        return null;
    }

    set(key: string, etag: string): void {
        this.memoryCache.set(key, { etag, timestamp: Date.now() });
        this.saveToStorage();
    }

    delete(key: string): void {
        this.memoryCache.delete(key);
        this.saveToStorage();
    }

    clear(pattern?: string): void {
        if (pattern) {
            Array.from(this.memoryCache.keys())
                .filter(key => key.includes(pattern))
                .forEach(key => this.memoryCache.delete(key));
        } else {
            this.memoryCache.clear();
        }
        this.saveToStorage();
    }

    cleanup(): void {
        let hasChanges = false;
        this.memoryCache.forEach((value, key) => {
            if (!this.isValid(value)) {
                this.memoryCache.delete(key);
                hasChanges = true;
            }
        });
        if (hasChanges) {
            this.saveToStorage();
        }
    }
}

// Create singleton instance
export const etagManager = new ETagManager();

// Cleanup periodically
if (typeof window !== 'undefined') {
    setInterval(() => etagManager.cleanup(), 60 * 60 * 1000);
}

// Helper to generate cache keys
export function generateETagKey(url: string, params?: Record<string, any>): string {
    if (!params || Object.keys(params).length === 0) {
        return url;
    }

    const sortedParams = Object.keys(params)
        .sort()
        .reduce((acc, key) => {
            if (params[key] !== undefined && params[key] !== null) {
                acc[key] = params[key];
            }
            return acc;
        }, {} as Record<string, any>);

    return `${url}::${JSON.stringify(sortedParams)}`;
}

// Enhanced base query with proper typing
export const createETagBaseQuery = (
    baseUrl: string,
    customPrepareHeaders?: (headers: Headers) => Headers
): BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError, {}, FetchBaseQueryMeta> => {
    const baseQuery = fetchBaseQuery({
        baseUrl,
        prepareHeaders: (headers, api) => {
            // Generate cache key based on the actual request
            let url = '';
            let params: Record<string, any> | undefined;

            if (typeof api.endpoint === 'string') {
                // Get the query args to build the proper cache key
                const args = api.getState() as any;
                const endpointDefinition = api.extra as any;

                if (typeof endpointDefinition === 'object' && endpointDefinition.arg) {
                    const queryArg = endpointDefinition.arg;
                    if (typeof queryArg === 'object') {
                        // Extract URL from the query function result
                        const queryConfig = queryArg.originalArgs || queryArg;
                        if (typeof queryConfig === 'string') {
                            url = queryConfig;
                        } else if (queryConfig?.url) {
                            url = queryConfig.url;
                            params = queryConfig.params;
                        }
                    }
                }
            }

            // Try to extract URL from the actual request args
            const endpoint = (api as any).endpoint;
            const arg = (api as any).arg;

            if (typeof arg === 'string') {
                url = arg;
            } else if (arg?.url) {
                url = arg.url;
                params = arg.params;
            } else if (arg?.originalArgs) {
                // Handle mutation args
                if (typeof arg.originalArgs === 'string') {
                    url = arg.originalArgs;
                } else if (arg.originalArgs?.url) {
                    url = arg.originalArgs.url;
                    params = arg.originalArgs.params;
                }
            }

            // Generate ETag key and get stored ETag
            if (url) {
                const cacheKey = generateETagKey(url, params);
                const etag = etagManager.get(cacheKey);

                if (etag) {
                    console.log('[ETag] Setting If-None-Match header:', etag, 'for', cacheKey);
                    headers.set('If-None-Match', etag);
                }
            }

            // Apply custom headers if provided
            if (customPrepareHeaders) {
                return customPrepareHeaders(headers);
            }

            return headers;
        },
    });

    return async (args, api, extraOptions) => {
        // Extract URL for cache key
        let url = '';
        let params: Record<string, any> | undefined;

        if (typeof args === 'string') {
            url = args;
        } else if (args && typeof args === 'object' && 'url' in args) {
            url = args.url;
            params = (args as any).params;
        }

        const result = await baseQuery(args, api, extraOptions);

        // Handle ETag from response
        if (result.meta?.response) {
            const responseHeaders = result.meta.response.headers;
            const etag = responseHeaders.get('ETag') || responseHeaders.get('etag');
            const status = result.meta.response.status;

            if (etag && status !== 304 && url) {
                const cacheKey = generateETagKey(url, params);
                console.log('[ETag] Storing ETag:', etag, 'for', cacheKey);
                etagManager.set(cacheKey, etag);
            }

            // Handle 304 Not Modified
            if (status === 304) {
                console.log('[ETag] Got 304 Not Modified for', url);
                return {
                    data: undefined,
                    meta: {
                        ...result.meta,
                        request: result.meta.request,
                        response: result.meta.response,
                    },
                };
            }
        }

        return result;
    };
};

// Export utilities
export const etagUtils = {
    manager: etagManager,
    generateKey: generateETagKey,

    // Debug helper
    debugETags: () => {
        const etags: Record<string, any> = {};
        etagManager['memoryCache'].forEach((value, key) => {
            etags[key] = value;
        });
        console.log('[ETag] Current ETags:', etags);
        return etags;
    },
};
