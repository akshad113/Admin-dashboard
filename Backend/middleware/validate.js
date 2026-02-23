const Joi = require("joi");

const defaultOptions = {
  abortEarly: false,
  allowUnknown: false,
  stripUnknown: true,
  convert: true,
};

const validatePart = (schema, value, options) => {
  if (!schema) {
    return { value, error: null };
  }
  return schema.validate(value, options);
};

const validate = (schemaMap = {}) => (req, res, next) => {
  const options = { ...defaultOptions };
  const errors = [];

  const bodyResult = validatePart(schemaMap.body, req.body, options);
  if (bodyResult.error) {
    errors.push(...bodyResult.error.details.map((d) => d.message));
  } else if (schemaMap.body) {
    req.body = bodyResult.value;
  }

  const paramsResult = validatePart(schemaMap.params, req.params, options);
  if (paramsResult.error) {
    errors.push(...paramsResult.error.details.map((d) => d.message));
  } else if (schemaMap.params) {
    req.params = paramsResult.value;
  }

  const queryResult = validatePart(schemaMap.query, req.query, options);
  if (queryResult.error) {
    errors.push(...queryResult.error.details.map((d) => d.message));
  } else if (schemaMap.query) {
    req.query = queryResult.value;
  }

  if (errors.length > 0) {
    return res.status(400).json({
      error: errors[0].replace(/"/g, ""),
      details: errors.map((message) => message.replace(/"/g, "")),
    });
  }

  return next();
};

validate.Joi = Joi;

module.exports = validate;
