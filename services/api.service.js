"use strict";

"use strict";
const ApiGateway = require("moleculer-web");
const _ = require("lodash");
const constants = require("../constants");

const { UnAuthorizedError } = ApiGateway.Errors;

module.exports = {
	name: "api",
	mixins: [ApiGateway],

	settings: {
		port: process.env.PORT || 3000,
		ip: "0.0.0.0",
		use: [],
		routes: [
			{
				path: "/api",
				whitelist: ["**"],
				use: [],
				mergeParams: true,
				authentication: false,
				authorization: false,
				autoAliases: true,
				aliases: {},
				callOptions: {},
				bodyParsers: {
					json: {
						strict: false,
						limit: "1MB"
					},
					urlencoded: {
						extended: true,
						limit: "1MB"
					}
				},
				mappingPolicy: "all",
				logging: true
			}
		],
		log4XXResponses: false,
		logRequestParams: null,
		logResponseData: null,
		assets: {
			folder: "public",
			options: {}
		}
	},

	methods: {


		authorize(ctx, route, req) {

			let token;

			if(req.parsedUrl.indexOf("/~node/") > -1){
				return Promise.resolve("");
			}

			if (req.headers.authorization) {
				let type = req.headers.authorization.split(" ")[0];
				if (type === "Token" || type === "Bearer") token = req.headers.authorization.split(" ")[1];
			}
			// const resolvedToken = await this.Promise.resolve(token);
			const requiredRole = req.$endpoint.action.permission || [];
			if ( requiredRole.includes(constants.ROLE_EVERYONE)){
				return Promise.resolve("");
			}
			// if (resolvedToken) {
			return ctx.call("v1.users.resolveToken", { token: token }).then((users) => {
				if (users) {
					this.logger.info("Authenticated via JWT: ", users.userId);
					ctx.meta.users = _.pick(users, ["userId", "role" ]);
					ctx.meta.token = token;

					const requiredRoles = req.$endpoint.action.permission;

					const userRoles = Array.isArray(users.role) ? users.role : [users.role];
					console.log("userRoles:", userRoles, "requiredRoles:", requiredRoles);

					const hasRole = requiredRoles.some(role => userRoles.includes(role));
					console.log(hasRole);

					if (hasRole || requiredRoles.includes(constants.ROLE_AUTHENTICATED)) {
						//console.log("users :", users);
						return this.Promise.resolve(users);

					} else {
						console.log("Insufficient Permission...");
						return this.Promise.reject(new UnAuthorizedError("Insufficient permissions"));
					}
				} else {
					console.log("Invalid Token...");
					return this.Promise.reject(new UnAuthorizedError("Invalid Token"));
				}
			});


		}




	},
};
