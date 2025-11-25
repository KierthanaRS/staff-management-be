export class ApiCode {
  readonly code: number;
  readonly message: string;

  private constructor(code: number, message: string) {
    this.code = code;
    this.message = message;
  }

  static readonly SUCCESS = new ApiCode(2000, "Operation completed successfully");
  static readonly CREATED = new ApiCode(2001, "Resource created successfully");
  static readonly UPDATED = new ApiCode(2002, "Resource updated successfully");
  static readonly DELETED = new ApiCode(2003, "Resource deleted successfully");
  static readonly FETCHED = new ApiCode(2004, "Resource fetched successfully");

  static readonly VALIDATION_ERROR = new ApiCode(4000, "Invalid request body or parameters");
  static readonly INVALID_PARAMS = new ApiCode(4001, "Invalid request parameters");
  static readonly NOT_FOUND = new ApiCode(4040, "Requested resource not found");
  static readonly CONFLICT = new ApiCode(4090, "Resource conflict occurred");

  static readonly INTERNAL_ERROR = new ApiCode(5000, "Internal server error occurred");
}