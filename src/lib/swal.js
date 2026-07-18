import Swal from 'sweetalert2';

const customSwal = Swal.mixin({
  customClass: {
    popup: 'rounded-4 shadow-lg border p-4 border-light-subtle',
    title: 'fw-bold text-dark fs-5 mb-2',
    htmlContainer: 'text-secondary small mb-4',
    confirmButton: 'btn btn-danger px-4 py-2 mx-1.5 fw-bold shadow-none rounded-3',
    cancelButton: 'btn btn-light border px-4 py-2 mx-1.5 fw-bold text-secondary shadow-none rounded-3',
    denyButton: 'btn btn-primary px-4 py-2 mx-1.5 fw-bold shadow-none rounded-3'
  },
  buttonsStyling: false
});

export const confirmDelete = async (message) => {
  const result = await customSwal.fire({
    title: 'Emin misiniz?',
    text: message || 'Bu işlemi geri alamayacaksınız!',
    icon: 'warning',
    iconColor: '#ef4444',
    showCancelButton: true,
    confirmButtonText: 'Evet, Sil',
    cancelButtonText: 'İptal',
    reverseButtons: true,
  });
  return result.isConfirmed;
};

export const showAlert = (title, message, icon = 'info') => {
  const iconColor = icon === 'success' ? '#10b981' : icon === 'error' ? '#ef4444' : '#3b82f6';
  const confirmBtnClass = icon === 'error' ? 'btn btn-danger' : icon === 'success' ? 'btn btn-success' : 'btn btn-primary';

  return customSwal.fire({
    title: title || 'Bilgi',
    text: message,
    icon: icon,
    iconColor: iconColor,
    confirmButtonText: 'Tamam',
    customClass: {
      popup: 'rounded-4 shadow-lg border p-4 border-light-subtle',
      title: 'fw-bold text-dark fs-5 mb-2',
      htmlContainer: 'text-secondary small mb-4',
      confirmButton: `${confirmBtnClass} px-4 py-2 fw-bold shadow-none rounded-3`
    }
  });
};

export const showSuccess = (message) => {
  return customSwal.fire({
    title: 'Başarılı!',
    text: message,
    icon: 'success',
    iconColor: '#10b981',
    timer: 1800,
    showConfirmButton: false,
  });
};

export default customSwal;
