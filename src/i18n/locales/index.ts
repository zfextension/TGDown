import type { AppLocale } from '../types';
import type { MessageTree } from '../types';
import en from './en';
import zhCN from './zh-CN';
import zhTW from './zh-TW';
import ru from './ru';
import de from './de';
import es from './es';
import fr from './fr';
import ptBR from './pt-BR';
import ja from './ja';
import ko from './ko';
import ar from './ar';
import id from './id';
import tr from './tr';
import uk from './uk';
import vi from './vi';
import it from './it';
import pl from './pl';

export const localeMessages: Record<AppLocale, MessageTree> = {
  en,
  'zh-CN': zhCN,
  'zh-TW': zhTW,
  ru,
  de,
  es,
  fr,
  'pt-BR': ptBR,
  ja,
  ko,
  ar,
  id,
  tr,
  uk,
  vi,
  it,
  pl,
};
