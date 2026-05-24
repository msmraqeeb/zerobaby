import ImageKit from 'imagekit';

try {
  const imagekit = new ImageKit({
    publicKey: 'test',
    privateKey: 'test',
    urlEndpoint: 'test'
  });
  console.log('ImageKit constructor succeeded! Instance created successfully.');
  console.log('Default export keys:', Object.keys(ImageKit || {}));
  console.log('Type of default export:', typeof ImageKit);
} catch (error) {
  console.error('ImageKit constructor failed with error:', error);
}
