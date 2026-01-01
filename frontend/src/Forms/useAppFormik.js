import { useEffect, useRef } from "react";
import { useFormik } from "formik";
import { parseServerErrors } from "./serverErrors";

export function useAppFormik({
  initialValues,
  validationSchema,
  onSubmit,
  enableReinitialize = true,
  mapFieldErrors,
  validateOnBlur = true,
  validateOnChange = true,
}) {
  const lastSavedRef = useRef(initialValues);
  useEffect(() => {
    lastSavedRef.current = initialValues;
  }, [initialValues]);

  const formik = useFormik({
    initialValues,
    enableReinitialize,
    validationSchema,
    validateOnBlur,
    validateOnChange,
    onSubmit: async (values, helpers) => {
      helpers.setStatus(undefined);

      try {
        const res = await onSubmit(values, helpers);
        lastSavedRef.current = values;
        helpers.setStatus(undefined);
        helpers.resetForm({ values });
        return res;
      } catch (error) {
        const { fieldErrors, nonFieldError } = parseServerErrors(error);

        const mapped = mapFieldErrors
          ? mapFieldErrors(fieldErrors)
          : fieldErrors;
        if (mapped && Object.keys(mapped).length) helpers.setErrors(mapped);

        helpers.setStatus(
          nonFieldError ? { apiError: nonFieldError } : undefined
        );

        helpers.setSubmitting(false);
        throw error;
      }
    },
  });

  const apiError = formik.status?.apiError;

  const resetToLastSaved = () => {
    formik.resetForm({ values: lastSavedRef.current });
  };

  return { formik, apiError, resetToLastSaved, lastSavedRef };
}
