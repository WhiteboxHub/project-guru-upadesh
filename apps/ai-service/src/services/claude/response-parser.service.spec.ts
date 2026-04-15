import { Test, TestingModule } from '@nestjs/testing';
import { ResponseParserService } from './response-parser.service';

describe('ResponseParserService', () => {
  let service: ResponseParserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ResponseParserService],
    }).compile();

    service = module.get<ResponseParserService>(ResponseParserService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('parseGeneratedQuestion', () => {
    it('should parse valid JSON response', () => {
      const response = JSON.stringify({
        question: 'What is your greatest strength?',
        evaluationCriteria: ['Relevance', 'Self-awareness'],
        suggestedTimeSeconds: 120,
        hints: ['Be specific', 'Give examples'],
      });

      const result = service.parseGeneratedQuestion(response);

      expect(result.question).toBe('What is your greatest strength?');
      expect(result.evaluationCriteria).toHaveLength(2);
      expect(result.suggestedTimeSeconds).toBe(120);
      expect(result.hints).toHaveLength(2);
    });

    it('should parse JSON with markdown code blocks', () => {
      const response = `\`\`\`json
{
  "question": "Tell me about yourself",
  "evaluationCriteria": ["Clarity"],
  "suggestedTimeSeconds": 180
}
\`\`\``;

      const result = service.parseGeneratedQuestion(response);

      expect(result.question).toBe('Tell me about yourself');
    });

    it('should throw error on invalid JSON', () => {
      const response = 'This is not JSON';

      expect(() => service.parseGeneratedQuestion(response)).toThrow();
    });
  });

  describe('parseAnswerEvaluation', () => {
    it('should parse evaluation response', () => {
      const response = JSON.stringify({
        score: 85,
        grade: 'B+',
        feedback: {
          strengths: ['Good structure'],
          weaknesses: ['Needs details'],
          suggestions: ['Add metrics'],
        },
        scoreBreakdown: {
          relevance: { score: 90, comment: 'Very relevant' },
          completeness: { score: 80, comment: 'Good detail' },
        },
      });

      const result = service.parseAnswerEvaluation(response);

      expect(result.score).toBe(85);
      expect(result.grade).toBe('B+');
      expect(result.feedback.strengths).toHaveLength(1);
      expect(result.scoreBreakdown).toHaveProperty('relevance');
    });

    it('should include STAR evaluation when present', () => {
      const response = JSON.stringify({
        score: 90,
        grade: 'A-',
        feedback: {
          strengths: [],
          weaknesses: [],
          suggestions: [],
        },
        scoreBreakdown: {},
        starEvaluation: {
          situation: { present: true, score: 90, comment: 'Clear context' },
          task: { present: true, score: 85, comment: 'Well defined' },
          action: { present: true, score: 95, comment: 'Detailed actions' },
          result: { present: true, score: 90, comment: 'Measurable outcome' },
        },
      });

      const result = service.parseAnswerEvaluation(response);

      expect(result.starEvaluation).toBeDefined();
      expect(result.starEvaluation?.situation.present).toBe(true);
    });

    it('should generate grade from score if not provided', () => {
      const response = JSON.stringify({
        score: 95,
        feedback: {
          strengths: [],
          weaknesses: [],
          suggestions: [],
        },
        scoreBreakdown: {},
      });

      const result = service.parseAnswerEvaluation(response);

      expect(result.grade).toBe('A');
    });
  });

  describe('parseResumeAnalysis', () => {
    it('should parse resume analysis response', () => {
      const response = JSON.stringify({
        atsScore: 78,
        overallScore: 82,
        summary: {
          strengths: ['Clear formatting'],
          weaknesses: ['Missing keywords'],
          missingElements: ['Cover letter'],
        },
        keywords: {
          present: ['JavaScript'],
          missing: ['TypeScript'],
          suggestions: ['Add frameworks'],
        },
        formatting: {
          score: 85,
          issues: ['Spacing'],
          recommendations: ['Consistent format'],
        },
        content: {
          score: 80,
          feedback: ['Good descriptions'],
          improvements: ['Add metrics'],
        },
        impact: {
          quantifiedAchievements: 5,
          actionVerbUsage: 75,
          suggestions: ['More action verbs'],
        },
      });

      const result = service.parseResumeAnalysis(response);

      expect(result.atsScore).toBe(78);
      expect(result.overallScore).toBe(82);
      expect(result.keywords.present).toContain('JavaScript');
      expect(result.impact.quantifiedAchievements).toBe(5);
    });

    it('should include job match when present', () => {
      const response = JSON.stringify({
        atsScore: 80,
        overallScore: 85,
        summary: { strengths: [], weaknesses: [], missingElements: [] },
        keywords: { present: [], missing: [], suggestions: [] },
        formatting: { score: 80, issues: [], recommendations: [] },
        content: { score: 80, feedback: [], improvements: [] },
        impact: { quantifiedAchievements: 0, actionVerbUsage: 0, suggestions: [] },
        jobMatch: {
          score: 88,
          matchedSkills: ['React', 'Node.js'],
          missingSkills: ['AWS'],
          recommendations: ['Add cloud experience'],
        },
      });

      const result = service.parseResumeAnalysis(response);

      expect(result.jobMatch).toBeDefined();
      expect(result.jobMatch?.score).toBe(88);
      expect(result.jobMatch?.matchedSkills).toHaveLength(2);
    });
  });

  describe('parseTextResponse', () => {
    it('should trim text response', () => {
      const response = '  This is a follow-up question?  \n';

      const result = service.parseTextResponse(response);

      expect(result).toBe('This is a follow-up question?');
    });
  });

  describe('scoreToGrade', () => {
    it('should convert scores to correct grades', () => {
      const testCases = [
        { score: 98, expected: 'A+' },
        { score: 95, expected: 'A' },
        { score: 90, expected: 'A-' },
        { score: 88, expected: 'B+' },
        { score: 85, expected: 'B' },
        { score: 80, expected: 'B-' },
        { score: 75, expected: 'C+' },
        { score: 70, expected: 'C-' },
        { score: 65, expected: 'D+' },
        { score: 50, expected: 'F' },
      ];

      testCases.forEach(({ score, expected }) => {
        const response = JSON.stringify({
          score,
          feedback: { strengths: [], weaknesses: [], suggestions: [] },
          scoreBreakdown: {},
        });

        const result = service.parseAnswerEvaluation(response);
        expect(result.grade).toBe(expected);
      });
    });
  });

  describe('validateScore', () => {
    it('should normalize scores to 0-100 range', () => {
      const testScores = [
        { input: 150, expected: 100 },
        { input: -10, expected: 0 },
        { input: 85.7, expected: 86 },
        { input: 50, expected: 50 },
      ];

      testScores.forEach(({ input, expected }) => {
        const response = JSON.stringify({
          score: input,
          feedback: { strengths: [], weaknesses: [], suggestions: [] },
          scoreBreakdown: {},
        });

        const result = service.parseAnswerEvaluation(response);
        expect(result.score).toBe(expected);
      });
    });
  });

  describe('cleanJsonResponse', () => {
    it('should remove markdown code blocks', () => {
      const response = '```json\n{"key": "value"}\n```';

      const result = service.parseTextResponse(response);

      expect(result).not.toContain('```');
    });

    it('should extract JSON from mixed content', () => {
      const response = 'Here is the response:\n{"question": "Test"}\nEnd of response';

      const result = service['extractJsonFromResponse'](response);

      expect(result).toBe('{"question": "Test"}');
    });
  });
});
