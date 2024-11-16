import { useState } from 'react';
import Head from 'next/head';
import BottomNav from '../components/BottomNav';
import { CircleArrowRight, Menu, SendHorizonal } from 'lucide-react';

export default function Home() {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Hey, welcome to the football community!",
      sender: "John",
      isUser: false,
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=John"
    },
    {
      id: 2,
      text: "Thanks! Excited to be here",
      sender: "You",
      isUser: true,
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=You"
    }
  ]);

  const handleSend = () => {
    if (message.trim()) {
      setMessages([...messages, {
        id: messages.length + 1,
        text: message,
        sender: "You",
        isUser: true,
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=You"
      }]);
      setMessage('');
    }
  };

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