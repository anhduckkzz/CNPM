import { act, renderHook } from '@testing-library/react';
import { useStackedToasts } from '../useStackedToasts';

describe('useStackedToasts (Feedback & Evaluation functionality)', () => {
  it('queues and dismisses toast messages', () => {
    const { result } = renderHook(() => useStackedToasts(100));

    act(() => {
      result.current.showToast('Feedback submitted');
    });

    expect(result.current.toasts).toHaveLength(1);
    const toastId = result.current.toasts[0].id;

    act(() => {
      result.current.dismiss(toastId);
    });

    expect(result.current.toasts).toHaveLength(0);
  });
});
