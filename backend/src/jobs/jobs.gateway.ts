import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  cors: { origin: '*' },
  namespace: '/jobs',
})
export class JobsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  handleConnection(client: Socket) {
    const jobId = client.handshake.query.jobId as string;
    if (jobId) {
      client.join(`job:${jobId}`);
    }
  }

  handleDisconnect(client: Socket) {
    // auto-leave rooms on disconnect
  }

  emitJobUpdate(jobId: string, payload: any) {
    this.server.to(`job:${jobId}`).emit('job-update', payload);
  }
}
