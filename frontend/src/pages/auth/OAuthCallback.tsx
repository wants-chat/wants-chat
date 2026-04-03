import { useEffect, useRef } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Loader2, Shield, Sparkles, Key, Lock } from 'lucide-react'
import { api } from '../../lib/api'
import { toast } from 'sonner'
import * as organizationApi from '../../services/organizationApi'

const floatingIcons = [
  { Icon: Key, color: 'text-yellow-400', delay: 0, x: '15%', y: '25%' },
  { Icon: Shield, color: 'text-blue-400', delay: 0.5, x: '75%', y: '20%' },
  { Icon: Lock, color: 'text-teal-400', delay: 1, x: '20%', y: '70%' },
  { Icon: Sparkles, color: 'text-rose-400', delay: 1.5, x: '80%', y: '75%' },
]

const BackgroundAnimation = () => (
  <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-teal-900 to-slate-900">
    <motion.div
      className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-teal-500/30 rounded-full blur-[120px]"
      animate={{
        x: [0, 50, 0],
        y: [0, 30, 0],
        scale: [1, 1.2, 1],
      }}
      transition={{
        duration: 8,
        repeat: Infinity,
        ease: "easeInOut"
      }}
    />
    <motion.div
      className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-blue-500/30 rounded-full blur-[120px]"
      animate={{
        x: [0, -40, 0],
        y: [0, -40, 0],
        scale: [1, 1.3, 1],
      }}
      transition={{
        duration: 10,
        repeat: Infinity,
        ease: "easeInOut"
      }}
    />

    {floatingIcons.map(({ Icon, color, delay, x, y }, index) => (
      <motion.div
        key={index}
        className={`absolute ${color} opacity-20`}
        style={{ left: x, top: y }}
        initial={{ opacity: 0, scale: 0 }}
        animate={{
          opacity: [0.1, 0.3, 0.1],
          scale: [1, 1.2, 1],
          y: [0, -20, 0],
        }}
        transition={{
          duration: 4,
          delay,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      >
        <Icon className="w-12 h-12" />
      </motion.div>
    ))}

    <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:50px_50px]" />
  </div>
)

export default function OAuthCallback() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const hasProcessed = useRef(false)

  useEffect(() => {
    const handleCallback = async () => {
      // Prevent duplicate calls (React Strict Mode causes double render)
      if (hasProcessed.current) {
        return
      }
      hasProcessed.current = true

      // Backend redirects here with tokens in URL params
      const accessToken = searchParams.get('access_token')
      const refreshToken = searchParams.get('refresh_token')
      const error = searchParams.get('error')

      if (error) {
        console.error('OAuth error:', error)
        navigate('/login?error=' + encodeURIComponent(error))
        return
      }

      if (!accessToken) {
        console.error('No access token received from OAuth callback')
        navigate('/login?error=' + encodeURIComponent('Authentication failed'))
        return
      }

      console.log('✅ OAuth tokens received, storing...')

      try {
        // Store tokens directly - backend callback has already handled authentication
        const token = accessToken

        console.log('✅ Storing access token...')
        localStorage.setItem('accessToken', token)
        if (refreshToken) {
          localStorage.setItem('refreshToken', refreshToken)
        }

        // Small delay to ensure localStorage is persisted
        await new Promise(resolve => setTimeout(resolve, 100))

        // Dispatch custom event to notify AuthContext
        console.log('📢 Dispatching auth-token-stored event')
        window.dispatchEvent(new CustomEvent('auth-token-stored'))

        // Wait for AuthContext to fetch user profile and update state
        // GitHub OAuth is faster than Google, needs more time for auth state to settle
        // Poll for auth state to be ready (max 3 seconds)
        console.log('⏳ Waiting for auth state to update...')
        let attempts = 0
        const maxAttempts = 30 // 3 seconds (30 * 100ms)
        const minAttempts = 10 // Minimum 1 second wait (was 500ms, now 1000ms for fast providers like GitHub)

        while (attempts < maxAttempts) {
          await new Promise(resolve => setTimeout(resolve, 100))

          // Check if token is still in localStorage (sanity check)
          const storedToken = localStorage.getItem('accessToken')
          if (storedToken === token) {
            attempts++

            // After minAttempts (1000ms), assume auth is ready
            // This gives time for the async profile fetch
            // Increased from 500ms to 1000ms to handle fast OAuth providers like GitHub
            if (attempts >= minAttempts) {
              console.log(`✅ Auth state should be ready after ${attempts * 100}ms`)
              break
            }
          } else {
            console.warn('⚠️ Token mismatch in localStorage')
            break
          }
        }

        // Check for pending invitation after successful OAuth
        const pendingInviteToken = localStorage.getItem('pendingInviteToken')
        if (pendingInviteToken) {
          console.log('📧 Found pending invitation, attempting to accept...')
          try {
            const result = await organizationApi.acceptInvitation(pendingInviteToken)
            // Clear the pending token
            localStorage.removeItem('pendingInviteToken')

            toast.success(
              `Welcome to ${result.organization_name || 'the team'}!`,
              { description: `You've joined as ${result.role || 'member'}` }
            )

            // Redirect to the organization page
            if (result.organization_id) {
              console.log('✅ Invitation accepted, navigating to organization')
              navigate(`/organizations/${result.organization_id}`, { replace: true })
              return
            }
          } catch (inviteErr: any) {
            console.warn('Failed to accept invitation after OAuth:', inviteErr)
            // Clear invalid token
            localStorage.removeItem('pendingInviteToken')

            // Show warning but continue
            if (inviteErr.message?.toLowerCase().includes('email') ||
                inviteErr.message?.toLowerCase().includes('mismatch')) {
              toast.error('Email mismatch', {
                description: 'The invitation was sent to a different email address'
              })
            } else {
              toast.warning('Could not accept invitation', {
                description: inviteErr.message || 'The invitation may have expired'
              })
            }
          }
        }

        // Navigate to chat after successful OAuth
        console.log('✅ Auth complete, navigating to chat')
        navigate('/chat', { replace: true })
      } catch (error) {
        console.error('❌ Token exchange failed:', error)
        navigate('/login?error=' + encodeURIComponent('Authentication failed'))
      }
    }

    handleCallback()
  }, [searchParams, navigate])

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      <BackgroundAnimation />

      <motion.div
        className="w-full max-w-md px-4 relative z-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2">
            <img src="/assets/logo.png" alt="Wants" className="h-10 w-10" />
            <span className="text-2xl font-bold text-white">Wants</span>
          </Link>
        </div>

        <motion.div
          className="bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20 shadow-2xl overflow-hidden"
          initial={{ scale: 0.95 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          <div className="p-8 text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", duration: 0.5, delay: 0.3 }}
              className="w-20 h-20 bg-teal-500/20 rounded-full flex items-center justify-center mx-auto mb-6 border border-teal-500/30"
            >
              <Loader2 className="h-10 w-10 text-teal-400 animate-spin" />
            </motion.div>

            <h2 className="text-2xl font-bold text-white mb-2">Completing Sign In...</h2>
            <p className="text-white/60">
              Please wait while we finish setting up your account
            </p>
          </div>
        </motion.div>

        <motion.div
          className="mt-6 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <div className="inline-flex items-center gap-2 text-white/40 text-sm">
            <Shield className="h-4 w-4" />
            <span>Your security is our priority</span>
          </div>
        </motion.div>
      </motion.div>
    </div>
  )
}
