import { useState, useEffect } from 'react';
import Head from 'next/head';
import BottomNav from '../components/BottomNav';
import { CircleArrowRight, Menu } from 'lucide-react';
import { createLightNode, createEncoder, createDecoder, waitForRemotePeer } from '@waku/sdk';
import { Protocols } from '@waku/sdk';
import protobuf from 'protobufjs';

// Define the message structure using protobuf
const ChatMessage = new protobuf.Type('ChatMessage')
  .add(new protobuf.Field('timestamp', 1, 'uint64'))
  .add(new protobuf.Field('text', 2, 'string'))
  .add(new protobuf.Field('sender', 3, 'string'))
  .add(new protobuf.Field('isUser', 4, 'bool'));

const contentTopic = '/friendcircle/1/chat/proto';

export default function Chat() {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [wakuNode, setWakuNode] = useState(null);
  const [isConnecting, setIsConnecting] = useState(true);

  // Initialize Waku node
  useEffect(() => {
    const initWaku = async () => {
      try {
        // Create and start a Light Node
        const node = await createLightNode({
            defaultBootstrap: true,
            networkConfig: {
              clusterId: 1,
              contentTopics: [contentTopic],
            },
          });
        await node.start();
        await waitForRemotePeer(node, [Protocols.Store, Protocols.Filter, Protocols.LightPush]);
        
        setWakuNode(node);
        setIsConnecting(false);

        // Set up message decoder
        const decoder = createDecoder(contentTopic);
        
        // Subscribe to messages
        const subscription = await node.filter.subscribe([decoder], (message) => {
          const messageObj = ChatMessage.decode(message.payload);
          setMessages(prev => [...prev, {
            id: messageObj.timestamp.toString(),
            text: messageObj.text,
            sender: messageObj.sender,
            isUser: messageObj.isUser,
            avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${messageObj.sender}`
          }]);
        });

        // Cleanup
        return () => {
          subscription.unsubscribe();
          node.stop();
        };
      } catch (error) {
        console.error('Failed to initialize Waku:', error);
        setIsConnecting(false);
      }
    };

    initWaku();
  }, []);

  const handleSend = async () => {
    if (!message.trim() || !wakuNode) return;

    try {
      const encoder = createEncoder({ contentTopic });
      
      // Create message payload
      const protoMessage = ChatMessage.create({
        timestamp: Date.now(),
        text: message.trim(),
        sender: 'You',
        isUser: true
      });

      // Encode and send message
      const payload = ChatMessage.encode(protoMessage).finish();
      await wakuNode.lightPush.send(encoder, { payload });

      setMessage('');
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  if (isConnecting) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="animate-pulse">Connecting to Waku network...</div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col">
      <Head>
        <title>FriendCircle</title>
      </Head>
      
      <div className='flex justify-between p-5 items-center border-b border-gray-800'>
        <div className='flex items-center'>
          <img className='w-10 h-10' src='frencircle-dark.png' alt="logo" />
          <h1 className='md:text-4xl text-2xl font-bold opacity-50'>/football</h1>
        </div>
        <div>
          <Menu />
        </div>
      </div>

      <div className='flex-1 overflow-y-auto p-4 pb-32 space-y-4'>
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.isUser ? 'justify-end' : 'justify-start'}`}>
            <div className={`flex ${msg.isUser ? 'flex-row-reverse' : 'flex-row'} items-end gap-2 max-w-[80%]`}>
              <img 
                src={msg.avatar} 
                alt={msg.sender} 
                className="w-8 h-8 rounded-full"
              />
              <div className={`px-4 py-2 rounded-2xl ${
                msg.isUser 
                  ? 'bg-white text-black rounded-br-none' 
                  : 'bg-white bg-opacity-15 text-white rounded-bl-none'
              }`}>
                <p>{msg.text}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="fixed bottom-16 left-0 right-0 p-4 bg-[#0a0a0a] border-t border-gray-800">
        <div className="flex gap-2 max-w-screen-xl mx-auto">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 bg-white bg-opacity-15 text-white rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-white/20"
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
          />
          <button
            onClick={handleSend}
            className="bg-white text-black rounded-full p-2 w-10 h-10 flex items-center justify-center hover:bg-gray-200 transition-colors"
          >
            <CircleArrowRight />
          </button>
        </div>
      </div>
      
      <BottomNav />
    </div>
  );
}