export const toCourseSlug = (courseId?: string | null) => {
  if (!courseId) return undefined;
  return courseId.startsWith('c-') ? courseId.slice(2) : courseId;
};

export const courseIdFromSlug = (slug?: string | null) => {
  if (!slug) return undefined;
  return slug.startsWith('c-') ? slug : `c-${slug}`;
};
