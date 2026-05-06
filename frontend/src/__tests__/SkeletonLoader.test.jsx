import React from 'react';
import { render } from '@testing-library/react';
import SkeletonLoader from '../components/SkeletonLoader';

describe('SkeletonLoader', () => {
  test('renderiza skeleton do tipo current', () => {
    const { container } = render(<SkeletonLoader type="current" />);

    expect(container.querySelector('.skeleton--current')).toBeInTheDocument();
    expect(container.querySelector('.skeleton__card')).toBeInTheDocument();
  });

  test('renderiza skeleton do tipo hourly', () => {
    const { container } = render(<SkeletonLoader type="hourly" />);

    expect(container.querySelector('.skeleton--hourly')).toBeInTheDocument();
    expect(container.querySelector('.skeleton__chart')).toBeInTheDocument();
  });

  test('renderiza skeleton do tipo daily', () => {
    const { container } = render(<SkeletonLoader type="daily" />);

    expect(container.querySelector('.skeleton--daily')).toBeInTheDocument();
    expect(container.querySelector('.skeleton__day')).toBeInTheDocument();
  });

  test('nao renderiza nada para tipo desconhecido', () => {
    const { container } = render(<SkeletonLoader type="unknown" />);

    expect(container.firstChild).toBeNull();
  });
});
