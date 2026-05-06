import React from 'react';

export default function SkeletonLoader({ type }) {
  if (type === 'current') {
    return (
      <div className="skeleton skeleton--current">
        <div className="skeleton__line skeleton__line--title" />
        <div className="skeleton__cards">
          <div className="skeleton__card" />
          <div className="skeleton__card" />
          <div className="skeleton__card" />
        </div>
      </div>
    );
  }

  if (type === 'hourly') {
    return (
      <div className="skeleton skeleton--hourly">
        <div className="skeleton__line skeleton__line--title" />
        <div className="skeleton__chart" />
      </div>
    );
  }

  if (type === 'daily') {
    return (
      <div className="skeleton skeleton--daily">
        <div className="skeleton__line skeleton__line--title" />
        <div className="skeleton__days">
          <div className="skeleton__day" />
          <div className="skeleton__day" />
          <div className="skeleton__day" />
          <div className="skeleton__day" />
          <div className="skeleton__day" />
        </div>
      </div>
    );
  }

  return null;
}
