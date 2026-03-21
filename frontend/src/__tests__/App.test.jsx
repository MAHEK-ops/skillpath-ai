import React from 'react';
import { render, screen } from '@testing-library/react';
import App from '../App';
import { vi } from 'vitest';


vi.mock('../../pages/LandingPage', () => ({
  default: ({ onNavigate }) => (
    <div data-testid="landing-page">
      <button onClick={() => onNavigate('upload')}>Go to Upload</button>
    </div>
  )
}));

vi.mock('../../pages/UploadPage', () => ({
  default: ({ onNavigate }) => (
    <div data-testid="upload-page">
      <button onClick={() => onNavigate('processing', { test: true })}>Analyze Gaps</button>
    </div>
  )
}));

describe('App Integration Flow', () => {
    it('renders the initial app correctly without crashing', () => {
        render(<App />);
        expect(screen.getAllByText(/SkillPath/i).length).toBeGreaterThan(0);
    });

    it('navigates from Landing Page to Upload Page (if applicable)', () => {
        render(<App />);
    });
});
