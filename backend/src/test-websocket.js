// Simple WebSocket test script
const { io } = require('socket.io-client');

// Create a socket connection
const socket = io('http://localhost:3001', {
  auth: {
    token: 'your-jwt-token-here' // Replace with actual JWT token
  },
  transports: ['websocket']
});

socket.on('connect', () => {
  console.log('✅ Connected to WebSocket server');
  console.log('Socket ID:', socket.id);
  
  // Test ping
  socket.emit('ping');
  
  // Test joining a room
  socket.emit('join:room', { room: 'general' });
  
  // Test presence update
  socket.emit('presence:update', { status: 'online' });
});

socket.on('connection:success', (data) => {
  console.log('🎉 Connection success:', data);
});

socket.on('pong', (data) => {
  console.log('🏓 Pong received:', data);
});

socket.on('room:joined', (data) => {
  console.log('🏠 Room joined:', data);
});

socket.on('presence:updated', (data) => {
  console.log('👤 Presence updated:', data);
});

socket.on('notification:event', (data) => {
  console.log('🔔 Notification received:', data);
});

socket.on('error', (error) => {
  console.error('❌ Socket error:', error);
});

socket.on('disconnect', (reason) => {
  console.log('🔌 Disconnected:', reason);
});

// Keep the connection alive for testing
setTimeout(() => {
  console.log('📊 Testing complete, closing connection...');
  socket.disconnect();
  process.exit(0);
}, 10000); // Run for 10 seconds