import { redirect } from 'next/navigation';

export default function SupportPage() {
  redirect('/en/support/notices');
}

export const metadata = {
  title: 'Support | LVS',
  description: 'LVS customer support center.',
};
