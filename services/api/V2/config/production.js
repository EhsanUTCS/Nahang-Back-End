module.exports = {
    env: 'production',
    module: 'api',
    port: 7000,
    rateLimting: {
        windowMs: 60 * 1000,
        max: 100
    }
};