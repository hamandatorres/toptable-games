import React, { Suspense, lazy } from 'react';

// Lazy load the Chart component to reduce initial bundle size
const PlayCountGraphComponent = lazy(() => import('./PlayCountGraph'));

const LazyPlayCountGraph: React.FC = () => {
	return (
		<Suspense fallback={
			<div className="chart-loading">
				<div className="loading-spinner">Loading chart...</div>
			</div>
		}>
			<PlayCountGraphComponent />
		</Suspense>
	);
};

export default LazyPlayCountGraph;
