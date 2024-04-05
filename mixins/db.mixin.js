"use strict";

const DbService = require("moleculer-db");
const MongoAdapter = require("moleculer-db-adapter-mongo");
require('dotenv').config()

module.exports = function (collection) {
	console.log(process.env.MONGO_URI)
	if (process.env.MONGO_URI) {
		return {
			mixins: [DbService],
			adapter: new MongoAdapter(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true }),
			collection
		};
	} else {
		throw new Error("Mongo URI not provided");
	}
};
