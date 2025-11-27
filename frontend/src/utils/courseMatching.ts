import type { CourseCard } from '../types/portal';

export const CATEGORY_RULES = [
  { match: /calculus|math|algebra|statistics|probability/i, label: 'Mathematics' },
  { match: /programming|systems|data|software|algorithm|computer/i, label: 'Computer Science' },
  { match: /physics|engineering/i, label: 'Engineering' },
  { match: /design|creative|communication/i, label: 'Creative Practice' },
  { match: /business|economics|finance/i, label: 'Business & Management' },
];

export const getCourseCategory = (course: CourseCard) => {
  const haystack = `${course.title} ${course.code}`.toLowerCase();
  const rule = CATEGORY_RULES.find((entry) => entry.match.test(haystack));
  return rule?.label ?? 'Interdisciplinary';
};

export const getCourseStatus = (course: CourseCard) => {
  if (!course.capacity) return { label: 'Open Seats', capacity: null };
  const [current, total] = course.capacity.split('/').map((value) => Number(value.replace(/\D/g, '')));
  if (!Number.isFinite(current) || !Number.isFinite(total) || total === 0) {
    return { label: 'Open Seats', capacity: null };
  }
  const ratio = current / total;
  if (ratio <= 0.6) return { label: 'Open Seats', capacity: { current, total } };
  if (ratio <= 0.85) return { label: 'Limited Seats', capacity: { current, total } };
  return { label: 'Waitlist Risk', capacity: { current, total } };
};
