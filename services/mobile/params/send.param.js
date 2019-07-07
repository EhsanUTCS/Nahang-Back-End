module.exports = {
  client: [
    {
      type: "email",
      optional: false
    },
    {
      type: "string",
      pattern: /^0\d{10}$/,
      optional: false,
      length: 11
    },
    {
      type: "string",
      pattern: /^U\d{16}$/,
      optional: false,
      length: 17
    },
    {
      type: "string",
      pattern: /^DM\d{16}$/,
      optional: false,
      length: 18
    }
  ],
  password: {
    type: "string",
    empty: false,
    min: 6,
    optional: true
  }
};