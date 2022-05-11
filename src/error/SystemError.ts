import { i18n } from '../plugins'

export default class SystemError {
    code: number
    message: string

    constructor (code: number, message: string) {
      this.code = code
      this.message = message
    }

    static badRequest (message: string) {
      return new SystemError(400, message)
    }

    static internal (message: string) {
      return new SystemError(500, message)
    }

    static valueNotSet () {
      return new SystemError(500, i18n.__('valueNotSetError'))
    }

    static environmentNotSet () {
      return new SystemError(500, i18n.__('environmentNotSetError'))
    }
}
