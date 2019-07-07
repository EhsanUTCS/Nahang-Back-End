var Pusher = require('pusher');

var pusher = new Pusher({
    appId: '737291',
    key: 'e732e043e8d0749d0cad',
    secret: '7552fd63fd59dadea9b4',
    cluster: 'mt1',
    encrypted: true
});

module.exports = pusher