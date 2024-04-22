const DbService = require("../mixins/db.mixin");
const constants = require("../constants");

module.exports = {
	name: "orders",
	mixins: [DbService("orders")],
	collection: "orders",
	version: 1,

	actions: {
		list: {
			rest: "GET ",
			cache: false,
			permission: [constants.ROLE_ADMIN],
		},
			
		get: false,
	}
};
