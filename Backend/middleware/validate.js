const validationOptions = {
  abortEarly: false,
  allowUnknown: false,
  convert: true,
  stripUnknown: true,
};

// Validate a payload against a Joi schema and return the raw result.
const runValidation = (schema, payload) => schema.validate(payload, validationOptions);

// Convert Joi messages into a clean array that is easy to show in the UI.
const toReadableErrors = (error) =>
  error.details.map((detail) => detail.message.replace(/"/g, ""));

// Send a standard validation error response.
const sendValidationError = (res, error) =>
  res.status(400).json({
    message: "Validation failed",
    errors: toReadableErrors(error),
  });

// Build an Express middleware that validates either req.body or req.params.
const createValidator = (sourceKey) => (schema) => (req, res, next) => {
  const { error, value } = runValidation(schema, req[sourceKey]);

  if (error) {
    return sendValidationError(res, error);
  }

  req[sourceKey] = value;
  return next();
};

const validateBody = createValidator("body");
const validateParams = createValidator("params");

module.exports = { validateBody, validateParams };
