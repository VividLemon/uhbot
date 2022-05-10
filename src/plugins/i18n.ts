import { I18n } from 'i18n'
import { join } from 'path'

const i18n = new I18n()

i18n.configure({
  locales: ['en', 'es'],
  directory: join(process.cwd(), '/lang'),
  retryInDefaultLocale: true,
  defaultLocale: 'en'
})

export default i18n
