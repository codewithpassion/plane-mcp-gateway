export class PlaneError extends Error {
	constructor(message: string) {
		super(message);
		this.name = "PlaneError";
	}
}

export class HttpError extends PlaneError {
	status: number;
	payload: unknown;
	constructor(message: string, status: number, payload: unknown) {
		super(message);
		this.name = "HttpError";
		this.status = status;
		this.payload = payload;
	}
}

export class ConfigurationError extends PlaneError {
	constructor(message: string) {
		super(message);
		this.name = "ConfigurationError";
	}
}
