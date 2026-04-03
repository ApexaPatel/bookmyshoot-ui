import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function ProfileInfoCard({ title, description, children }) {
  return (
    <Card className="rounded-[2rem] border-white/10 bg-zinc-900/80 shadow-xl backdrop-blur">
      <CardHeader className="pb-4">
        <CardTitle className="text-xl text-white">{title}</CardTitle>
        {description ? <p className="text-sm text-zinc-400">{description}</p> : null}
      </CardHeader>
      <CardContent className="space-y-5">{children}</CardContent>
    </Card>
  );
}
