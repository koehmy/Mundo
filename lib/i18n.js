// lib/i18n.js
import NextI18Next from 'next-i18next';
import config from '../next-i18next.config.js';

const NextI18NextInstance = new NextI18Next(config);
module.exports = {
	...NextI18NextInstance,
	appWithTranslation: NextI18NextInstance.appWithTranslation,
	useTranslation: NextI18NextInstance.useTranslation,
};
