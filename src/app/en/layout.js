import '../styles/en-overrides.css';
import HtmlLangEn from '@/components/en/HtmlLangEn';

export const metadata = {
  title: {
    default: 'LVS - Lighting for Vision System',
    template: '%s | LVS',
  },
  description: 'LVS is an industrial LED lighting specialist delivering lighting technology that inspires every workplace.',
  alternates: {
    languages: {
      ko: '/',
      en: '/en',
    },
  },
};

export default function EnLayout({ children }) {
  return (
    <>
      <HtmlLangEn />
      {children}
    </>
  );
}
