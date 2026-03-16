import { render, screen } from '@testing-library/react';
import App from './App';

test('renders perfume similarity app title', () => {
  render(<App />);
  const titleElement = screen.getByText(/perfume similarity app/i);
  expect(titleElement).toBeInTheDocument();
});
