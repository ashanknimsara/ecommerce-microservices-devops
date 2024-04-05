const { MoleculerClientError } = require("moleculer").Errors;
const bcrypt = require("bcryptjs");
const DbService = require("../mixins/db.mixin");

module.exports = {
    name: "users",
    mixins: [DbService("users")],
    collection: "users",
    version: 1,

    settings: {
        cache: false,
        routes: [{
            authentication: true
        }]

    },
    actions: {
        signup: {
            rest: "POST /signup",
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
    }



};