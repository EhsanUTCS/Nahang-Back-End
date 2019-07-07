module.exports = {
  env: "production",
  db: {
    url: "mongodb://localhost/servix"
  },
  url: "https://my.nahangapp.ir",
  cdn: 'https://cdn.nahangapp.ir',
  sms: {
    apikey: "6A66703335357A384957496B31395134785A4851625349505265562B5A775045"
  },
  api: {
    port: process.env.PORT || 9993,
    rateLimting: {
      windowMs: 60 * 1000,
      max: 100
    }
  },
  expires: {
    verify: 5 * 60 * 1000
  },
  jwt: {
    secret: "alsjkgnp-saFfagDGkjsnfapow-kjfalsngjpn43twp2ojnavs",
    expiresIn: 60 * 60 * 24 * 90 
  },
  zarinpal: {
    apikey: "3d356896-e253-11e8-aff3-005056a205be",
    sandbox: false
  },
  email: {
    host: "afagh.dnswebhost.com",
    port: 465,
    secure: true,
    auth: {
      user: "servix@sama.co.com",
      pass: "bXxVQW~J%U^q"
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
    logLevel: "info",
    logFormatter: "default",
    transporter: "TCP",
    cacher: "Redis",
    serializer: "JSON",
    requestTimeout: 50 * 1000,
    requestRetry: 3
  }
};
