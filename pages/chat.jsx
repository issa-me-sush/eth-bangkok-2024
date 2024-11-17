import { useState, useEffect } from 'react';
import Head from 'next/head';
import BottomNav from '../components/BottomNav';
import { CircleArrowRight, Menu, ThumbsUp, ThumbsDown } from 'lucide-react';
import { createLightNode, createEncoder, createDecoder, Protocols, waitForRemotePeer, IEncoder } from '@waku/sdk';
import protobuf from 'protobufjs';
import { usePrivy } from '@privy-io/react-auth';
import { useRouter } from 'next/router';

// Define message structure using Protobuf
const ChatMessage = new protobuf.Type('ChatMessage')
  .add(new protobuf.Field('timestamp', 1, 'uint64'))
  .add(new protobuf.Field('text', 2, 'string'))
  .add(new protobuf.Field('sender', 3, 'string'))
  .add(new protobuf.Field('isUser', 4, 'bool'));

export default function Chat() {
  const router = useRouter();
  
  // Add check for router readiness
  if (!router.isReady) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="animate-pulse">Loading...</div>
      </div>
    );
  }

  const { tag } = router.query;
  const contentTopic = `/friendcircle/1/${tag || 'default'}/proto`;
  
  const { user } = usePrivy();

  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [wakuNode, setWakuNode] = useState(null);
  const [isConnecting, setIsConnecting] = useState(true);
  const [votes, setVotes] = useState({});

  useEffect(() => {
    const initWaku = async () => {
      try {
        // Create and start a Light Node with auto sharding
        console.log('Creating node...');
        const node = await createLightNode({
            networkConfig: {clusterId: 1, shards: [0]},
            defaultBootstrap: true,
            pingKeepAlive: 60,
            //bootstrapPeers: bootstrapNodes,
            numPeersToUse: 3,
        })
        console.log('Starting node...');
        await node.start();
        console.log('Waiting for peers...');
        await waitForRemotePeer(node, [Protocols.LightPush,Protocols.Filter, Protocols.Store])
        console.log('Connected to peers');
        console.log(await node.libp2p.peerStore.all())
        setWakuNode(node);
        setIsConnecting(false);

        // Create decoder and subscription
        const decoder = createDecoder(contentTopic);
        
        // Message callback
        const callback = (wakuMessage) => {
          if (!wakuMessage.payload) return;
          
          const messageObj = ChatMessage.decode(wakuMessage.payload);
          setMessages(prev => [...prev, {
            id: messageObj.timestamp.toString(),
            text: messageObj.text,
            sender: messageObj.sender,
            isUser: messageObj.isUser,
            avatar: `https://api.dicebear.com/9.x/bottts-neutral/svg?seed=${user?.wallet?.address}`
          }]);
        };

        // Create subscription
        const { subscription } = await node.filter.createSubscription({ 
          contentTopics: [contentTopic] 
        });

        // Subscribe to messages
        await subscription?.subscribe([decoder], callback);

        // Cleanup
        return () => {
          subscription?.unsubscribe([contentTopic]);
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
      const encoder = createEncoder({ contentTopic, ephemeral: true });
      console.log('Encoder created:', encoder);
      // Create message payload
      const protoMessage = ChatMessage.create({
        timestamp: Date.now(),
        text: message.trim(),
        sender: user?.wallet?.address,
        isUser: true
      });
      console.log('Message created:', protoMessage);
      // Serialize and send message
      const serializedMessage = ChatMessage.encode(protoMessage).finish();
      console.log('Sending message...');
      await wakuNode.lightPush.send(encoder, {
        payload: serializedMessage,
      });

      setMessage('');
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const handleVote = async (messageId, voteType) => {
    // Optimistically update UI
    setVotes(prev => ({
      ...prev,
      [messageId]: {
        ...prev[messageId],
        [voteType]: !prev[messageId]?.[voteType]
      }
    }));

    try {
      // Send to backend
      await fetch('/api/vote', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messageId,
          voteType,
          value: !votes[messageId]?.[voteType]
        })
      });
    } catch (error) {
      console.error('Failed to save vote:', error);
      // Revert on error
      setVotes(prev => ({
        ...prev,
        [messageId]: {
          ...prev[messageId],
          [voteType]: !prev[messageId]?.[voteType]
        }
      }));
    }
  };

  if (isConnecting) {
    return (
      <div className="h-screen flex flex-col space-y-4 items-center justify-center animate-pulse">
        <img className='w-10 h-10 animate-spin' src='frencircle-dark.png' alt="logo" />
        <div className="">Connecting to Waku network...</div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col">
      <Head>
        <title>FriendCircle - {tag}</title>
      </Head>
      
      <div className='flex justify-between p-5 items-center border-b border-gray-800'>
        <div className='flex items-center'>
          <img className='w-10 h-10' src='frencircle-dark.png' alt="logo" />
          <h1 className='md:text-4xl text-2xl font-bold opacity-50'>
            /{tag || 'default'}
          </h1>
        </div>
        <div>
          <Menu />
        </div>
      </div>

      <div className='flex-1 overflow-y-auto p-4 pb-32 space-y-4'>
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.sender == user?.wallet.address ? 'justify-end' : 'justify-start'}`}>
            <div className={`flex ${msg.sender == user?.wallet.address ? 'flex-row-reverse' : 'flex-row'} items-end gap-2 max-w-[80%]`}>
              <img 
                src={msg.avatar} 
                alt={msg.sender} 
                className="w-8 h-8 rounded-full"
              />
              <div className="flex flex-col gap-1">
                <div className={`px-4 py-2 rounded-2xl ${
                  msg.isUser 
                    ? 'bg-white text-black' 
                    : 'bg-white bg-opacity-15 text-white'
                }`}>
                  <p>{msg.text}</p>
                </div>
                
                {!msg.isUser && (
                  <div className="flex gap-2 ml-2">
                    <button 
                      onClick={() => handleVote(msg.id, 'upvote')}
                      className={`p-1 rounded-full transition-colors ${
                        votes[msg.id]?.upvote 
                          ? 'bg-white bg-opacity-15' 
                          : 'hover:bg-white hover:bg-opacity-5'
                      }`}
                    >
                      <ThumbsUp 
                        size={14} 
                        className={votes[msg.id]?.upvote ? 'fill-white' : ''}
                      />
                    </button>
                    <button 
                      onClick={() => handleVote(msg.id, 'downvote')}
                      className={`p-1 rounded-full transition-colors ${
                        votes[msg.id]?.downvote 
                          ? 'bg-white bg-opacity-15' 
                          : 'hover:bg-white hover:bg-opacity-5'
                      }`}
                    >
                      <ThumbsDown 
                        size={14} 
                        className={votes[msg.id]?.downvote ? 'fill-white' : ''}
                      />
                    </button>
                  </div>
                )}
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