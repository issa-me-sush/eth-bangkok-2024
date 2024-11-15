export {}

declare global {
  var lastWebhook: {
    uid: string
    memory: {
      segments: Array<{
        text: string
        speaker: string
        speaker_id: number
        is_user: boolean
        person_id: null
        start: number
        end: number
      }>
      session_id: string
    }
    timestamp: string
  } | null
}