/**
 * @fileoverview GitHub OAuth Strategy
 * @description Implements GitHub OAuth authentication
 */

import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-github2';
import { ConfigService } from '@nestjs/config';
import { AuthService } from '../auth.service';

@Injectable()
export class GithubStrategy extends PassportStrategy(Strategy, 'github') {
  constructor(
    private configService: ConfigService,
    private authService: AuthService,
  ) {
    super({
      clientID: configService.get<string>('GITHUB_CLIENT_ID'),
      clientSecret: configService.get<string>('GITHUB_CLIENT_SECRET'),
      callbackURL: configService.get<string>('GITHUB_CALLBACK_URL', 'http://localhost/api/auth/github/callback'),
      scope: ['user:email'],
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: any,
  ): Promise<any> {
    const { id, username, displayName, emails, photos } = profile;
    
    const user = {
      provider: 'github',
      providerId: id,
      email: emails[0]?.value || `${username}@github.com`,
      username: username,
      displayName: displayName || username,
      avatarUrl: photos[0]?.value || null,
    };

    done(null, user);
  }
}
<!-- github -->
