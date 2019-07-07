module.exports = {
    env: 'development',
    db: {
        url: 'mongodb://localhost/servix'
    },
    url: 'http://localhost:8888',
    cdn: 'http://localhost:4111',
    sms: {
        apikey: "6A66703335357A384957496B31395134785A4851625349505265562B5A775045"
    },
    zarinpal: {
        apikey: '3d356896-e253-11e8-aff3-005056a205be',
        sandbox: true
    },
    api: {
        port: process.env.PORT || 4000,
        rateLimting: {
            windowMs: 60 * 1000,
            max: 100
        }
    },
    expires: {
        verify: 5 * 60 * 1000
    },
    jwt: {
        secret: 'alsjkgnp-saFfagDGkjsnfapow-kjfalsngjpn43twp2ojnavs',
        expiresIn: 60 * 60 * 24 * 7
    },
    email: {
        secure: true,
        message: {
            from: 'info@servixkala.com'
        },
        send: true,
        transport: {
            host: 'afagh.dnswebhost.com',
            port: 465,
            auth: {
                user: 'servix@sama.co.com',
                pass: 'bXxVQW~J%U^q'
            }
        }
    },
    redis: {
        port: 6379,
        host: "localhost"
    },
    microservix: {
        namespace: "servix",
        nodeID: "servix",
        logger: true,
        logLevel: "debug",
        logFormatter: "default",
        transporter: "NATS",
        cacher: "Redis",
        serializer: "JSON",
        requestTimeout: 1000 * 1000,
        requestRetry: 3
    }
};