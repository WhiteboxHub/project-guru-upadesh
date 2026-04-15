import {
  Controller,
  Get,
  Param,
  Query,
  UseGuards,
  DefaultValuePipe,
  ParseIntPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { QuestionsService } from './questions.service';
import { JwtAuthGuard } from '../../common/guards/jwt.guard';

@ApiTags('Questions')
@Controller({ path: 'questions', version: '1' })
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class QuestionsController {
  constructor(private readonly questionsService: QuestionsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all questions' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 20 })
  @ApiResponse({ status: 200, description: 'Questions retrieved successfully' })
  findAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
  ) {
    return this.questionsService.findAll(page, limit);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get question by ID' })
  @ApiResponse({ status: 200, description: 'Question retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Question not found' })
  findOne(@Param('id') id: string) {
    return this.questionsService.findOne(id);
  }
}
