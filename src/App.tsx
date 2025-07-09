import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './components/ui/card'
import { Button } from './components/ui/button'
import { Badge } from './components/ui/badge'
import { Copy, Calendar, Check } from 'lucide-react'
import toast from 'react-hot-toast'

function App() {
  const [dailyKey, setDailyKey] = useState('')
  const [nextKeyTime, setNextKeyTime] = useState('')
  const [copied, setCopied] = useState(false)

  // Generate a deterministic key based on the current date
  const generateDailyKey = (date: Date) => {
    const dateString = date.toISOString().split('T')[0] // YYYY-MM-DD format
    const seed = dateString.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
    let random = seed
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
    let key = ''
    for (let i = 0; i < 16; i++) {
      random = (random * 9301 + 49297) % 233280
      key += chars[Math.floor((random / 233280) * chars.length)]
    }
    return key.match(/.{4}/g)?.join('-') || key // Format as XXXX-XXXX-XXXX-XXXX
  }

  // Calculate time until next key
  const getNextKeyTime = () => {
    const now = new Date()
    const tomorrow = new Date(now)
    tomorrow.setDate(tomorrow.getDate() + 1)
    tomorrow.setHours(0, 0, 0, 0)
    const diff = tomorrow.getTime() - now.getTime()
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
    const seconds = Math.floor((diff % (1000 * 60)) / 1000)
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
  }

  useEffect(() => {
    const today = new Date()
    const key = generateDailyKey(today)
    setDailyKey(key)
    const interval = setInterval(() => {
      setNextKeyTime(getNextKeyTime())
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(dailyKey)
      setCopied(true)
      toast.success('Key copied to clipboard!')
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast.error('Failed to copy key')
    }
  }

  const today = new Date().toLocaleDateString('en-US', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric'
  })

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,_#a855f7_1px,_transparent_0)] bg-[size:20px_20px]"></div>
      </div>
      <div className="relative z-10 w-full max-w-xl mx-auto flex flex-col gap-8 px-4">
        {/* Main Key Card */}
        <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-sm">
          <CardHeader className="text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Calendar className="w-5 h-5 text-purple-400" />
              <Badge variant="outline" className="border-purple-500/50 text-purple-300">
                {today}
              </Badge>
            </div>
            <CardTitle className="text-2xl text-white">Today's Key</CardTitle>
            <CardDescription className="text-slate-400">
              Valid for the next {nextKeyTime}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-slate-900/50 rounded-xl p-6 border border-slate-700/30">
              <div className="font-mono text-3xl text-center text-white tracking-wider break-all">
                {dailyKey || 'Loading...'}
              </div>
            </div>
            <div className="flex justify-center">
              <Button 
                onClick={copyToClipboard}
                className="bg-purple-600 hover:bg-purple-700 text-white font-semibold px-8 py-3 rounded-lg transition-all duration-200 flex items-center gap-2"
                disabled={!dailyKey}
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    Copy Key
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
        {/* Key Status Card */}
        <Card className="bg-slate-800/30 border-slate-700/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              Key Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Generated</span>
                <span className="text-green-400">Today at 00:00 UTC</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Expires</span>
                <span className="text-yellow-400">Tomorrow at 00:00 UTC</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Next Refresh</span>
                <span className="text-blue-400">{nextKeyTime}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default App
