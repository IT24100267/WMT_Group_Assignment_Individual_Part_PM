import Constants from 'expo-constants';

const getApiUrl = () => {
  const debuggerHost = Constants.expoConfig?.hostUri;
  const ip = debuggerHost ? debuggerHost.split(':')[0] : 'localhost';
  return `http://${ip}:5005/api/products`;
};

const API_URL = getApiUrl();

export const getProducts = async () => {
  const response = await fetch(API_URL);
  const data = await response.json();
  return data;
};

export const getProductById = async (id) => {
  const response = await fetch(`${API_URL}/${id}`);
  const data = await response.json();
  return data;
};

export const createProduct = async (product) => {
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(product),
  });
  const data = await response.json();
  return data;
};

export const updateProduct = async (id, product) => {
  const response = await fetch(`${API_URL}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(product),
  });
  const data = await response.json();
  return data;
};

export const deleteProduct = async (id) => {
  const response = await fetch(`${API_URL}/${id}`, {
    method: 'DELETE',
  });
  const data = await response.json();
  return data;
};

export const uploadImage = async (uri) => {
  const formData = new FormData();
  const filename = uri.split('/').pop();
  const match = /\.(\w+)$/.exec(filename);
  const type = match ? `image/${match[1]}` : `image`;

  formData.append('image', { uri, name: filename, type });

  const response = await fetch(`${API_URL}/upload`, {
    method: 'POST',
    body: formData,
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  if (!response.ok) {
    throw new Error('Upload failed');
  }

  return await response.json();
};