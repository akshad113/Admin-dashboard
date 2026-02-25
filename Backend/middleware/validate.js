const runValidation = (schema, payload) =>
  schema.validate(payload, {
    abortEarly: false,
    allowUnknown: false,
    stripUnknown: true,
    convert: true,
  });

const toReadableErrors = (error) =>
  error.details.map((detail) => detail.message.replace(/"/g, ""));

const validateBody = (schema) => (req, res, next) => {
  const { error, value } = runValidation(schema, req.body);

  if (error) {
    return res.status(400).json({
      message: "Validation failed",
      errors: toReadableErrors(error),
    });
  }

  req.body = value;
  next();
};

const validateParams = (schema) => (req, res, next) => {
  const { error, value } = runValidation(schema, req.params);

  if (error) {
    return res.status(400).json({
      message: "Validation failed",
      errors: toReadableErrors(error),
    });
  }

  req.params = value;
  next();
};

module.exports = { validateBody, validateParams };
