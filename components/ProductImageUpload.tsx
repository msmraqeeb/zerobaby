import React, { useState, useEffect } from 'react';
import { IKContext, IKUpload } from 'imagekitio-react';
import { supabase } from '../lib/supabase'; // আপনার Supabase ক্লায়েন্ট

const ProductImageUpload = () => {
  const [uploading, setUploading] = useState(false);
  const [ikConfig, setIkConfig] = useState<{ publicKey: string; urlEndpoint: string } | null>(null);

  useEffect(() => {
    fetch('/api/imagekit-auth')
      .then(res => res.json())
      .then(data => {
        setIkConfig({
          publicKey: data.publicKey || import.meta.env.VITE_IMAGEKIT_PUBLIC_KEY as string,
          urlEndpoint: data.urlEndpoint || import.meta.env.VITE_IMAGEKIT_URL_ENDPOINT as string
        });
      })
      .catch(err => console.error("Failed to load ImageKit config:", err));
  }, []);

  // Antigravity API থেকে সিকিউরিটি টোকেন আনার ফাংশন
  const authenticator = async () => {
    try {
      const response = await fetch('/api/imagekit-auth');
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Request failed with status ${response.status}: ${errorText}`);
      }
      const data = await response.json();
      const { signature, expire, token } = data;
      return { signature, expire, token };
    } catch (error: any) { // এখানে : any যুক্ত করা হয়েছে
      throw new Error(`Authentication request failed: ${error.message}`);
    }
  };

  // আপলোড সফল হলে যা হবে
  const onSuccess = async (res: any) => { // এখানে : any যুক্ত করা হয়েছে
    setUploading(false);
    const imageUrl = res.url; 
    
    // লিংকটি Supabase ডাটাবেসে সেভ করা
    const { data, error } = await supabase
      .from('products')
      .insert([
        { 
          product_name: 'New T-Shirt', 
          image_url: imageUrl 
        }
      ]);

    if (error) {
      console.error("Supabase Save Error:", error);
    } else {
      alert("Image uploaded and saved to Supabase successfully!");
    }
  };

  const onError = (err: any) => { // এখানে : any যুক্ত করা হয়েছে
    setUploading(false);
    console.error("Upload Error:", err);
    alert("Image upload failed!");
  };

  const onUploadStart = () => {
    setUploading(true);
  };

  if (!ikConfig) {
    return <div className="p-4"><p className="text-gray-400 text-sm font-bold animate-pulse">Loading ImageKit configuration...</p></div>;
  }

  return (
    <div>
      <h2>Upload Product Image</h2>
      <IKContext 
        publicKey={ikConfig.publicKey as any} 
        urlEndpoint={ikConfig.urlEndpoint as any} 
        authenticator={authenticator}
      >
        <IKUpload
          fileName="product-image.jpg"
          tags={["ecommerce", "product"]}
          useUniqueFileName={true}
          onUploadStart={onUploadStart}
          onError={onError}
          onSuccess={onSuccess}
          accept="image/*"
        />
      </IKContext>
      {uploading && <p>Uploading to ImageKit...</p>}
    </div>
  );
};

export default ProductImageUpload;