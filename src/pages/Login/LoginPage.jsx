import { useState, useEffect } from "react"
import { useLanguage } from "../../Context/LanguageContext"
import { useTheme } from "../../Context/ThemeContext"
import { axiosAPI } from "@/services/axiosAPI"
import { useNavigate } from "react-router-dom"
import { Eye, EyeOff, ShieldAlert, SunMedium, Moon } from "lucide-react"
import { CgSpinnerTwo } from "react-icons/cg"
import { LanguageSwitcher } from "@/components/LanguageSwitcher"

const LoginPage = () => {
  const { t } = useLanguage()
  const { theme, setTheme } = useTheme()
  const navigate = useNavigate()

  const [form, setform] = useState({
    full_name: "",
    password: ""
  })

  const [loading, setLoading] = useState(false)

  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState(false)
  const [emptyError, setEmptyError] = useState(false)
  const [attempts, setAttempts] = useState(() => parseInt(localStorage.getItem('loginAttempts') || '0', 10))
  const [isBlocked, setIsBlocked] = useState(false)
  const [remainingTime, setRemainingTime] = useState(0)
  const [langDropdownOpen, setLangDropdownOpen] = useState(false)

  useEffect(() => {
    const accessToken = localStorage.getItem("access")
    if (accessToken) {
      navigate("/", { replace: true })
    }
  }, [navigate])

  useEffect(() => {
    let interval = null;
    const blockUntil = localStorage.getItem('blockUntil')

    if (blockUntil) {
      const targetTime = parseInt(blockUntil, 10)
      if (targetTime > Date.now()) {
        setIsBlocked(true)
        setRemainingTime(Math.ceil((targetTime - Date.now()) / 1000))

        interval = setInterval(() => {
          const now = Date.now()
          if (targetTime <= now) {
            clearInterval(interval)
            setIsBlocked(false)
            setAttempts(0)
            localStorage.removeItem('blockUntil')
            localStorage.setItem('loginAttempts', '0')
          } else {
            setRemainingTime(Math.ceil((targetTime - now) / 1000))
          }
        }, 1000)
      } else {
        localStorage.removeItem('blockUntil')
        localStorage.setItem('loginAttempts', '0')
        setAttempts(0)
      }
    }

    return () => clearInterval(interval)
  }, [isBlocked])

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0')
    const s = (seconds % 60).toString().padStart(2, '0')
    return `${m}:${s}`
  }

  const handleInputChange = (e) => {
    setform({ ...form, [e.target.name]: e.target.value })
    if (error) setError(false)
    if (emptyError) setEmptyError(false)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()


    if (!form.full_name.trim() || !form.password.trim()) {
      setEmptyError(true)
      return
    }

    setLoading(true)

    // DEMO logic for UI states based on requirements
    if (form.password === "error" || form.full_name === "error") {
      const newAttempts = attempts + 1
      setAttempts(newAttempts)
      localStorage.setItem('loginAttempts', newAttempts.toString())

      if (newAttempts >= 5) {
        setIsBlocked(true)
        localStorage.setItem('blockUntil', (Date.now() + 15 * 60 * 1000).toString())
        setLoading(false)
      } else {
        setError(true)
        setLoading(false)
      }
      return
    }

    try {
      const res = await axiosAPI.post("users/auth/login/", form)
      if (res.status === 200) {
        localStorage.setItem("access", res.data?.data?.access || "")
        localStorage.setItem("refresh", res.data?.data?.refresh || "")
        localStorage.setItem('loginAttempts', '0')
        setLoading(false)
        navigate("/")
      }
    } catch (err) {
      console.error(err)
      const newAttempts = attempts + 1
      setAttempts(newAttempts)
      localStorage.setItem('loginAttempts', newAttempts.toString())

      if (newAttempts >= 5) {
        setIsBlocked(true)
        localStorage.setItem('blockUntil', (Date.now() + 15 * 60 * 1000).toString())
      } else {
        setError(true)
      }
    }
    finally {
      setLoading(false)
    }
  }

  const isFullNameEmpty = emptyError && !form.full_name.trim()
  const isPasswordEmpty = emptyError && !form.password.trim()
  const hasFullNameError = error || isFullNameEmpty
  const hasPasswordError = error || isPasswordEmpty

  return (
    <div className="min-h-screen flex w-full font-sans text-login-text-primary">
      {/* Left Column */}
      <div className="w-full md:w-1/2 flex flex-col relative bg-login-left-bg min-h-screen transition-colors duration-200">

        {/* Top Header */}
        <div className="absolute top-8 left-8 right-8 flex justify-between items-center z-10">
          <div className="flex items-center gap-2 font-semibold text-[20px]">
            <img src="/logo.svg" alt="logo" className="w-10 h-10 object-cover" />
            Davomat
          </div>

          <div className="flex items-center gap-3">
            {/* Language switcher */}
            <LanguageSwitcher />

            {/* Theme Toggle */}
            <div className="flex p-1 transition-colors bg-login-pill-bg rounded-lg">
              <button
                onClick={() => setTheme('light')}
                className={`px-3 h-9 cursor-pointer flex items-center gap-2 text-sm rounded-md font-medium transition-colors ${theme === 'light' ? 'bg-login-left-bg text-login-text-primary shadow-sm' : 'text-login-text-secondary hover:text-login-text-primary bg-transparent'}`}
              >
                {t('light_theme')}
                <SunMedium size={16} />
              </button>
              <button
                onClick={() => setTheme('dark')}
                className={`px-3 h-9 cursor-pointer flex items-center gap-2 text-sm rounded-md font-medium transition-colors ${theme === 'dark' ? 'bg-login-left-bg text-login-text-primary shadow-sm' : 'text-login-text-secondary hover:text-login-text-primary bg-transparent'}`}
              >
                {t('dark_theme')}
                <Moon size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* Form Container */}
        <div className="flex-1 flex flex-col justify-center items-center px-8">
          <div className="w-full max-w-[360px]">
            <div className="text-center flex justify-center items-center flex-col mb-8">
              <h1 className="text-[28px] font-semibold mb-2 text-login-text-primary">{t('login_title')}</h1>
              <p className="text-[15px] text-login-text-secondary text-center max-w-[250px]">{t('login_subtitle')}</p>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div>
                <label className="block text-sm font-medium text-login-text-primary mb-1.5">{t('login_btn')}</label>
                <input
                  name="full_name"
                  type="text"
                  placeholder={t('full_name')}
                  value={form.full_name}
                  onChange={handleInputChange}
                  disabled={isBlocked}
                  className={`w-full px-4 py-2.5 border rounded-lg outline-none transition-colors text-[15px] ${hasFullNameError ? 'border-[#EF4444] text-[#EF4444]' : 'border-login-border focus:border-blue-500'
                    } ${isBlocked ? 'bg-login-input-disabled text-login-text-secondary' : 'bg-login-input-bg text-login-text-primary'}`}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-login-text-primary mb-1.5">{t('password_label')}</label>
                <div className="relative">
                  <input
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder={t('password_label')}
                    value={form.password}
                    onChange={handleInputChange}
                    disabled={isBlocked}
                    className={`w-full px-4 py-2.5 border rounded-lg outline-none transition-colors text-[15px] pr-12 ${hasPasswordError ? 'border-[#EF4444] text-[#EF4444]' : 'border-login-border focus:border-blue-500'
                      } ${isBlocked ? 'bg-login-input-disabled text-login-text-secondary' : 'bg-login-input-bg text-login-text-primary'}`}
                  />
                  {form.password.trim() &&
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      disabled={isBlocked}
                      className="absolute right-3 top-1/2 cursor-pointer disabled:cursor-default -translate-y-1/2 text-login-text-secondary hover:text-login-text-primary p-1"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  }
                </div>
                {emptyError && !isBlocked && (
                  <p className="text-[#EF4444] text-[13px] mt-2">
                    {t('login_empty_error')}
                  </p>
                )}
                {error && !emptyError && !isBlocked && (
                  <p className="text-[#EF4444] text-[13px] mt-2">
                    {t('login_incorrect_error').replace('{n}', 5 - attempts)}
                  </p>
                )}
              </div>

              {isBlocked && (
                <div className="mt-2 border border-login-border transition-colors rounded-xl p-4 flex gap-3 items-center bg-login-left-bg shadow-sm">
                  <div className="w-8 h-8 flex justify-center items-center border transition-colors border-login-border rounded-lg shadow-sm bg-login-pill-bg shrink-0">
                    <ShieldAlert className="w-[18px] h-[18px] text-login-text-primary" strokeWidth={2} />
                  </div>
                  <div>
                    <h3 className="text-[14px] font-semibold text-login-text-primary mb-1">{t('account_blocked_title')}</h3>
                    <p className="text-[13px] text-login-text-secondary mb-1 max-w-[250px]! leading-[1.4]">
                      {t('account_blocked_desc')}
                    </p>
                    <p className="text-[13px] text-login-text-secondary">
                      {t('retry_in')}<span className="font-bold text-red-500">{formatTime(remainingTime)}</span>
                    </p>
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={isBlocked || loading}
                className={`mt-4 w-full flex justify-center items-center gap-2 py-3 rounded-lg font-medium text-white transition-colors ${isBlocked || loading ? 'bg-[#737373] cursor-default opacity-90' : 'bg-login-btn-bg hover:bg-login-btn-hover cursor-pointer'}`}
              >
                {loading && <CgSpinnerTwo size={16} className="animate-spin" />}
                {t('login_btn')}
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Right Column */}
      <div
        className={`hidden relative md:flex w-1/2 p-8 flex-col justify-start`}
      >
        <img src={theme === "dark" ? "/bg_dark.png" : "/bg_light.png"} alt="" className="absolute top-0 right-0 z-[-1] h-full w-full" />

        <div className="flex flex-col">
          <h2 className="text-[18px] font-bold text-white dark:text-[#fafafa]">{t('brand_title')}</h2>
          <p className="text-[14px] text-[#f5f5f5] dark:text-[#a3a3a3]">{t('brand_subtitle')}</p>
        </div>

        <div className="flex items-center h-full">
          <div className="">
            <h1 className="text-[32px] leading-[1.2] max-w-[470px] font-bold text-white dark:text-[#fafafa] mb-3">
              {t('system_title')}
            </h1>
            <p className="text-[16px] leading-[1.5] max-w-[400px] text-[#f5f5f5] dark:text-[#a3a3a3]">
              {t('system_desc')}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LoginPage