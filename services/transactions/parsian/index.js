var config = require ('./config');
var soap = require ('soap');

function Parsian (Pin, Terminal) {
  if (typeof Pin === 'string') {
    this.pin = Pin;
  } else {
    console.error ('The Pin must be String.');
    return false;
  }

  if (typeof Terminal === 'string') {
    this.terminal = Terminal;
  } else {
    console.error ('The Terminal must be String.');
    return false;
  }
}

Parsian.prototype.PaymentRequest = function (input) {
  var self = this;

  var requestData = {
    LoginAccount: self.pin,
    Amount: input.Amount,
    OrderId: input.OrderId,
    CallBackUrl: input.CallBackUrl,
  };

  var promise = new Promise (function (resolve, reject) {
    soap.createClient (config.pay_url, function (err, client) {
      client.SalePaymentRequest ({requestData}, function (err, result) {
            if(err || result.SalePaymentRequestResult.Status !== '0'){
                console.log(err)
                console.log(result.SalePaymentRequestResult)
                return reject({
                    ok: false
                })
            }

            resolve ({
              ok: true,
              status: result.SalePaymentRequestResult.Status,
              token: result.SalePaymentRequestResult.Token,
              url: config.pg_url + result.SalePaymentRequestResult.Token
            });
        }
      );
    });
  });

  return promise;
};


Parsian.prototype.PaymentVerification = function (input) {
  var self = this;

  var requestData = {
    LoginAccount: self.pin,
    Token: input.Token,
  };

  var promise = new Promise (function (resolve, reject) {
    soap.createClient (config.verify_url, function (err, client) {
      client.ConfirmPayment ({requestData}, function (err, result) {
            if(err){
                return reject({
                    ok: false
                })
            }

            resolve ({
              ok: true,
              status: result.ConfirmPaymentResult.Status,
              token: result.ConfirmPaymentResult.Token,
              rrn: result.ConfirmPaymentResult.RRN,
            });
        }
      );
    });
  });

  return promise;
};


exports.create = function (Pin, Terminal) {
  return new Parsian (Pin, Terminal);
};