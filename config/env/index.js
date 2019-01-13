'use strict';

/* eslint prefer-destructuring: ["error", {AssignmentExpression: {array: true}}] */
const IS_PROD = require('../../app/constants/env').IS_PROD;

const PORT_PROD = require('./env.prod').PORT;

const PORT_DEV = require('./env.dev').PORT;

module.exports.PORT = process.env.PORT || IS_PROD ? PORT_PROD : PORT_DEV;
