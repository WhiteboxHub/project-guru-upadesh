import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { InterviewsService } from './interviews.service';
import { JwtAuthGuard } from '../../common/guards/jwt.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Interviews')
@Controller({ path: 'interviews', version: '1' })
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class InterviewsController {
  constructor(private readonly interviewsService: InterviewsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all interviews for current user' })
  @ApiResponse({ status: 200, description: 'Interviews retrieved successfully' })
  findAll(@CurrentUser('userId') userId: string) {
    return this.interviewsService.findAll(userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get interview by ID' })
  @ApiResponse({ status: 200, description: 'Interview retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Interview not found' })
  findOne(@Param('id') id: string) {
    return this.interviewsService.findOne(id);
  }
}
