import { useLanguage } from "../../Context/LanguageContext"

const LoginPage = () => {
  const { t } = useLanguage()

  return (
    <div>
      {t("login_page_title")}
    </div>
  )
}

export default LoginPage