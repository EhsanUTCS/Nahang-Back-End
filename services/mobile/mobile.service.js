const _ = require('lodash');
const Service = require('../../core/service');
const config = require("../../config");
const kavenegar = require("kavenegar");
const kavenegarApi = kavenegar.KavenegarApi(config.sms);

class MobileService extends Service {
  constructor(broker) {
    super(broker);

    this.parseServiceSchema({
      name: 'mobile',
      version: '1.0.0',
      actions: {
        // send: {
        //   params: sendParams,
        //   handler: this.send,
        // }
      },
      methods: {},
      events: {
        'verify.sendMobile': this.eventVerifySendMobile,
      },
      created: this.serviceCreated,
      started: this.serviceStarted,
      stopped: this.serviceStopped,
    });
  }

  async eventVerifySendMobile(payload) {
    this.logger.info('eventVerifySendMobile');

    kavenegarApi.VerifyLookup({
      receptor: payload.recipent,
      token: payload.code,
      template: "nahang"
    }, (response, status) => {
      this.logger.info('Send mobile verify response - ', response);
      this.logger.info('Send mobile verify status - ', status);
      console.log(response)
      console.log(status)
    });
  }

  serviceCreated() {
    this.logger.info('Mobile Service created.');
  }

  serviceStarted() {
    this.logger.info('Mobile Service started.');
  }

  serviceStopped() {
    this.logger.info('Mobile Service stopped.');
  }
}

module.exports = MobileService;