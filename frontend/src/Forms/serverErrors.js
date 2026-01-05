export function parseServerErrors(err) {
  const data = err?.response?.data || err?.data || err || {};

  const fieldErrors = {};
  let nonFieldError =
    (Array.isArray(data?.non_field_errors) ? data.non_field_errors[0] : data?.non_field_errors) ||
    data?.detail ||
    data?.message;

  if (data && typeof data === "object" && !Array.isArray(data)) {
    Object.entries(data).forEach(([key, val]) => {
      if (key === "detail" || key === "non_field_errors" || key === "message") return;
      if (Array.isArray(val)) fieldErrors[key] = String(val[0]);
      else if (typeof val === "string") fieldErrors[key] = val;
    });
  }

  if (typeof data === "string") nonFieldError = data;

  return { fieldErrors, nonFieldError };
}
