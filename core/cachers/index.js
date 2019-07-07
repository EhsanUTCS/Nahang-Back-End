/*
 * moleculer
 * Copyright (c) 2018 MoleculerJS (https://github.com/moleculerjs/moleculer)
 * MIT Licensed
 */

"use strict";

const _ = require("lodash");
const { BrokerOptionsError } = require("../errors");

const Cachers = {
	Base: require("./base"),
	Memory: require("./memory"),
	Redis: require("./redis")
};

function getByName(name) {
	/* istanbul ignore next */
	if (!name)
		return null;

	let n = Object.keys(Cachers).find(n => n.toLowerCase() == name.toLowerCase());
	if (n)
		return Cachers[n];
}

/**
 * Resolve cacher by name
 *
 * @param {object|string} opt
 * @returns {Cacher}
 */
function resolve(opt) {
	if (opt instanceof Cachers.Base) {
		return opt;
	} else if (opt === true) {
		return new Cachers.Memory();
	} else if (_.isString(opt)) {
		let CacherClass = getByName(opt);
		if (CacherClass)
			return new CacherClass();

		if (opt.startsWith("redis://"))
			CacherClass = Cachers.Redis;

		if (CacherClass)
			return new CacherClass(opt);
		else
			throw new BrokerOptionsError(`Invalid cacher type '${opt}'.`, { type: opt });

	} else if (_.isObject(opt)) {
		let CacherClass = getByName(opt.type || "Memory");
		if (CacherClass)
			return new CacherClass(opt.options);
		else
			throw new BrokerOptionsError(`Invalid cacher type '${opt.type}'.`, { type: opt.type });
	}

	return null;
}

module.exports = Object.assign({ resolve }, Cachers);
