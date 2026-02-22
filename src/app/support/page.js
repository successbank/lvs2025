import { redirect } from 'next/navigation';

export default function SupportPage() {
  redirect('/support/notices');
}

export const metadata = {
  title: '고객지원 | LVS',
  description: '엘브이에스 고객지원 센터',
};
