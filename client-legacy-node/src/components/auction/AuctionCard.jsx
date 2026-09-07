import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { uploadUrl } from '../../api/client.js';
import { SeriesLabel } from '../product/SeriesLabel.jsx';
import { formatCountdown, formatPrice } from '../../lib/format.js';

export function AuctionCard({ auction }) {
  const [, setTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <Link to={`/encheres/${auction.id}`} className="auction-card">
      <div className="auction-card-img">
        {auction.product.imageUrl ? (
          <img src={uploadUrl(auction.product.imageUrl)} alt={auction.product.name} loading="lazy" />
        ) : null}
      </div>
      <div className="auction-card-body">
        <div className="auction-card-top">
          <div>
            <div className="list-row-name">{auction.product.name}</div>
            <SeriesLabel series={auction.product.series} />
          </div>
          <span className="countdown-badge">{formatCountdown(auction.endAt)}</span>
        </div>
        <div>
          <div className="auction-current-price-label">Enchère actuelle</div>
          <span className="price" style={{ fontSize: '1.05rem' }}>{formatPrice(auction.currentPrice)}</span>
        </div>
      </div>
    </Link>
  );
}
