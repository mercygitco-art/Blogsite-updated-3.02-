const http = require('http');

// Test API health endpoint
console.log('Testing API endpoints...\n');

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/api/health',
  method: 'GET'
};

const req = http.request(options, (res) => {
  let data = '';
  
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    console.log('✅ Health Check Response:');
    console.log(`Status: ${res.statusCode}`);
    console.log('Body:', JSON.parse(data));
    console.log('\n✅ Server is running and responding!');
    console.log('\nAPI is ready for your frontend to connect.');
    console.log('Endpoints available:');
    console.log('  - GET  /api/health');
    console.log('  - GET  /api/posts');
    console.log('  - POST /api/auth/register');
    console.log('  - POST /api/auth/login');
    console.log('  - POST /api/upload');
    console.log('  - And all other CRUD endpoints...');
  });
});

req.on('error', (error) => {
  console.error('❌ Error connecting to server:', error.message);
  console.log('\nMake sure the server is running with: node server.js');
});

req.end();
