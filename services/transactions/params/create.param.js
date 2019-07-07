module.exports = {
  amount: {
    type: "number",
    optional: false,
  },
  origin: {
      type: "string",
      optional: true,
  },
  due: {
    type: 'enum',
    values: ['bank', 'order','checkout'],
    optional: false,
  }
};