const {getLastID} = require('../models/specialties.redis');

const lenOfID = 9;
module.exports = async () => {
    const lastID = await getLastID();

    const lenOfZeros = lenOfID - lastID.toString().length;
    let userID = 'S';
    for (let i = 0; i < lenOfZeros; i++) {
        userID += '0';
    }
    userID += lastID;
    console.log(userID)

    return userID;
}