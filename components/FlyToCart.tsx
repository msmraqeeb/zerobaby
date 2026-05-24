import React, { useEffect } from 'react';
import gsap from 'gsap';

const FlyToCart: React.FC = () => {
  useEffect(() => {
    const handleFlyToCart = (e: CustomEvent) => {
      const { startRect, imageUrl } = e.detail;
      
      // Find visible cart icon
      const cartIcons = document.querySelectorAll('.header-cart-icon');
      let targetIcon: Element | null = null;
      cartIcons.forEach(icon => {
        const rect = icon.getBoundingClientRect();
        if (rect.width > 0 && rect.height > 0) {
          targetIcon = icon;
        }
      });

      if (!targetIcon) return;
      const endRect = (targetIcon as Element).getBoundingClientRect();

      // Create fly image element
      const flyImage = document.createElement('img');
      flyImage.src = imageUrl;
      flyImage.style.position = 'fixed';
      flyImage.style.top = `${startRect.top}px`;
      flyImage.style.left = `${startRect.left}px`;
      flyImage.style.width = `${startRect.width}px`;
      flyImage.style.height = `${startRect.height}px`;
      flyImage.style.objectFit = 'cover';
      flyImage.style.borderRadius = '50%';
      flyImage.style.zIndex = '999999';
      flyImage.style.pointerEvents = 'none';
      flyImage.style.boxShadow = '0 10px 25px rgba(233,44,93,0.5)';
      
      document.body.appendChild(flyImage);

      // Animate fly image
      gsap.to(flyImage, {
        top: endRect.top + endRect.height / 2 - 10,
        left: endRect.left + endRect.width / 2 - 10,
        width: 20,
        height: 20,
        opacity: 0.5,
        duration: 0.8,
        ease: "power2.inOut",
        onComplete: () => {
          flyImage.remove();
          
          // Bounce the cart icon
          gsap.fromTo(targetIcon, 
            { scale: 1 }, 
            { scale: 1.3, duration: 0.15, yoyo: true, repeat: 1, ease: "power1.inOut" }
          );
        }
      });
    };

    window.addEventListener('fly-to-cart' as any, handleFlyToCart);
    return () => window.removeEventListener('fly-to-cart' as any, handleFlyToCart);
  }, []);

  return null;
};

export default FlyToCart;
