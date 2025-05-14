import React from 'react';
import { Link } from 'react-router-dom';

interface EvermarkCardProps {
  id: string;
  title: string;
  description?: string;
  imageUrl?: string;
}

export const EvermarkCard: React.FC<EvermarkCardProps> = ({ 
  id, 
  title, 
  description, 
  imageUrl 
}) => {
  return (
    <Link 
      to={`/evermark/${id}`}
      style={{ textDecoration: 'none', color: 'inherit' }}
    >
      <div style={{
        backgroundImage: 'url("/textures/index-card.png")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        borderRadius: '6px',
        padding: '15px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        marginBottom: '15px',
        transition: 'transform 0.2s, box-shadow 0.2s',
        cursor: 'pointer',
        height: '100%',
        display: 'flex',
        flexDirection: 'column'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-3px)';
        e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.15)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
      }}
      >
        {imageUrl && (
          <div style={{
            marginBottom: '10px',
            borderRadius: '4px',
            overflow: 'hidden',
            height: '160px'
          }}>
            <img 
              src={imageUrl} 
              alt={title}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover'
              }}
            />
          </div>
        )}
        
        <h3 style={{
          margin: '0 0 8px 0',
          fontSize: '18px',
          fontWeight: '600'
        }}>
          {title}
        </h3>
        
        {description && (
          <p style={{
            margin: '0',
            fontSize: '14px',
            color: '#555',
            flex: '1'
          }}>
            {description.length > 100 
              ? `${description.substring(0, 100)}...` 
              : description}
          </p>
        )}
      </div>
    </Link>
  );
};