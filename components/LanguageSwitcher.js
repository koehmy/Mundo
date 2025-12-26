import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';

const LanguageSwitcher = () => {
  const router = useRouter();
  const { i18n } = useTranslation();
  const { locale, locales, asPath } = router;

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
          {i18n.getFixedT(loc)('languageName')}
        </option>
      ))}
    </select>
  );
};

export default LanguageSwitcher;
