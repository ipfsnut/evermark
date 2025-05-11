import { Handler, HandlerResponse } from '@netlify/functions';
import PinataClient from '@pinata/sdk';
import multiparty from 'multiparty';

const handler: Handler = async (event): Promise<HandlerResponse> => {
  // Set CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  // Handle preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const pinata = new PinataClient(
      process.env.VITE_PINATA_API_KEY,
      process.env.VITE_PINATA_SECRET_KEY
    );

    // Check if it's JSON data or file upload
    const contentType = event.headers['content-type'] || '';
    
    if (contentType.includes('application/json')) {
      // Handle JSON upload
      const { type, data, name } = JSON.parse(event.body || '{}');
      
      if (type !== 'json') {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: 'Invalid upload type' })
        };
      }
      
      // Properly type the options object
      const options = name ? {
        pinataMetadata: { name },
      } : {};
      
      const result = await pinata.pinJSONToIPFS(data, options);
      
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ hash: result.IpfsHash })
      };
    } else if (contentType.includes('multipart/form-data')) {
      // Handle file upload
      return new Promise<HandlerResponse>((resolve, reject) => {
        const form = new multiparty.Form();
        
        form.parse(event, async (err, fields, files) => {
          if (err) {
            resolve({
              statusCode: 400,
              headers,
              body: JSON.stringify({ error: 'Failed to parse form' })
            });
            return;
          }
          
          const file = files.file[0];
          const fileName = fields.name ? fields.name[0] : undefined;
          
          try {
            // Properly type the options object
            const options = fileName ? {
              pinataMetadata: { name: fileName },
            } : {};
            
            const readableStream = require('fs').createReadStream(file.path);
            const result = await pinata.pinFileToIPFS(readableStream, options);
            
            resolve({
              statusCode: 200,
              headers,
              body: JSON.stringify({ hash: result.IpfsHash })
            });
          } catch (error) {
            console.error('File upload error:', error);
            resolve({
              statusCode: 500,
              headers,
              body: JSON.stringify({ error: 'Failed to upload file' })
            });
          }
        });
      });
    } else {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Invalid content type' })
      };
    }
  } catch (error) {
    console.error('IPFS upload error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Internal server error' })
    };
  }
};

export { handler };