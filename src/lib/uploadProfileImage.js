async function uploadImage(file, kind) {
  if (!file) {
    throw new Error('No file selected');
  }

  const formData = new FormData();
  formData.append('file', file);
  formData.append('kind', kind);

  const response = await fetch('/api/upload', {
    method: 'POST',
    body: formData,
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const detail = data.detail ?? 'Image upload failed';
    throw new Error(typeof detail === 'string' ? detail : 'Image upload failed');
  }

  return data.secure_url;
}

export async function uploadProfileImage(file, folder = 'profile') {
  return uploadImage(file, folder === 'signup' ? 'signup-profile' : 'profile');
}

export async function uploadCoverImage(file) {
  return uploadImage(file, 'cover');
}

export async function uploadPortfolioImage(file) {
  return uploadImage(file, 'portfolio');
}
