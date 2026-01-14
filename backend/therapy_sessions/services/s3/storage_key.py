def session_audio_key(session, original_name: str):
    ext = ""
    # keep original extension if found
    if "." in (original_name or ""):
        ext = "." + original_name.rsplit(".", 1)[1].lower()
    if not ext:
        ext = ".webm"  # fallback to .webm if no extension found

    return f"recordings/patient_{session.patient_id}/session_{session.id}/audio{ext}"