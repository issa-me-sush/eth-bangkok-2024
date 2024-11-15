import { useState, useEffect } from 'react'
import Head from 'next/head'

interface Segment {
  text: string
  speaker: string
  speaker_id: number
  is_user: boolean
  person_id: null
  start: number
  end: number
}

interface WebhookData {
  segments: Segment[]
  session_id: string
  timestamp: number
}

export default function Home() {
  const [messages, setMessages] = useState<WebhookData[]>([])
  const [lastUpdate, setLastUpdate] = useState<number>(0)
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  // Poll for new messages every second
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        console.log('🔄 Fetching messages...')
        const response = await fetch('/api/webhook', {
          cache: 'no-store'
        })
        const data = await response.json()
        console.log('📥 Received data:', data)
        
        if (Array.isArray(data) && data.length > 0) {
          setMessages(data)
          setLastUpdate(Date.now())
        }
      } catch (error) {
        console.error('❌ Error fetching messages:', error)
      }
    }

    // Only start polling after component is mounted
    if (isMounted) {
      fetchMessages()
      const interval = setInterval(fetchMessages, 1000)
      return () => clearInterval(interval)
    }
  }, [isMounted])

  // Debug info
  useEffect(() => {
    console.log('🔍 Messages updated:', messages)
  }, [messages])

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Head>
        <title>OMI Real-time Transcript</title>
      </Head>

      <main className="container mx-auto p-6">
        <div className="flex items-center justify-between mb-8 bg-gray-800 p-4 rounded-lg">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
            Live Transcript
          </h1>
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full animate-pulse ${
              isMounted && lastUpdate ? 'bg-green-500' : 'bg-yellow-500'
            }`} />
            <span className="text-sm text-gray-400">
              {isMounted ? (
                lastUpdate ? 
                  `Last update: ${new Date(lastUpdate).toLocaleTimeString()}` : 
                  'Waiting for updates...'
              ) : (
                'Connecting...'
              )}
            </span>
          </div>
        </div>
        
        <div className="max-w-3xl mx-auto space-y-4">
          {messages.map((msg, idx) => (
            <div key={`${msg.timestamp}-${idx}`} className="animate-fade-in">
              {msg.segments.filter(seg => seg.text.trim()).map((segment, segIdx) => (
                <div key={`${segment.start}-${segIdx}`} className="mb-4">
                  <div className="flex items-start space-x-2">
                    <div className={`
                      bg-blue-500 w-8 h-8 rounded-full 
                      flex items-center justify-center
                      text-white font-medium text-sm
                    `}>
                      {segment.speaker_id}
                    </div>
                    <div className="flex-1">
                      <div className="p-3 rounded-lg bg-gray-800 border border-gray-700">
                        <p className="text-gray-100">{segment.text}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ))}

          {messages.length === 0 && (
            <div className="text-center py-20 text-gray-500">
              <div className="text-6xl mb-4">🎤</div>
              <p>Waiting for speech input...</p>
            </div>
          )}
        </div>

        {/* Debug info */}
        {isMounted && (
          <div className="fixed bottom-4 right-4 bg-gray-800 p-2 rounded text-xs">
            Messages: {messages.length}<br />
            Last Update: {lastUpdate ? new Date(lastUpdate).toLocaleTimeString() : 'Never'}
          </div>
        )}
      </main>
    </div>
  )
}