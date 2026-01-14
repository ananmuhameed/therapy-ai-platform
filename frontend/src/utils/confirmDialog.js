import Swal from "sweetalert2";

export async function confirmDialog({
  title = "Are you sure?",
  text = "This action cannot be undone.",
  confirmText = "Yes",
  cancelText = "Cancel",
  icon = "warning",
  confirmColor = "#d33",
  cancelColor = "#cbd5e1",
} = {}) {
  return Swal.fire({
    title,
    text,
    icon,
    iconColor: "#2563eb",
    width: "400px",
    padding: "1.5rem",
    showCancelButton: true,
    confirmButtonColor: confirmColor,
    cancelButtonColor: cancelColor,
    confirmButtonText: confirmText,
    cancelButtonText: cancelText,
    reverseButtons: false,
    customClass: {
      popup: "rounded-2xl",
      confirmButton: "rounded-xl",
      cancelButton: "rounded-xl",
    },
  });
}