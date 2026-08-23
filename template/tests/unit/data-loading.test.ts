import { describe, it, expect } from 'vitest';
import {
  getBranding,
  getFormConfig,
  getActiveSendGridProfile,
  type FormConfig,
} from '@/utils/data';

describe('getFormConfig()', () => {
  it('returns an object with activeProfile and profiles', () => {
    const config = getFormConfig();
    expect(config).toHaveProperty('activeProfile');
    expect(config).toHaveProperty('profiles');
    expect(typeof config.activeProfile).toBe('string');
    expect(typeof config.profiles).toBe('object');
  });

  it('has both test and production profiles', () => {
    const config = getFormConfig();
    expect(config.profiles).toHaveProperty('test');
    expect(config.profiles).toHaveProperty('production');
  });

  it('each profile has toEmail, fromEmail, fromName', () => {
    const config = getFormConfig();
    for (const [name, profile] of Object.entries(config.profiles)) {
      expect(profile, `profile "${name}"`).toHaveProperty('toEmail');
      expect(profile, `profile "${name}"`).toHaveProperty('fromEmail');
      expect(profile, `profile "${name}"`).toHaveProperty('fromName');
    }
  });

  it('test profile uses example.com placeholder addresses', () => {
    const config = getFormConfig();
    const test = config.profiles['test'];
    expect(test.fromEmail).toBe('noreply@example.com');
    expect(test.toEmail).toContain('you@example.com');
  });

  it('production profile uses example.com addresses', () => {
    const config = getFormConfig();
    const prod = config.profiles['production'];
    expect(prod.fromEmail).toBe('noreply@example.com');
    expect(prod.toEmail).toContain('info@example.com');
  });
});

describe('getActiveSendGridProfile()', () => {
  it('resolves the active profile from config', () => {
    const config = getFormConfig();
    const profile = getActiveSendGridProfile(config);
    expect(profile).toHaveProperty('toEmail');
    expect(profile).toHaveProperty('fromEmail');
    expect(profile).toHaveProperty('fromName');
  });

  it('returns test profile when activeProfile is "test"', () => {
    const config: FormConfig = {
      activeProfile: 'test',
      profiles: {
        test: { toEmail: ['a@b.com'], fromEmail: 'from@b.com', fromName: 'Test' },
        production: { toEmail: ['c@d.com'], fromEmail: 'from@d.com', fromName: 'Prod' },
      },
    };
    const profile = getActiveSendGridProfile(config);
    expect(profile.fromEmail).toBe('from@b.com');
  });

  it('returns production profile when activeProfile is "production"', () => {
    const config: FormConfig = {
      activeProfile: 'production',
      profiles: {
        test: { toEmail: ['a@b.com'], fromEmail: 'from@b.com', fromName: 'Test' },
        production: { toEmail: ['c@d.com'], fromEmail: 'from@d.com', fromName: 'Prod' },
      },
    };
    const profile = getActiveSendGridProfile(config);
    expect(profile.fromEmail).toBe('from@d.com');
  });

  it('throws on unknown profile name', () => {
    const config: FormConfig = {
      activeProfile: 'nonexistent',
      profiles: {
        test: { toEmail: ['a@b.com'], fromEmail: 'from@b.com', fromName: 'Test' },
      },
    };
    expect(() => getActiveSendGridProfile(config)).toThrow('Unknown SendGrid profile');
  });
});

describe('getBranding()', () => {
  it('returns branding without sendgrid property', () => {
    const branding = getBranding();
    expect(branding).not.toHaveProperty('sendgrid');
  });

  it('still has core branding properties', () => {
    const branding = getBranding();
    expect(branding).toHaveProperty('companyName');
    expect(branding).toHaveProperty('phone');
    expect(branding).toHaveProperty('website');
    expect(branding).toHaveProperty('email');
    expect(branding).toHaveProperty('seo');
    expect(branding).toHaveProperty('theme');
  });
});
