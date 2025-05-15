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
      className="block text-inherit no-underline"
    >
      <div className="card h-full flex flex-col">
        {/* Corner fold decoration */}
        <div className="card-corner-fold"></div>
        
        {imageUrl && (
          <div className="mb-2.5 rounded overflow-hidden h-40">
            <img 
              src={imageUrl} 
              alt={title}
              className="w-full h-full object-cover"
            />
          </div>
        )}
        
        <h3 className="text-responsive-card-title mb-2">
          {title}
        </h3>
        
        {description && (
          <p className="m-0 text-sm flex-1 line-clamp-3">
            {description}
          </p>
        )}
      </div>
    </Link>
  );
};
