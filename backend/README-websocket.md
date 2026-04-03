# Socket.io WebSocket Implementation

This document describes the Socket.io real-time WebSocket implementation added to the Life-OS backend.

## Features Implemented

### 1. Core WebSocket Gateway (`src/common/gateways/app.gateway.ts`)
- **JWT Authentication**: Secure WebSocket connections with JWT token validation
- **User Presence Tracking**: Real-time online/offline/away/busy status tracking
- **Room Management**: Users can join/leave rooms for targeted messaging
- **Connection Management**: Automatic cleanup of stale connections
- **Event Broadcasting**: Support for user-specific, room-based, and global broadcasts

### 2. Event Types (`src/common/gateways/events.interface.ts`)
Comprehensive TypeScript interfaces for all real-time events:
- **NotificationEvent**: Real-time notifications
- **PresenceEvent**: User presence updates
- **ConnectionEvent**: Connection status events
- **RoomEvent**: Room join/leave events
- **ActivityEvent**: User activity streams
- **SystemEvent**: System-wide announcements
- **DataSyncEvent**: Real-time data synchronization
- **HealthEvent**: Health/fitness goal notifications
- **FinanceEvent**: Budget and transaction alerts
- **TravelEvent**: Travel booking and itinerary updates
- **AIEvent**: AI task completion notifications

### 3. Presence Service (`src/common/gateways/presence.service.ts`)
Advanced user presence and activity tracking:
- **Real-time Status**: Online, away, busy, offline tracking
- **Multi-device Support**: Track activity across web, mobile, desktop
- **Activity Sessions**: Monitor user session duration and activity
- **Idle Detection**: Automatic status updates based on inactivity
- **Connection Analytics**: Track user connections and engagement

### 4. Integrated Notifications
Updated existing notifications gateway to use Socket.io:
- **Real-time Delivery**: Instant notification delivery via WebSocket
- **Dual Channel**: Socket.io + Fluxez for reliability
- **Event Broadcasting**: Notify users of read status, deletions, preferences

## WebSocket Connection

### Client Connection
```javascript
import { io } from 'socket.io-client';

const socket = io('ws://localhost:3001', {
  auth: {
    token: 'your-jwt-token'
  }
});
```

### Authentication
- JWT token required in `auth.token` or `Authorization` header
- Automatic user identification and room assignment
- Secure connection validation

## Available Events

### Client → Server Events

#### Connection Management
- `ping` - Heartbeat check
- `join:room` - Join a specific room
- `leave:room` - Leave a room
- `presence:update` - Update user status

#### Example Usage
```javascript
// Update presence status
socket.emit('presence:update', { status: 'away' });

// Join a room
socket.emit('join:room', { room: 'project:123' });
```

### Server → Client Events

#### Connection Events
- `connection:success` - Successful connection
- `pong` - Response to ping
- `room:joined` - Successfully joined room
- `room:left` - Successfully left room

#### Real-time Updates
- `notification:event` - New notifications
- `presence:updated` - User presence changes
- `presence:user_online` - User came online
- `presence:user_offline` - User went offline
- `data:created/updated/deleted` - Real-time data sync

## Room Types

The system supports various room types for targeted messaging:

- `user:{userId}` - Personal user room
- `user:{userId}:notifications` - User-specific notifications
- `conversation:{id}` - Chat conversations
- `project:{id}` - Project-specific updates
- `group:{id}` - Group rooms
- `authenticated` - All authenticated users
- `system` - System-wide announcements

## Presence Tracking

### Status Types
- `online` - User is actively using the application
- `away` - User is idle (automatically set after 10 minutes)
- `busy` - User has manually set busy status
- `offline` - User is disconnected

### Device Tracking
The system tracks user activity across:
- Web browsers
- Mobile applications
- Desktop applications

### Activity Analysis
- Session duration tracking
- Last activity timestamps
- Multi-device connection monitoring
- Idle time detection

## Integration Examples

### React Frontend Integration
```javascript
import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';

function useWebSocket(token) {
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const newSocket = io(process.env.REACT_APP_WS_URL, {
      auth: { token }
    });

    newSocket.on('connect', () => setConnected(true));
    newSocket.on('disconnect', () => setConnected(false));
    
    newSocket.on('notification:event', (data) => {
      // Handle real-time notifications
      console.log('New notification:', data);
    });

    setSocket(newSocket);

    return () => newSocket.close();
  }, [token]);

  return { socket, connected };
}
```

### Vue.js Integration
```javascript
import { ref, onMounted, onUnmounted } from 'vue';
import { io } from 'socket.io-client';

export function useWebSocket(token) {
  const socket = ref(null);
  const connected = ref(false);

  onMounted(() => {
    socket.value = io(process.env.VUE_APP_WS_URL, {
      auth: { token }
    });

    socket.value.on('connect', () => {
      connected.value = true;
    });

    socket.value.on('notification:event', (data) => {
      // Handle notifications
    });
  });

  onUnmounted(() => {
    if (socket.value) {
      socket.value.disconnect();
    }
  });

  return { socket, connected };
}
```

## Environment Configuration

Add these environment variables:

```env
# CORS origins for WebSocket connections
CORS_ORIGIN=http://localhost:3000,https://yourdomain.com

# JWT configuration
JWT_SECRET=your-jwt-secret
JWT_EXPIRES_IN=1d
```

## Testing

### Manual Testing
1. Start the server: `npm run start:dev`
2. Install socket.io-client: `npm install socket.io-client`
3. Run the test script: `node src/test-websocket.js` (update JWT token first)

### Integration Testing
The WebSocket gateway integrates with all existing modules:
- **Notifications**: Real-time notification delivery
- **Health**: Goal achievements and reminders
- **Finance**: Budget alerts and transaction notifications
- **Travel**: Booking confirmations and itinerary updates
- **AI**: Task completion and suggestion notifications

## Security Considerations

- **JWT Authentication**: All connections require valid JWT tokens
- **Room Authorization**: Users can only join authorized rooms
- **Input Validation**: All incoming events are validated
- **Rate Limiting**: Built-in Socket.io rate limiting
- **CORS Protection**: Configurable CORS origins

## Performance Features

- **Connection Pooling**: Efficient connection management
- **Event Batching**: Optimized event delivery
- **Presence Cleanup**: Automatic cleanup of stale presence data
- **Memory Management**: Efficient socket and user tracking

## Monitoring and Analytics

The system provides comprehensive metrics:
- Total online users
- Users by status (online/away/busy)
- Users by device type
- Average session duration
- Connection statistics

Access via the `PresenceService`:
```javascript
const stats = presenceService.getPresenceStats();
console.log('Online users:', stats.totalOnline);
```

## Troubleshooting

### Common Issues

1. **Connection Refused**
   - Check server is running on correct port
   - Verify CORS_ORIGIN environment variable

2. **Authentication Failed**
   - Ensure JWT token is valid and not expired
   - Check JWT_SECRET environment variable

3. **Events Not Received**
   - Verify user is in correct room
   - Check event names and payload structure

### Debug Mode
Enable debug logging:
```javascript
const socket = io(url, {
  auth: { token },
  debug: true
});
```

## API Documentation

WebSocket events are documented in the Swagger API docs at `/api-docs` when the server is running. The real-time events complement the REST API endpoints.

## Future Enhancements

- **Message Persistence**: Store missed messages for offline users
- **Push Notifications**: Integration with mobile push notification services
- **Chat System**: Real-time messaging between users
- **File Sharing**: Real-time file upload/download notifications
- **Video/Audio Calling**: WebRTC integration for voice/video calls
- **Screen Sharing**: Real-time collaboration features