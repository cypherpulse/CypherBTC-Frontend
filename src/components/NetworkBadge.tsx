import { NETWORK } from '@/lib/constants';

export const NetworkBadge = () => {
  const isMainnet = NETWORK === 'mainnet';
  
  return (
    <div className={`
      px-2.5 py-1 rounded-full text-xs font-medium uppercase tracking-wider
      ${isMainnet 
        ? 'bg-success/20 text-success border border-success/30' 
        : 'bg-warning/20 text-warning border border-warning/30'
      }
    `}>
      {NETWORK}
    </div>
  );
};
