const DbService = require("../mixins/db.mixin");
const constants = require("../constants");
const { MoleculerClientError } = require("moleculer").Errors;
const Response = require("../utils/response.util");

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
		create: {
			rest: "POST /addProduct",
			params: {
				productName: "string",
				productCode: "string",
				productCategory: "string",
				productPrice: "string",
			},
			permission: [constants.ROLE_ADMIN],

			async handler(ctx) {
				const { productName, productCode, productCategory, productPrice } = ctx.params;

				try {
					const insertedProduct = await this.adapter.insert({ productName, productCode, productCategory, productPrice });
					return { insertedProduct };
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
		// updateProduct: {
		// 	rest: "PUT update/:id",
		// 	permission: [constants.ROLE_ADMIN],
		// 	params: {
		// 		id: "string",
		// 		productName: "string",
		// 		productCode: "string",
		// 		productCategory: "string",
		// 		productPrice: "string"
		// 	},

		// 	async handler(ctx) {
		// 		const { id, productName, productCode, productCategory, productPrice } = ctx.params;
		// 		const updatedProduct = await this.adapter.updateById(id, { $set: { productName: productName, productCode: productCode, productCategory: productCategory, productPrice: productPrice } });
		// 		if (!updatedProduct) {
		// 			throw new MoleculerClientError("user not found", 404);
		// 		}

		// 		return updatedProduct;
		// 	}

		// },
		update: false,
		get: false,
	}
};
