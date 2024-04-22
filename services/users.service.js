const { MoleculerClientError } = require("moleculer").Errors;
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const DbService = require("../mixins/db.mixin");
const constants = require("../constants");

module.exports = {
	name: "users",
	mixins: [DbService("users")],
	collection: "users",
	version: 1,

	settings: {
		TOKEN_SECRET: process.env.TOKEN_SECRET,
		REFRESH_TOKEN_SECRET: process.env.REFRESH_TOKEN_SECRET,
		TOKEN_EXPIRE_TIME: process.env.TOKEN_EXPIRE_TIME,
		REFRESH_TOKEN_EXPIRE_TIME: process.env.REFRESH_TOKEN_EXPIRE_TIME,
	},
	actions: {
		signup: {
			rest: "POST /signup",
			permission: [constants.ROLE_EVERYONE],
			params: {
				email: "email",
				password: "string",
				firstName: "string",
				lastName: "string",
			},
			async handler(ctx) {
				const { email, firstName, lastName } = ctx.params;
				const existingUser = await this.adapter.findOne({ email });
				if (existingUser) {
					throw new MoleculerClientError("Email is exist!", 422, "", [{ field: "email", message: "is exist" }]);
				}
				const createdOn = new Date();
				const password = bcrypt.hashSync(ctx.params.password, 10);
				const verificationCode = this.generateOTP();
				const otpGeneratedAt = new Date();

				try {
					const insertedUser = await this.adapter.insert({ email, firstName, lastName, password, isVerified: false, verificationCode, role: "user", createdOn, otpGeneratedAt, enabled: true });
					return { userId: insertedUser._id.toString(), firstName, email };
				} catch (err) {
					return (err);
				}
			}

		},
		login: {
			rest: "POST /login",
			permission: [constants.ROLE_EVERYONE],
			params: {
				email: "string",
				password: "string"
			},
			async handler(ctx) {
				const { email, password } = ctx.params;
				const existingUser = await this.adapter.findOne({ email } );
				this.logger.info(ctx.requestID, ":", existingUser);
				if (!existingUser) {
					throw new MoleculerClientError("Invalid credentials", 404, "", [{ message: "Invalid credentials" }]);
				}
				// this.logger.info(ctx.requestID, ":", existingUser.password);
				const passwordMatch = await bcrypt.compare(password, existingUser.password.toString());
				// this.logger.info(ctx.requestID, ":", passwordMatch);
				if (!passwordMatch) {
					throw new MoleculerClientError("Invalid credentials", 401, "", [{ message: "Invalid credentials" }]);
				}
				const token = this.generateToken(existingUser.id);
				const refreshToken = this.generateRefreshToken(existingUser.id);

				return { token, refreshToken };

			}
		},
		resolveToken: {
			params: {
				token: "string",
			},
			async handler(ctx) {
				const { TOKEN_SECRET } = this.settings;
				const { token } = ctx.params;
				try {
					const decodedToken = jwt.verify(token, TOKEN_SECRET);
					const userId = decodedToken.userId;
					const user = await this.adapter.findOne({ userId });
					this.logger.debug("user",user);
					return user;
				} catch (error) {
					throw new MoleculerClientError("Invalid token", 401);
				}
			},
		},
		create:false,
		list:false,
		remove:false,
		update:false,
		get:false,
	}, methods: {
		generateOTP() {
			// Generate a random 6-digit number
			const min = 100000;
			const max = 999999;
			return Math.floor(Math.random() * (max - min + 1)) + min;
		},
		generateToken(userId) {
			const { TOKEN_SECRET, TOKEN_EXPIRE_TIME } = this.settings;
			const token = jwt.sign({ userId }, TOKEN_SECRET, { expiresIn: TOKEN_EXPIRE_TIME });
			return token;
		},
		generateRefreshToken(userId) {
			const { REFRESH_TOKEN_SECRET, REFRESH_TOKEN_EXPIRE_TIME } = this.settings;
			const refreshToken = jwt.sign({ userId }, REFRESH_TOKEN_SECRET, { expiresIn: REFRESH_TOKEN_EXPIRE_TIME });
			return refreshToken;
		},
	}



};