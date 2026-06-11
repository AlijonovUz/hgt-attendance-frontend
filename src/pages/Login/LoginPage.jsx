import { useState, useEffect } from "react"
import { useLanguage } from "../../Context/LanguageContext"
import { useTheme } from "../../Context/ThemeContext"
import { axiosAPI } from "@/services/axiosAPI"
import { useNavigate } from "react-router-dom"
import { Eye, EyeOff, ShieldAlert, ChevronDown, Check, GalleryVerticalEnd } from "lucide-react"

const LoginPage = () => {
  const { t, language, setLanguage } = useLanguage()
  const { theme, setTheme } = useTheme()
  const navigate = useNavigate()

  const [form, setform] = useState({
    full_name: "",
    password: ""
  })

  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState(false)
  const [emptyError, setEmptyError] = useState(false)
  const [attempts, setAttempts] = useState(() => parseInt(localStorage.getItem('loginAttempts') || '0', 10))
  const [isBlocked, setIsBlocked] = useState(false)
  const [remainingTime, setRemainingTime] = useState(0)
  const [langDropdownOpen, setLangDropdownOpen] = useState(false)

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

    // DEMO logic for UI states based on requirements
    if (form.password === "error" || form.full_name === "error") {
      const newAttempts = attempts + 1
      setAttempts(newAttempts)
      localStorage.setItem('loginAttempts', newAttempts.toString())

      if (newAttempts >= 5) {
        setIsBlocked(true)
        localStorage.setItem('blockUntil', (Date.now() + 15 * 60 * 1000).toString())
      } else {
        setError(true)
      }
      return
    }

    try {
      const res = await axiosAPI.post("users/auth/login/", form)
      if (res.status === 200) {
        localStorage.setItem("access", res.data?.access || "")
        localStorage.setItem("refresh", res.data?.refresh || "")
        localStorage.setItem('loginAttempts', '0')
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
  }

  const displayLang = language === 'uz' ? 'UZ' : language === 'cy' ? 'ЎЗ' : 'РУ'
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
          <div className="flex items-center gap-2 font-semibold text-[15px]">
            <div className="w-6 h-6 bg-login-logo rounded-md flex items-center justify-center">
              <GalleryVerticalEnd color="#fff" size={16} />
            </div>
            HGT Tahlil
          </div>

          <div className="flex items-center gap-3">
            {/* Language Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setLangDropdownOpen(!langDropdownOpen)}
                className="flex items-center gap-1.5 px-3 cursor-pointer py-2.5 rounded-md bg-login-pill-bg hover:bg-login-pill-hover text-login-pill-text text-sm font-medium transition-colors"
              >
                {displayLang} <ChevronDown className="w-4 h-4 text-login-text-secondary" />
              </button>

              {langDropdownOpen && (
                <div className="absolute top-full right-0 mt-2 w-[140px] bg-login-left-bg border border-login-border rounded-lg shadow-[0_4px_20px_rgba(0,0,0,0.08)] py-1.5 overflow-hidden z-20">
                  {[
                    { value: 'uz', label: 'Uzbek' },
                    { value: 'cy', label: 'Ўзбек' },
                    { value: 'ru', label: 'Русский' }
                  ].map(lang => (
                    <button
                      key={lang.value}
                      className="w-full text-left px-4 py-2 cursor-pointer text-[14px] hover:bg-login-pill-hover flex items-center justify-between"
                      onClick={() => {
                        setLanguage(lang.value)
                        setLangDropdownOpen(false)
                      }}
                    >
                      <span className={language === lang.value ? "text-login-text-primary" : "text-login-text-secondary"}>{lang.label}</span>
                      {language === lang.value && <Check className="w-4 h-4 text-login-text-secondary" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Theme Toggle */}
            <div className="flex p-1 transition-colors bg-login-pill-bg rounded-lg">
              <button 
                onClick={() => setTheme('light')}
                className={`px-3 py-1.5 cursor-pointer text-sm rounded-md font-medium transition-colors ${theme === 'light' ? 'bg-login-left-bg text-login-text-primary shadow-sm' : 'text-login-text-secondary hover:text-login-text-primary bg-transparent'}`}
              >
                {t('light_theme')}
              </button>
              <button 
                onClick={() => setTheme('dark')}
                className={`px-3 py-1.5 cursor-pointer text-sm rounded-md font-medium transition-colors ${theme === 'dark' ? 'bg-login-left-bg text-login-text-primary shadow-sm' : 'text-login-text-secondary hover:text-login-text-primary bg-transparent'}`}
              >
                {t('dark_theme')}
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
                <label className="block text-sm font-medium text-login-text-primary mb-1.5">{t('login_label')}</label>
                <input
                  name="full_name"
                  type="text"
                  placeholder={t('login_label')}
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
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={isBlocked}
                    className="absolute right-3 top-1/2 cursor-pointer -translate-y-1/2 text-login-text-secondary hover:text-login-text-primary p-1"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
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
                    <p className="text-[13px] text-login-text-secondary mb-3 leading-[1.4]">
                      {t('account_blocked_desc')}
                    </p>
                    <p className="text-[13px] text-login-text-secondary">
                      {t('retry_in')}<span className="font-bold text-login-text-primary">{formatTime(remainingTime)}</span>
                    </p>
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={isBlocked}
                className={`mt-4 w-full py-3 rounded-lg cursor-pointer font-medium text-white transition-colors ${isBlocked ? 'bg-[#737373] cursor-not-allowed opacity-90' : 'bg-login-btn-bg hover:bg-login-btn-hover'
                  }`}
              >
                {t('login_btn')}
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Right Column */}
      <div className="hidden md:flex w-1/2 bg-login-right-bg p-8 flex-col justify-between transition-colors duration-200">
        <div className="flex flex-col">
          <h2 className="text-[18px] font-bold text-login-text-primary">{t('brand_title')}</h2>
          <p className="text-[14px] text-login-text-secondary ">{t('brand_subtitle')}</p>
        </div>

        <div className="">
          <h1 className="text-[32px] leading-[1.2] max-w-[470px] font-bold text-login-text-primary mb-3">
            {t('system_title')}
          </h1>
          <p className="text-[16px] leading-[1.5] max-w-[460px] text-login-text-secondary">
            {t('system_desc')}
          </p>
        </div>

        <div className="text-[13px] text-login-text-secondary">
          {t('secure_login_info')}
        </div>
      </div>
    </div>
  )
}

export default LoginPage