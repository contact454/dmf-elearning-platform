import { redirect } from 'next/navigation';

export default function SpeakingIndexPage() {
  // Redirect to featured for now
  redirect('/en/speaking/practice');
}
