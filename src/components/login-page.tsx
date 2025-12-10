import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Eye, EyeOff } from "lucide-react"
import { authAPI, type LoginResponse } from "@/api/auth"

interface LoginPageProps {
  onLogin?: (response: LoginResponse) => void
}

export function LoginPage({ onLogin }: LoginPageProps) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [loading, setLoading] = useState(false)
  const [microsoftLoading, setMicrosoftLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [error, setError] = useState("")

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const response = await authAPI.login(email, password)
      
      if (onLogin) {
        onLogin(response)
      } else {
        // eslint-disable-next-line no-console
        console.log("Login successful", response)
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Login failed. Please check your credentials."
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const handleMicrosoftLogin = async () => {
    try {
      setMicrosoftLoading(true)
      setError("")

      const authUrl = await authAPI.initiateMicrosoftLogin()
      window.location.href = authUrl
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to initiate Microsoft login. Please try again."
      setError(errorMessage)
      setMicrosoftLoading(false)
    }
  }

  const handleGoogleLogin = async () => {
    try {
      setGoogleLoading(true)
      setError("")

      const authUrl = await authAPI.initiateGoogleLogin()
      window.location.href = authUrl
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to initiate Google login. Please try again."
      setError(errorMessage)
      setGoogleLoading(false)
    }
  }

  const handleForgotPassword = () => {
    // Handle forgot password logic
    // eslint-disable-next-line no-console
    console.log("Forgot password clicked")
  }

  return (
    <div className="min-h-screen flex">
      {/* Left hero panel (desktop) */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-primary">
        <div className="relative z-10 flex flex-col justify-between w-full px-12 py-12">
          <div className="flex items-center gap-2">
            <img src="/logo.svg" alt="EZ Medtech Logo" className="w-8 h-8 object-contain rounded-full" />
            <h1 className="text-xl font-semibold">EZMedTech</h1>
          </div>

          <div className="flex-1 flex flex-col justify-center">
            <h2 className="text-4xl mb-6 leading-tight">
              Secure access to your IMS portal
            </h2>
            <p className="text-lg leading-relaxed">
              Sign in to manage clinics, providers, and operations in one unified dashboard.
            </p>
          </div>

          <div className="flex justify-between items-center text-sm">
            <span>© 2025 EZMedTech. All rights reserved.</span>
            <span className="cursor-pointer hover:text-white/90">Privacy Policy</span>
          </div>
        </div>
      </div>

      {/* Right auth card */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-4 sm:p-6 lg:p-8 bg-background min-h-screen lg:min-h-0">
        <div className="w-full max-w-md mx-auto space-y-6 sm:space-y-8 p-6 sm:p-8 rounded-lg neumorphic-pressed">
          {/* Mobile header */}
          <div className="lg:hidden text-center mb-6 sm:mb-8">
            <h1 className="text-xl sm:text-2xl font-semibold text-foreground mb-2">
              IMS Portal
            </h1>
            <p className="text-sm text-muted-foreground">Identity Management System</p>
          </div>

          <div className="space-y-4">
            {/* <div className="text-center">
              <h2 className="text-2xl sm:text-3xl text-foreground font-semibold">
                IMS Login
              </h2>
              <p className="text-sm sm:text-base text-muted-foreground mt-2">
                Identity Management Service
              </p>
            </div> */}

            {/* Error Message */}
            {error && (
              <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handlePasswordLogin} className="space-y-4">
              {/* Email Field */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-foreground">
                  Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="neumorphic-inset border-0 focus:ring-0 shadow-none rounded-lg bg-background focus:border-0 transition-all duration-200"
                  required
                  disabled={loading || microsoftLoading || googleLoading}
                />
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label htmlFor="password" className="text-sm font-medium text-foreground">
                    Password
                  </Label>
                  <Button
                    type="button"
                    variant="link"
                    className="p-0 h-auto text-sm cursor-pointer text-primary"
                    onClick={handleForgotPassword}
                  >
                    Forgot Password?
                  </Button>
                </div>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="pr-10 neumorphic-inset border-0 focus:ring-0 shadow-none rounded-lg bg-background focus:border-0 transition-all duration-200"
                    required
                    disabled={loading || microsoftLoading || googleLoading}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full cursor-pointer"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                  </Button>
                </div>
              </div>

              {/* Remember me */}
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="remember"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-gray-300 cursor-pointer"
                />
                <Label htmlFor="remember" className="text-sm text-muted-foreground cursor-pointer">
                  Remember this device
                </Label>
              </div>

              {/* Sign In with Password Button */}
              <Button
                type="submit"
                disabled={loading || microsoftLoading || googleLoading}
                className="w-full text-sm font-medium neumorphic-pressed text-primary hover:text-primary-foreground rounded-lg shadow-none cursor-pointer transition-all duration-200 px-3 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span>{loading ? "Signing In..." : "Sign In"}</span>
                {!loading && <span className="text-lg ml-2">→</span>}
              </Button>
            </form>

            {/* OR Divider */}
            <div className="flex items-center my-4">
              <div className="flex-1 border-t border-border"></div>
              <span className="px-3 text-xs text-muted-foreground font-medium">OR</span>
              <div className="flex-1 border-t border-border"></div>
            </div>

            {/* OAuth Login Buttons */}
            <div className="flex gap-2 px-0.5 w-full">
              {/* Microsoft Login Button */}
              <div className="flex-1 min-w-0">
                <Button
                  onClick={handleMicrosoftLogin}
                  disabled={loading || microsoftLoading || googleLoading}
                //   variant="outline"
                  className="w-full text-sm font-medium neumorphic-pressed text-primary hover:text-primary-foreground rounded-lg shadow-none cursor-pointer transition-all duration-200 px-3 py-2 disabled:opacity-50 disabled:cursor-not-allowed"                >
                  {microsoftLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-foreground"></div>
                      <span>Connecting...</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" viewBox="0 0 23 23" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <rect width="11" height="11" fill="#F25022"/>
                        <rect x="12" width="11" height="11" fill="#7FBA00"/>
                        <rect y="12" width="11" height="11" fill="#00A4EF"/>
                        <rect x="12" y="12" width="11" height="11" fill="#FFB900"/>
                      </svg>
                      <span className="hidden sm:inline">Sign In with Microsoft</span>
                      <span className="sm:hidden">Microsoft</span>
                    </>
                  )}
                </Button>
              </div>
              {/* Google Login Button */}
              <div className="flex-1 min-w-0">
                <Button
                  onClick={handleGoogleLogin}
                  disabled={loading || microsoftLoading || googleLoading}
                  className="w-full text-sm font-medium neumorphic-pressed text-primary hover:text-primary-foreground rounded-lg shadow-none cursor-pointer transition-all duration-200 px-3 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {googleLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-foreground"></div>
                      <span>Connecting...</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                      </svg>
                      <span className="hidden sm:inline">Sign In with Google</span>
                      <span className="sm:hidden">Google</span>
                    </>
                  )}
                </Button>
              </div>
            </div>

            {/* Footer Note */}
            <p className="text-xs text-muted-foreground text-center mt-4">
              First time? You'll need to connect your account via the onboarding email first.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
