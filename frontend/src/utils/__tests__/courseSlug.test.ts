import { courseIdFromSlug, toCourseSlug } from '../courseSlug';

describe('courseSlug utilities (Course functionality)', () => {
  it('removes and restores the c- prefix consistently', () => {
    expect(toCourseSlug('c-calculus')).toBe('calculus');
    expect(toCourseSlug('math-101')).toBe('math-101');
    expect(toCourseSlug(undefined)).toBeUndefined();

    expect(courseIdFromSlug('calculus')).toBe('c-calculus');
    expect(courseIdFromSlug('c-ready')).toBe('c-ready');
  });
});
