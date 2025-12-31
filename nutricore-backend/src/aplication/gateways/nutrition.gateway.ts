import { WebSocketGateway, WebSocketServer, OnGatewayConnection } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { OnModuleInit } from '@nestjs/common';

import { GeminiAdapter } from 'src/infrastructure/adapters/ai/gemini.adapter'; 

@WebSocketGateway({ cors: { origin: '*' } })
export class NutritionGateway implements OnGatewayConnection, OnModuleInit {
  @WebSocketServer() server: Server;


  constructor(private readonly geminiAdapter: GeminiAdapter) {}

  onModuleInit() {
    this.setupProactiveTimer();
  }

  private setupProactiveTimer() {
    setInterval(async () => {
      const rooms = Array.from(this.server.sockets.adapter.rooms.keys());
      const userRooms = rooms.filter(room => room.startsWith('user_'));

      for (const room of userRooms) {
        const userId = room.replace('user_', '');
       
        const aiResponse = await this.geminiAdapter.generateSmartAdvice("general_status");
        
        this.sendProactiveAdvice(userId, {
         
          message: aiResponse.reasoning 
        });
      }
    }, 30000); 
  }

  handleConnection(client: Socket) {
    const userId = client.handshake.query.userId;
    if (userId) {
      client.join(`user_${userId}`);
    }
  }

  sendProactiveAdvice(userId: string, advice: any) {
    this.server.to(`user_${userId}`).emit('PROACTIVE_ADVICE', advice);
  }
}