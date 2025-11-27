import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import SSOLanding from '../SSOLanding';

const LocationProbe = () => {
  const location = useLocation();
  return (
    <div>
      <div>CAS login screen</div>
      <div data-testid="location-search">{location.search}</div>
    </div>
  );
};

describe('SSOLanding page', () => {
  it('renders the primary CTA buttons and footer copy', () => {
    render(
      <MemoryRouter>
        <SSOLanding />
      </MemoryRouter>,
    );

    expect(screen.getAllByText('HCMUT e-learning')).toHaveLength(2);
    expect(screen.getByRole('button', { name: /Log in with HCMUT SSO/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Administrator/i })).toBeInTheDocument();
    expect(screen.getByText(`${new Date().getFullYear()} BKEL`, { exact: false })).toBeInTheDocument();
  });

  it('navigates to the CAS login flow when students click the main CTA', async () => {
    const user = userEvent.setup();

    render(
      <MemoryRouter initialEntries={['/']}>
        <Routes>
          <Route path="/" element={<SSOLanding />} />
          <Route path="/cas-login" element={<LocationProbe />} />
        </Routes>
      </MemoryRouter>,
    );

    await user.click(screen.getByRole('button', { name: /Log in with HCMUT SSO/i }));

    expect(screen.getByText('CAS login screen')).toBeInTheDocument();
  });

  it('appends the staff role query string when administrators log in', async () => {
    const user = userEvent.setup();

    render(
      <MemoryRouter initialEntries={['/']}>
        <Routes>
          <Route path="/" element={<SSOLanding />} />
          <Route path="/cas-login" element={<LocationProbe />} />
        </Routes>
      </MemoryRouter>,
    );

    await user.click(screen.getByRole('button', { name: /Administrator/i }));

    expect(screen.getByTestId('location-search')).toHaveTextContent('role=staff');
  });
});
