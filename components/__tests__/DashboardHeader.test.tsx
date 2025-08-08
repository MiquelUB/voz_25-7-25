import { render, screen } from '@testing-library/react';
import DashboardHeader from '../DashboardHeader';
import '@testing-library/jest-dom';

describe('DashboardHeader', () => {
  it('renders without crashing', () => {
    render(<DashboardHeader />);
    // A simple check to see if one of the elements is present
    expect(screen.getByText('iNFORiA')).toBeInTheDocument();
  });
});
