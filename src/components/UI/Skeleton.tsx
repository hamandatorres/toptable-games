import React from "react";
import "./Skeleton.scss";

interface SkeletonProps {
	width?: string | number;
	height?: string | number;
	variant?: "text" | "rectangular" | "circular";
	className?: string;
	animation?: "pulse" | "wave" | "none";
}

export const Skeleton: React.FC<SkeletonProps> = ({
	width = "100%",
	height = "1rem",
	variant = "text",
	className = "",
	animation = "pulse",
}) => {
	const skeletonClasses = `skeleton skeleton--${variant} skeleton--${animation} ${className}`;

	return (
		<div
			className={skeletonClasses}
			data-width={typeof width === "number" ? `${width}px` : width}
			data-height={typeof height === "number" ? `${height}px` : height}
			aria-hidden="true"
		/>
	);
};

// Game Card Skeleton
export const GameCardSkeleton: React.FC = () => {
	return (
		<div className="game-card-skeleton">
			<Skeleton variant="rectangular" height={200} className="skeleton-image" />
			<div className="skeleton-content">
				<Skeleton
					variant="text"
					height={20}
					width="80%"
					className="skeleton-title"
				/>
				<Skeleton
					variant="text"
					height={16}
					width="60%"
					className="skeleton-subtitle"
				/>
				<div className="skeleton-meta">
					<Skeleton variant="circular" height={20} width={20} />
					<Skeleton variant="text" height={14} width={40} />
				</div>
				<div className="skeleton-actions">
					<Skeleton variant="rectangular" height={32} width={80} />
					<Skeleton variant="rectangular" height={32} width={80} />
				</div>
			</div>
		</div>
	);
};

// Game Library Skeleton
export const GameLibrarySkeleton: React.FC = () => {
	return (
		<div className="game-library-skeleton">
			<div className="skeleton-header">
				<Skeleton
					variant="text"
					height={32}
					width={200}
					className="skeleton-heading"
				/>
				<Skeleton
					variant="rectangular"
					height={40}
					width={300}
					className="skeleton-search"
				/>
			</div>
			<div className="skeleton-grid">
				{Array.from({ length: 12 }, (_, index) => (
					<GameCardSkeleton key={index} />
				))}
			</div>
		</div>
	);
};

// User Profile Skeleton
export const UserProfileSkeleton: React.FC = () => {
	return (
		<div className="user-profile-skeleton">
			<div className="skeleton-avatar-section">
				<Skeleton variant="circular" height={80} width={80} />
				<div className="skeleton-user-info">
					<Skeleton variant="text" height={24} width={150} />
					<Skeleton variant="text" height={16} width={100} />
				</div>
			</div>
			<div className="skeleton-stats">
				{Array.from({ length: 4 }, (_, index) => (
					<div key={index} className="skeleton-stat">
						<Skeleton variant="text" height={32} width={60} />
						<Skeleton variant="text" height={14} width={80} />
					</div>
				))}
			</div>
		</div>
	);
};

// Chart Skeleton
export const ChartSkeleton: React.FC = () => {
	return (
		<div className="chart-skeleton">
			<Skeleton
				variant="text"
				height={24}
				width={200}
				className="skeleton-chart-title"
			/>
			<Skeleton
				variant="rectangular"
				height={300}
				className="skeleton-chart-area"
			/>
			<div className="skeleton-chart-legend">
				{Array.from({ length: 3 }, (_, index) => (
					<div key={index} className="skeleton-legend-item">
						<Skeleton variant="circular" height={12} width={12} />
						<Skeleton variant="text" height={12} width={60} />
					</div>
				))}
			</div>
		</div>
	);
};

// Table Skeleton
export const TableSkeleton: React.FC<{ rows?: number; columns?: number }> = ({
	rows = 5,
	columns = 4,
}) => {
	return (
		<div className="table-skeleton">
			<div className="skeleton-table-header">
				{Array.from({ length: columns }, (_, index) => (
					<Skeleton key={index} variant="text" height={20} width="80%" />
				))}
			</div>
			{Array.from({ length: rows }, (_, rowIndex) => (
				<div key={rowIndex} className="skeleton-table-row">
					{Array.from({ length: columns }, (_, colIndex) => (
						<Skeleton key={colIndex} variant="text" height={16} width="90%" />
					))}
				</div>
			))}
		</div>
	);
};
