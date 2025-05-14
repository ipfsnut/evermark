import React from 'react';

interface FormContainerProps {
  children: React.ReactNode;
  title?: string;
}

export const FormContainer: React.FC<FormContainerProps> = ({ children, title }) => {
  return (
    <div style={{
      backgroundImage: 'url("/textures/notebook-paper.jpg")',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      borderRadius: '8px',
      padding: '25px',
      boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
      width: '100%',
      maxWidth: '600px',
      margin: '0 auto',
      position: 'relative'
    }}>
      {/* Content overlay for better text visibility */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(255,255,255,0.7)',
        borderRadius: '8px',
        zIndex: 0
      }} />
      
      {title && (
        <h2 style={{
          position: 'relative',
          zIndex: 1,
          fontSize: '24px',
          marginBottom: '20px',
          textAlign: 'center',
          borderBottom: '1px solid #aaa',
          paddingBottom: '10px'
        }}>
          {title}
        </h2>
      )}
      
      <div style={{ position: 'relative', zIndex: 1 }}>
        {children}
      </div>
    </div>
  );
};