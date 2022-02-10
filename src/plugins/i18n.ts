import { I18n } from 'i18n'

export default new I18n(({
	locales: ['en', 'es'],
	directory: './lang',
	retryInDefaultLocale: true
}))