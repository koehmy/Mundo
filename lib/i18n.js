// lib/i18n.js
import NextI18Next from 'next-i18next';
import config from '../next-i18next.config.js';

const NextI18NextInstance = new NextI18Next(config);
export default NextI18NextInstance;
export const { appWithTranslation, useTranslation } = NextI18NextInstance;
