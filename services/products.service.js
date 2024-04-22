const DbService = require("../mixins/db.mixin");
const constants = require("../constants");

module.exports = {
	name: "products",
	mixins: [DbService("products")],
	collection: "products",
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
