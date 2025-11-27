import type { ProfileSection, UserProfile } from '../types/portal';

export type ProfileContactCard = {
  key: string;
  displayLabel: string;
  value: string | string[];
  editable?: boolean;
};

export type ProfileAcademicCard = {
  key: string;
  displayLabel: string;
  value: string | string[];
  type?: 'tags';
  locked?: boolean;
};

interface ProfileModelState {
  section: ProfileSection;
  user: UserProfile;
  isEditing: boolean;
  avatarPreview: string;
  uploadError?: string;
}

export class ProfileModel {
  static readonly MAX_AVATAR_SIZE = 2 * 1024 * 1024;

  private readonly section: ProfileSection;
  private readonly user: UserProfile;
  readonly isEditing: boolean;
  readonly avatarPreview: string;
  readonly uploadError?: string;
  readonly personalEmail: string;
  readonly phoneNumber?: string;
  readonly address?: string;
  readonly platformLinks: string[];
  readonly studentId?: string;
  readonly studentMail: string;
  readonly supportNeeds: string[];

  private readonly contactEntries: ProfileContactCard[];
  private readonly academicEntries: ProfileAcademicCard[];

  private constructor(state: ProfileModelState) {
    this.section = state.section;
    this.user = state.user;
    this.isEditing = state.isEditing;
    this.avatarPreview = state.avatarPreview || state.user.avatar || '';
    this.uploadError = state.uploadError;

    const contactMap = this.section.contact ?? [];
    this.personalEmail = this.extractValue(contactMap, 'email') ?? this.user.email ?? '';
    this.phoneNumber = this.extractValue(contactMap, 'phone');
    this.address = this.extractValue(contactMap, 'address');

    const academicMap = this.section.academics ?? [];
    this.platformLinks = this.extractArray(academicMap, 'platform') ?? [];
    this.studentId = this.extractValue(academicMap, 'student id');
    this.supportNeeds = this.extractArray(academicMap, 'support') ?? [];
    this.studentMail = this.user.email ?? this.personalEmail;

    this.contactEntries = this.buildContactCards();
    this.academicEntries = this.buildAcademicCards();
  }

  static create(section: ProfileSection, user: UserProfile) {
    return new ProfileModel({ section, user, isEditing: false, avatarPreview: user.avatar ?? '' });
  }

  refresh(section: ProfileSection, user: UserProfile) {
    return new ProfileModel({
      section,
      user,
      isEditing: this.isEditing,
      avatarPreview: user.avatar ?? this.avatarPreview,
      uploadError: this.uploadError,
    });
  }

  edit() {
    return this.clone({ isEditing: true });
  }

  confirm() {
    return this.clone({ isEditing: false });
  }

  toggleEditing() {
    return this.isEditing ? this.confirm() : this.edit();
  }

  withAvatarPreview(avatarPreview: string) {
    return this.clone({ avatarPreview });
  }

  withUploadError(uploadError?: string) {
    return this.clone({ uploadError });
  }

  clearUploadError() {
    return this.withUploadError(undefined);
  }

  get headerAbout() {
    return this.section.header.about;
  }

  get headerRole() {
    return this.section.header.role;
  }

  get contactCards() {
    return this.contactEntries;
  }

  get academicCards() {
    return this.academicEntries;
  }

  private buildContactCards(): ProfileContactCard[] {
    const cards: ProfileContactCard[] = (this.section.contact ?? []).map((item) => ({
      key: item.label,
      displayLabel: item.label.toLowerCase().includes('email') ? 'PERSONAL EMAIL ADDRESS' : item.label.toUpperCase(),
      value: item.value,
      editable: item.editable,
    }));

    if (this.platformLinks.length) {
      cards.push({
        key: 'platform-links',
        displayLabel: 'PLATFORM LINKS',
        value: this.platformLinks,
        editable: false,
      });
    }

    return cards;
  }

  private buildAcademicCards(): ProfileAcademicCard[] {
    const academics = this.section.academics ?? [];
    const withoutPlatform = academics
      .filter((item) => !item.label.toLowerCase().includes('platform'))
      .map<ProfileAcademicCard>((item) => ({
        key: item.label,
        displayLabel: item.label.toUpperCase(),
        value: item.value,
        type: item.type,
        locked: item.label.toLowerCase() === 'student id',
      }));

    const studentIdCard = withoutPlatform.find((card) => card.displayLabel === 'STUDENT ID');
    const rest = withoutPlatform.filter((card) => card.displayLabel !== 'STUDENT ID');

    const studentEmailCard: ProfileAcademicCard = {
      key: 'student-email-address',
      displayLabel: 'STUDENT EMAIL ADDRESS',
      value: this.studentMail,
      locked: true,
    };

    return [...(studentIdCard ? [studentIdCard] : []), studentEmailCard, ...rest];
  }

  private extractValue<T extends { label: string; value: string | string[] }>(collection: T[], keyword: string) {
    const entry = collection.find((item) => item.label.toLowerCase().includes(keyword.toLowerCase()));
    return typeof entry?.value === 'string' ? entry.value : undefined;
  }

  private extractArray<T extends { label: string; value: string | string[] }>(collection: T[], keyword: string) {
    const entry = collection.find((item) => item.label.toLowerCase().includes(keyword.toLowerCase()));
    return Array.isArray(entry?.value) ? entry?.value : undefined;
  }

  private clone(overrides: Partial<ProfileModelState>) {
    const hasUploadOverride = Object.prototype.hasOwnProperty.call(overrides, 'uploadError');
    return new ProfileModel({
      section: overrides.section ?? this.section,
      user: overrides.user ?? this.user,
      isEditing: overrides.isEditing ?? this.isEditing,
      avatarPreview: overrides.avatarPreview ?? this.avatarPreview,
      uploadError: hasUploadOverride ? overrides.uploadError : this.uploadError,
    });
  }
}
