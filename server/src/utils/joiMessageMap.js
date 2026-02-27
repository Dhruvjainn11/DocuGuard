const joiMessageMap = (detail) => {
  const field = detail.path.join(".");

   if (detail.type === "object.missing") {
    return "At least one field must be provided for update";
  }

  switch (detail.type) {
    case "any.required":
      return `${capitalize(field)} is required`;

    case "string.empty":
      return `${capitalize(field)} cannot be empty`;

    case "string.min":
      return `${capitalize(field)} is too short`;

    case "string.max":
      return `${capitalize(field)} is too long`;

    case "string.email":
      return `Please enter a valid email address`;

    case "boolean.base":
      return `${capitalize(field)} must be true or false`;

    case "number.base":
      return `${capitalize(field)} must be a number`;

    case "number.integer":
      return `${capitalize(field)} must be an integer`;

    case "string.pattern.base":
      return `${capitalize(field)} has invalid format`;

    case "object.oxor":
      return `Only one of the fields ${detail.context.peers.join(
        ", "
      )} can be provided`;

    case "object.with":
      return `${capitalize(detail.context.main)} requires ${capitalize(detail.context.peer)} to be provided`;

    default:
      return `${capitalize(field)} is invalid`;
  }
};

const capitalize = (str) =>
  str.charAt(0).toUpperCase() + str.slice(1);

module.exports = joiMessageMap;
