import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ReportBuilderPage from '../ReportBuilderPage';
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

const reports = {
  academic: {
    reportName: 'Academic Standing Report',
    academicYear: '2024-2025',
    filters: [{ label: 'Faculty', value: 'CSE' }],
    options: ['Include GPA trend'],
  },
  scholarship: {
    reportName: 'Scholarship Nominee Report',
    academicYear: '2024-2025',
    semester: 'Fall',
    filters: [{ label: 'Scholarship', value: 'Merit' }],
    options: ['Include contact details'],
  },
  feedback: {
    reportName: 'Feedback Follow-up',
    academicYear: '2024-2025',
    filters: [{ label: 'Department', value: 'CE' }],
    options: ['Escalate low ratings'],
  },
};

describe('ReportBuilderPage (Academic Record & Scholarship)', () => {
  beforeEach(() => {
    showToast.mockClear();
  });

  it('blocks non-staff roles from the builder (functionality)', () => {
    mockedUseAuth.mockReturnValue({
      role: 'student',
      portal: { reports },
    } as any);

    render(<ReportBuilderPage />);

    expect(screen.getByText('Report builder available for staff only.')).toBeInTheDocument();
  });

  it('allows staff to trigger report actions and emits toasts (GUI)', async () => {
    mockedUseAuth.mockReturnValue({
      role: 'staff',
      portal: { reports },
    } as any);

    const user = userEvent.setup();
    render(<ReportBuilderPage />);

    await user.click(screen.getAllByRole('button', { name: 'Generate Report' })[0]);

    expect(showToast).toHaveBeenCalledWith('Generated Academic Standing Report');
  });
});
