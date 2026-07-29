import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class NotificationsGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  handleConnection(client: Socket) {
    console.log(`Socket Connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`Socket Disconnected: ${client.id}`);
  }

  @SubscribeMessage('join')
  joinRoom(@MessageBody() userId: string, @ConnectedSocket() client: Socket) {
    client.join(userId);

    console.log(`${client.id} joined room ${userId}`);
  }

  notifyUser(userId: string, event: string, data: any) {
    this.server.to(userId).emit(event, data);
  }
  broadcast(event: string, data: any) {
    console.log('📡 Broadcasting:', event, data.id);

    console.log('Connected sockets:', this.server.sockets.sockets.size);

    this.server.emit(event, data);
  }
}
