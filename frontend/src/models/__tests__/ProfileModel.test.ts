import { ProfileModel } from '../profile';
import type { ProfileSection, UserProfile } from '../../types/portal';

const profileSection: ProfileSection = {
  header: {
    about: 'I love tutoring calculus.',
    role: 'Student',
  },
  contact: [
    { label: 'Personal Email', value: 'personal@example.com', icon: '', editable: true },
    { label: 'Phone', value: '123456789', icon: '', editable: true },
  ],
  academics: [
    { label: 'Student ID', value: '2353101' },
    { label: 'Platform Links', value: ['https://teams.microsoft.com', 'https://meet.google.com'] },
    { label: 'Support Needs', value: ['Note taker', 'Extra lab time'], type: 'tags' },
  ],
};

const profileUser: UserProfile = {
  id: 'u-1',
  name: 'Nguyen Van A',
  title: 'CE Student',
  email: 'student@hcmut.edu.vn',
  avatar: '/avatar.png',
  role: 'student',
};

describe('ProfileModel (Profile Management functionality)', () => {
  it('constructs contact and academic cards with editing state', () => {
    const model = ProfileModel.create(profileSection, profileUser);

    expect(model.isEditing).toBe(false);
    expect(model.contactCards).toHaveLength(3);
    expect(model.academicCards[0].displayLabel).toBe('STUDENT ID');
    expect(model.academicCards[1].displayLabel).toBe('STUDENT EMAIL ADDRESS');

    const editing = model.edit();
    expect(editing.isEditing).toBe(true);
    expect(editing.contactCards[0].displayLabel).toBe('PERSONAL EMAIL ADDRESS');
  });

  it('tracks avatar preview updates and clears upload errors', () => {
    const model = ProfileModel.create(profileSection, profileUser)
      .withUploadError('Too large')
      .withAvatarPreview('data:image/png;base64,preview')
      .clearUploadError();

    expect(model.uploadError).toBeUndefined();
    expect(model.avatarPreview).toBe('data:image/png;base64,preview');
  });
});
