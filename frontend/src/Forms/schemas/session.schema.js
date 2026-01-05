import * as Yup from "yup";
const AUDIO_EXTS = ["mp3", "wav", "m4a", "aac", "ogg", "webm", "flac"];

export const sessionAudioUploadSchema = Yup.object({
  patientId: Yup.number()
    .typeError("Patient is required")
    .positive("Select a valid patient")
    .required("Patient is required"),

  file: Yup.mixed()
    .required("Audio file is required")
    .test("is-audio", "File must be an audio file", (file) => {
      if (!file) return false;

      // 1) MIME check (works when browser provides it)
      const mime = (file.type || "").toLowerCase();
      if (mime.startsWith("audio/")) return true;

      // Some browsers label audio/webm as video/webm
      if (mime === "video/webm") return true;

      // 2) Fallback: extension check (works when MIME is missing)
      const name = (file.name || "").toLowerCase();
      const ext = name.split(".").pop();
      return AUDIO_EXTS.includes(ext);
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
