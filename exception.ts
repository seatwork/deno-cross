import { HttpStatus } from "./constant.ts";

/**
 * 自定义异常
 * 增加 HTTP 状态码
 */
export class Exception extends Error {

    status: number;

    public constructor(message: string, status?: number) {
        super(message);
        this.status = !status || status < 400 || status > 511
            ? HttpStatus.INTERNAL_SERVER_ERROR : status;
    }

}