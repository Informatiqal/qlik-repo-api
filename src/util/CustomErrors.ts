import { ZodIssue } from "zod";

export class ArgValidationError extends Error {
  method: string;
  type: string;
  cause: ZodIssue[];
  constructor(method: string, cause: ZodIssue[]) {
    super();
    this.type = "Argument validation";
    this.method = method;
    this.cause = cause;
  }
}
