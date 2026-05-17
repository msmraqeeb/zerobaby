import ImageKit from "imagekit";

export default function handler(req, res) {
  try {
    const imagekit = new ImageKit({
      publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
      privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
      urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT
    });

    const authenticationParameters = imagekit.getAuthenticationParameters();
    
    res.status(200).json(authenticationParameters);
  } catch (error) {
    res.status(500).json({ error: "ImageKit Auth Failed", details: error.message });
  }
}