export const uploadToImageKit = async (file: File, folder: string = '/general'): Promise<string> => {
  try {
    const authRes = await fetch('/api/imagekit-auth');
    if (!authRes.ok) {
      throw new Error('Failed to authenticate with ImageKit');
    }
    const authData = await authRes.json();
    
    const formData = new FormData();
    formData.append('file', file);
    formData.append('publicKey', authData.publicKey || import.meta.env.VITE_IMAGEKIT_PUBLIC_KEY as string);
    formData.append('signature', authData.signature);
    formData.append('expire', authData.expire.toString());
    formData.append('token', authData.token);
    formData.append('fileName', file.name);
    formData.append('folder', folder);
    
    const uploadRes = await fetch('https://upload.imagekit.io/api/v1/files/upload', {
      method: 'POST',
      body: formData,
    });
    
    if (!uploadRes.ok) {
      const errorData = await uploadRes.json();
      throw new Error(errorData.message || 'ImageKit upload failed');
    }
    
    const data = await uploadRes.json();
    return data.url;
  } catch (error: any) {
    console.error('ImageKit Upload Error:', error);
    throw new Error(error.message || 'An error occurred during upload');
  }
};
