import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 p-6">
      <Input placeholder="Enter something..." />
      <Button>Test Button</Button>
    </main>
  );
}
