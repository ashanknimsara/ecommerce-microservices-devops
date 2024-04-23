const DbService = require("../mixins/db.mixin");
const constants = require("../constants");
const { MoleculerClientError } = require("moleculer").Errors;

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
		create: {
			rest: "POST /addOrder",
			params: {
				customerName: "string",
				customerAddress: "string",
				customerContact: "string",
				productName: "string",
				productCode: "string",
				quantity: "number",
				paymentId: "string",
			},
			permission: [constants.ROLE_AUTHENTICATED],

			async handler(ctx) {
				const {
					customerName,
					customerAddress,
					customerContact,
					productCode,
					quantity,
					paymentId,
				} = ctx.params;

				try {
					const placedOrder = await this.adapter.insert({
						customerName,
						customerAddress,
						customerContact,
						productCode,
						quantity,
						paymentId,
						orderStatus: "pending",
					});
					console.log("placedOrder", placedOrder);
					return placedOrder;
				} catch (err) {
					return err;
				}
			},
		},
		remove: {
			rest: "DELETE /:id",
			permission: [constants.ROLE_AUTHENTICATED],
		},
		update: {
			rest: "PUT /:id",
			permission: [constants.ROLE_ADMIN],
			params: {
				id: "string",
				orderStatus: {
					type: "enum",
					values: [
						"pending",
						"inProgress",
						"dispatched",
						"delivered",
					],
				},
			},

			async handler(ctx) {
				const { id, orderStatus } = ctx.params;
				const updatedOrder = await this.adapter.updateById(id, {
					$set: { orderStatus: orderStatus },
				});
				if (!updatedOrder) {
					throw new MoleculerClientError("user not found", 404);
				}

				return updatedOrder;
			},
		},
		get: false,
	},
}