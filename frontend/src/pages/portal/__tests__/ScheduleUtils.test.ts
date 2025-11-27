import { scheduleTestUtils } from '../SchedulePage';

describe('scheduleTestUtils (Scheduling functionality)', () => {
  it('converts HH:mm strings into minutes', () => {
    expect(scheduleTestUtils.toMinutes('08:30')).toBe(510);
    expect(scheduleTestUtils.toMinutes('12:00')).toBe(720);
  });

  it('formats ranges and hour labels for the timeline grid', () => {
    expect(scheduleTestUtils.formatHourLabel(7)).toBe('7 AM');
    expect(scheduleTestUtils.formatHourLabel(15)).toBe('3 PM');
    expect(scheduleTestUtils.formatRange('09:00', '10:45')).toBe('9:00 AM – 10:45 AM');
  });
});
