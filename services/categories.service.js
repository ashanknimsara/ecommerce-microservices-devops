const DbService = require("../mixins/db.mixin");
const constants = require("../constants");

module.exports = {
	name: "categories",
	mixins: [DbService("categories")],
	collection: "categories",
	version: 1,

	actions: {
		list: {
			rest: "GET ",
			cache: false,
			permission: [constants.ROLE_ADMIN],
		},
		
		update: false,
		get: false,
	}
};
