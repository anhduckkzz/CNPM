import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import FeedbackPage from '../FeedbackPage';
import { useAuth } from '../../../context/AuthContext';

const showToast = vi.fn();

vi.mock('../../../context/AuthContext', () => ({
  useAuth: vi.fn(),
}));

vi.mock('../../../hooks/useStackedToasts', () => ({
  useStackedToasts: () => ({
    toasts: [],
    showToast,
  }),
}));

const mockedUseAuth = vi.mocked(useAuth);

const feedbackData = {
  title: 'Student Feedback',
  instructions: 'Tell us about your tutoring experience',
  sessions: ['Week 1 coaching', 'Week 2 workshop'],
  ratingScale: ['Poor', 'Fair', 'Neutral', 'Good', 'Excellent'],
  history: [
    { id: '1', course: 'Calculus I', submittedOn: 'Oct 1', rating: 4, status: 'Reviewed', summary: 'Helpful', },
  ],
};

describe('FeedbackPage (Feedback & Evaluation GUI)', () => {
  beforeEach(() => {
    showToast.mockClear();
    mockedUseAuth.mockReturnValue({
      portal: { feedback: feedbackData },
    } as any);
  });

  it('submits feedback and triggers a toast notification', async () => {
    const user = userEvent.setup();
    render(<FeedbackPage />);

    await user.selectOptions(screen.getByDisplayValue('Good'), 'Neutral');
    await user.click(screen.getByRole('button', { name: 'Submit Student Feedback' }));

    expect(showToast).toHaveBeenCalledWith('Student feedback submitted');
  });
});
