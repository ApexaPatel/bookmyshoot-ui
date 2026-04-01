import PortfolioCard from '@/components/portfolio/PortfolioCard';

export default function PortfolioGrid({ portfolios }) {
  if (!portfolios.length) {
    return (
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-10 text-center text-zinc-400">
        No photoshoots yet. Add your first portfolio entry to showcase your work.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
      {portfolios.map((portfolio) => (
        <PortfolioCard key={portfolio.id} portfolio={portfolio} />
      ))}
    </div>
  );
}
