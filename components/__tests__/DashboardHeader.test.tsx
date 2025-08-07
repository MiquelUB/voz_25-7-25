import { render, screen } from '@testing-library/react';
import DashboardHeader from '../DashboardHeader';
import '@testing-library/jest-dom';
import { MemoryRouter } from 'react-router-dom'; // Needed because the component uses <Link>

describe('DashboardHeader', () => {
  it('renders without crashing', () => {
    render(
      <MemoryRouter>
        <DashboardHeader />
      </MemoryRouter>
    );
    // A simple check to see if one of the elements is present
    expect(screen.getByText('iNFORiA')).toBeInTheDocument();
  });
});
