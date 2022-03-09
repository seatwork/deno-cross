import { HttpStatus } from "./constant.ts";

/**
 * Custom exception
 * Add HTTP status code
 */
export class Exception extends Error {

    status: number;

    public constructor(message: string, status?: number) {
        super(message);
        this.status = !status || status < 400 || status > 511
            ? HttpStatus.INTERNAL_SERVER_ERROR : status;
    }

}