module.exports = {
	success: (message = "Operation completed successfully", data = null) => {
		const response = {
			name: "Success",
			message: message,
			code: 200
		};

		if (data !== null) {
			response.data = data;
		}

		return response;
	},
	error: (message = "An error occurred",) => {
		return {
			name: "Error",
			message: message,
			code: 500
		};
	}
};