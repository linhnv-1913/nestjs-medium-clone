import { AcceptLanguageResolver } from 'nestjs-i18n';
import * as path from 'path';
import { DEFAULT_I18N_DIR, DEFAULT_LANGUAGE } from '../constants';

export const i18nConfig = {
  fallbackLanguage: DEFAULT_LANGUAGE,
  loaderOptions: {
    path: path.join(__dirname, DEFAULT_I18N_DIR),
    watch: true,
  },
  resolvers: [AcceptLanguageResolver],
};
