
import React, { useState, useCallback } from 'react';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';
import { X, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';

interface ImageZoomModalProps {
  imageUrl: string;
  altText: string;
  isOpen: boolean;
  onClose: () => void;
}

// Fullscreen zoom modal for both desktop (scroll wheel) and mobile (pinch)
export const ImageZoomModal: React.FC<ImageZoomModalProps> = ({ imageUrl, altText, isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-[9999] bg-black/90 flex items-center justify-center backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-[10000] w-11 h-11 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white transition-all border border-white/20"
      >
        <X size={22} />
      </button>

      {/* Zoom hint */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[10000] bg-white/10 backdrop-blur-md text-white text-xs font-medium px-4 py-2 rounded-full border border-white/20 pointer-events-none animate-pulse">
        <span className="hidden md:inline">Scroll to zoom • Drag to pan</span>
        <span className="md:hidden">Pinch to zoom • Drag to pan</span>
      </div>

      <TransformWrapper
        initialScale={1}
        minScale={0.5}
        maxScale={5}
        centerOnInit={true}
        wheel={{ step: 0.15 }}
        pinch={{ step: 5 }}
        doubleClick={{ mode: 'toggle', step: 2 }}
      >
        {({ zoomIn, zoomOut, resetTransform }) => (
          <>
            {/* Zoom controls */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-[10000] flex items-center gap-2 bg-white/10 backdrop-blur-md rounded-full px-3 py-2 border border-white/20">
              <button
                onClick={() => zoomOut()}
                className="w-9 h-9 rounded-full hover:bg-white/20 flex items-center justify-center text-white transition-all"
                title="Zoom out"
              >
                <ZoomOut size={18} />
              </button>
              <button
                onClick={() => resetTransform()}
                className="w-9 h-9 rounded-full hover:bg-white/20 flex items-center justify-center text-white transition-all"
                title="Reset"
              >
                <RotateCcw size={16} />
              </button>
              <button
                onClick={() => zoomIn()}
                className="w-9 h-9 rounded-full hover:bg-white/20 flex items-center justify-center text-white transition-all"
                title="Zoom in"
              >
                <ZoomIn size={18} />
              </button>
            </div>

            <TransformComponent
              wrapperStyle={{
                width: '100%',
                height: '100%',
              }}
              contentStyle={{
                width: '100%',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <img
                src={imageUrl}
                alt={altText}
                className="max-w-[90vw] max-h-[85vh] object-contain select-none"
                draggable={false}
              />
            </TransformComponent>
          </>
        )}
      </TransformWrapper>
    </div>
  );
};

// Inline zoom component for ProductDetails gallery (hover zoom on desktop, pinch on mobile)
interface InlineImageZoomProps {
  imageUrl: string;
  altText: string;
  className?: string;
  onOpenModal?: () => void;
}

export const InlineImageZoom: React.FC<InlineImageZoomProps> = ({ imageUrl, altText, className = '', onOpenModal }) => {
  return (
    <TransformWrapper
      initialScale={1}
      minScale={1}
      maxScale={4}
      centerOnInit={true}
      wheel={{ step: 0.12 }}
      pinch={{ step: 5 }}
      doubleClick={{ mode: 'toggle', step: 2 }}
      panning={{ disabled: false }}
    >
      {({ zoomIn, zoomOut, resetTransform, state }) => (
        <div className={`relative w-full h-full ${className}`}>
          {/* Zoom level indicator */}
          {state.scale > 1.05 && (
            <div className="absolute top-3 left-3 z-10 bg-black/60 backdrop-blur-sm text-white text-[10px] font-bold px-2.5 py-1 rounded-full pointer-events-none">
              {Math.round(state.scale * 100)}%
            </div>
          )}

          {/* Reset button when zoomed */}
          {state.scale > 1.05 && (
            <button
              onClick={() => resetTransform()}
              className="absolute top-3 right-3 z-10 w-8 h-8 bg-black/60 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-black/80 transition-all"
              title="Reset zoom"
            >
              <RotateCcw size={14} />
            </button>
          )}

          {/* Expand to fullscreen button */}
          {onOpenModal && state.scale <= 1.05 && (
            <button
              onClick={onOpenModal}
              className="absolute bottom-3 right-3 z-10 w-9 h-9 bg-black/40 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-black/60 transition-all opacity-0 group-hover:opacity-100"
              title="Open fullscreen"
            >
              <ZoomIn size={16} />
            </button>
          )}

          <TransformComponent
            wrapperStyle={{
              width: '100%',
              height: '100%',
            }}
            contentStyle={{
              width: '100%',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: state.scale > 1 ? 'grab' : 'zoom-in',
            }}
          >
            <img
              src={imageUrl}
              alt={altText}
              className="product-gallery-main-image max-h-full max-w-full object-contain transition-all duration-500 select-none"
              draggable={false}
            />
          </TransformComponent>

          {/* Zoom hint on first view */}
          {state.scale <= 1.05 && (
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-10 pointer-events-none">
              <div className="bg-black/40 backdrop-blur-sm text-white text-[10px] font-medium px-3 py-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                <span className="hidden md:inline">Scroll to zoom • Double-click to expand</span>
                <span className="md:hidden">Pinch to zoom • Double-tap to expand</span>
              </div>
            </div>
          )}
        </div>
      )}
    </TransformWrapper>
  );
};

export default ImageZoomModal;
