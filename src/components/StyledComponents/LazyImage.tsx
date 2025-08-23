import React, { useState, useRef, useEffect, memo } from 'react';
import styled from '@emotion/styled';

const ImageContainer = styled.div`
  width: 100%;
  height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f0f0f0;
  margin-bottom: 10px;
  overflow: hidden;
`;

const StyledImage = styled.img`
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  transition: opacity 0.3s ease;
`;

const LoadingPlaceholder = styled.div`
  width: 60px;
  height: 60px;
  border: 3px solid #e0e0e0;
  border-top: 3px solid #3498db;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const ErrorPlaceholder = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  color: #666;
  font-size: 12px;
  padding: 20px;
  text-align: center;
`;

interface LazyImageProps {
  imgUrl: string;
  alt?: string;
}

const LazyImage: React.FC<LazyImageProps> = memo(({ imgUrl, alt = "Game image" }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isError, setIsError] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry && entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const handleLoad = () => {
    setIsLoaded(true);
    setIsError(false);
  };

  const handleError = () => {
    setIsError(true);
    setIsLoaded(false);
  };

  return (
    <ImageContainer ref={containerRef}>
      {!isInView ? (
        <LoadingPlaceholder />
      ) : isError ? (
        <ErrorPlaceholder>
          Image unavailable
        </ErrorPlaceholder>
      ) : (
        <>
          {!isLoaded && <LoadingPlaceholder />}
          <StyledImage
            ref={imgRef}
            src={imgUrl}
            alt={alt}
            onLoad={handleLoad}
            onError={handleError}
            style={{ opacity: isLoaded ? 1 : 0 }}
            loading="lazy"
          />
        </>
      )}
    </ImageContainer>
  );
});

LazyImage.displayName = 'LazyImage';

export default LazyImage;
