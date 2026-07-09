/**
 * validate ==> middleware factory
 *
 * Make sure that the schema matches the expected shape of the request body exactly, and that
 * the controller only uses the fields that are actually needed
 */
const validate = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.body);

  if (!result.success) {
    return res.status(400).json({
      message: "Validation failed",
      errors: result.error.issues.map((issue) => ({
        field: issue.path.join(".") || "unknown",
        message: issue.message,
      })),
    });
  }

  // Replace req.body with the sanitized data before passing to the controller
  req.body = result.data;
  next();
};

module.exports = validate;
