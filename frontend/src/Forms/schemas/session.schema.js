import * as Yup from "yup";
export const sessionAudioUploadSchema = Yup.object({
  patientId: Yup.number()
    .typeError("Patient is required")
    .positive("Select a valid patient")
    .required("Patient is required"),

  file: Yup.mixed()
    .required("Audio file is required")
    .test("is-audio", "File must be an audio file", (file) => {
      if (!file) return false;
      return file.type?.startsWith("audio/");
    })
    .test("max-size", "File is too large", (file) => {
      if (!file) return false;
      const MAX = 200 * 1024 * 1024;
      return file.size <= MAX;
    }),
});

export function toSessionAudioFormData({ patientId, file }) {
  const fd = new FormData();
  fd.append("patient", String(patientId));
  fd.append("audio_file", file);
  return fd;
}


export function mapSessionAudioUploadErrors(fe = {}) {
  const map = {
    patient: "patientId",
    audio_file: "file",
  };

  const out = {};
  Object.entries(fe).forEach(([k, v]) => {
    out[map[k] || k] = v;
  });
  return out;
}
