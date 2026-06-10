import { DatePicker } from "@/components/ui/DatePicker"
import { useLanguage } from "../../Context/LanguageContext"
import { CustomInput } from "@/components/ui/CustomInput"
import { LuSearch } from "react-icons/lu"

const HomePage = () => {
  const { t } = useLanguage()

  return (
    <div>
      {t("home_page_title")}
      <DatePicker
        showTime={true}
      />
    </div>
  )
}

export default HomePage