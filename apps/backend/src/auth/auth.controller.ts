import { Body, Controller, Post, UseGuards, Request, HttpCode } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { SupabaseService } from '../supabase/supabase.service';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly supabaseService: SupabaseService,
  ) {}

  @Post('register')
  @ApiOperation({ summary: 'Register a new user' })
  async register(@Body() dto: RegisterDto) {
    return this.authService.register(
      dto.email, dto.password, dto.fullName,
      dto.nationalId, dto.walletAddress,
    );
  }

  @Post('login')
  @HttpCode(200)
  @UseGuards(AuthGuard('local'))
  @ApiOperation({ summary: 'Login and receive JWT' })
  async login(@Request() req: any) {
    return this.authService.login(req.user);
  }

  @Post('confirm-email')
  @HttpCode(200)
  @ApiOperation({ summary: 'Auto-confirm user email (called after signup)' })
  async confirmEmail(@Body() body: { userId?: string; email?: string }) {
    // Try by userId first, then by email
    if (body.userId) {
      const confirmed = await this.supabaseService.confirmEmail(body.userId, body.email);
      return { success: confirmed };
    }

    if (body.email) {
      const confirmed = await this.supabaseService.confirmEmailByEmail(body.email);
      return { success: confirmed };
    }

    return { success: false, error: 'userId or email required' };
  }
}
