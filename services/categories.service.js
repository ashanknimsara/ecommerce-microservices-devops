const DbService = require("../mixins/db.mixin");
const constants = require("../constants");
const { MoleculerClientError } = require("moleculer").Errors;
const Response = require("../utils/response.util");

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
		create: {
			rest: "POST /addCategory",
			params: {
				CategoryName: "string",
				CategoryCode: "string",
			},
			permission: [constants.ROLE_ADMIN],

			async handler(ctx) {
				const { CategoryName, CategoryCode } = ctx.params;

				try {
					const insertedCategory = await this.adapter.insert({ CategoryName, CategoryCode });
					return { insertedCategory };
				} catch (err) {
					return (err);
				}
			}
		},
		remove: {
			rest: "DELETE /:id",
			permission: [constants.ROLE_ADMIN],
			async handler(ctx) {
				const { id } = ctx.params;
				const removedField = await this.adapter.removeById(id);
				if (!removedField) {
					throw new MoleculerClientError(
						"Product not found",
						404
					);
				}
				return Response.success("Product deleted!");
			},
		},
		updateCategory: {
			rest: "PUT update/:id",
			permission: [constants.ROLE_ADMIN],
			params: {
				id: "string",
				CategoryName: "string",
				CategoryCode: "string",
			},

			async handler(ctx) {
				const { id, CategoryName, CategoryCode } = ctx.params;
				const updatedCategory = await this.adapter.updateById(id, { $set: { CategoryName: CategoryName, CategoryCode: CategoryCode } });
				if (!updatedCategory) {
					throw new MoleculerClientError("user not found", 404);
				}

				return updatedCategory;
			}

		},
		
		update: false,
		get: false,
	}
};
