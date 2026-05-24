import ImageKit from "imagekit";

export default function handler(req, res) {
  try {
    const publicKey = process.env.IMAGEKIT_PUBLIC_KEY || process.env.VITE_IMAGEKIT_PUBLIC_KEY;
    const privateKey = process.env.IMAGEKIT_PRIVATE_KEY || process.env.VITE_IMAGEKIT_PRIVATE_KEY;
    const urlEndpoint = process.env.IMAGEKIT_URL_ENDPOINT || process.env.VITE_IMAGEKIT_URL_ENDPOINT;

    if (!publicKey || !privateKey || !urlEndpoint) {
      const missing = [];
      if (!publicKey) missing.push("IMAGEKIT_PUBLIC_KEY (or VITE_IMAGEKIT_PUBLIC_KEY)");
      if (!privateKey) missing.push("IMAGEKIT_PRIVATE_KEY (or VITE_IMAGEKIT_PRIVATE_KEY)");
      if (!urlEndpoint) missing.push("IMAGEKIT_URL_ENDPOINT (or VITE_IMAGEKIT_URL_ENDPOINT)");
      throw new Error(`Missing environment variable(s) on Vercel: ${missing.join(", ")}. Please add them to your Vercel settings and redeploy.`);
    }

    const imagekit = new ImageKit({
      publicKey,
      privateKey,
      urlEndpoint
    });

    const authenticationParameters = imagekit.getAuthenticationParameters();
    
    res.status(200).json({
      ...authenticationParameters,
      publicKey,
      urlEndpoint
    });
  } catch (error) {
    console.error("ImageKit Auth Error:", error.message);
    res.status(500).json({ error: "ImageKit Auth Failed", details: error.message });
  }
}