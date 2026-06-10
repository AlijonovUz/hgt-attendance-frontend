import { useState } from "react"
import { useLanguage } from "../../Context/LanguageContext"
import { axiosAPI } from "@/services/axiosApi"
import { useNavigate } from "react-router-dom"

const LoginPage = () => {
  const { t } = useLanguage()
  const navigate = useNavigate()

  const [form, setform] = useState({
    username: "",
    password: ""
  })

  const handleSubmit = async () => {
    try {
      const res = await axiosAPI.post("", form)
      if (res.status === 200) {
        localStorage.setItem("access", data.access)
        localStorage.setItem("refresh", data.refresh)

        navigate("/")
      }
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <div className="flex flex-col gap-5">
      {t("login_page_title")}
      <button onClick={handleSubmit} className="w-[90px] border border-slate-300 rounded-md py-2 px-3.5 bg-slate-50 cursor-pointer">
        login
      </button>
    </div>
  )
}

export default LoginPage