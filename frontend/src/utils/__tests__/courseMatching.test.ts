import { getCourseCategory, getCourseStatus } from '../courseMatching';

const makeCourse = (overrides: Partial<{ title: string; code: string; capacity: string }>) => ({
  id: 'course-1',
  title: 'Software Engineering',
  code: 'SE101',
  thumbnail: '',
  format: 'Blended',
  capacity: '20/30',
  actionLabel: 'Register',
  ...overrides,
});

describe('Course Matching utilities (Tutor-Student Course Matching functionality)', () => {
  it('categorizes courses based on keywords', () => {
    expect(getCourseCategory(makeCourse({ title: 'Advanced Calculus' }) as any)).toBe('Mathematics');
    expect(getCourseCategory(makeCourse({ title: 'Art of Storytelling' }) as any)).toBe('Interdisciplinary');
  });

  it('derives capacity labels from seat counts', () => {
    expect(getCourseStatus(makeCourse({ capacity: '10/20' }) as any).label).toBe('Open Seats');
    expect(getCourseStatus(makeCourse({ capacity: '18/20' }) as any).label).toBe('Waitlist Risk');
    expect(getCourseStatus(makeCourse({ capacity: '12/15' }) as any).label).toBe('Limited Seats');
  });
});
