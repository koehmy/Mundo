import { useRouter } from 'next/router';
import { useTranslations } from 'next-intl';

const LanguageSwitcher = () => {
  const router = useRouter();
  const { locale, locales, asPath } = router;
  const t = useTranslations();

  const handleChange = (e) => {
    const newLocale = e.target.value;
    router.push(asPath, asPath, { locale: newLocale });
  };

  return (
    <select
      value={locale}
      onChange={handleChange}
      className="ml-4 px-2 py-1 rounded border border-stone-200 text-sm bg-white text-stone-700"
      aria-label="Select language"
    >
      {locales.map((loc) => (
        <option key={loc} value={loc}>
          {t('languageName', {}, {locale: loc})}
        </option>
      ))}
    </select>
  );
};

export default LanguageSwitcher;
