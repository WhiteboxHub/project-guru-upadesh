import { Injectable } from '@nestjs/common';
import { QuestionCategory, DifficultyLevel } from '@dto/generate-question.dto';

@Injectable()
export class PromptBuilderService {
  /**
   * Build prompt for generating interview questions
   */
  buildInterviewQuestionPrompt(
    category: QuestionCategory,
    difficulty: DifficultyLevel,
    context?: {
      company?: string;
      role?: string;
      industry?: string;
      yearsOfExperience?: number;
    },
  ): string {
    const contextInfo = this.buildContextString(context);
    const categoryGuidance = this.getCategoryGuidance(category);
    const difficultyGuidance = this.getDifficultyGuidance(difficulty);

    return `You are an expert interviewer creating high-quality interview questions.

Generate a single ${difficulty} ${category} interview question${contextInfo}.

${categoryGuidance}

${difficultyGuidance}

Requirements:
1. The question should be clear, specific, and realistic
2. Appropriate for the specified difficulty level
3. Should allow for comprehensive answers
4. Avoid overly generic or vague questions

Provide your response in the following JSON format:
{
  "question": "The interview question",
  "evaluationCriteria": ["criterion1", "criterion2", "criterion3"],
  "suggestedTimeSeconds": 180,
  "hints": ["hint1", "hint2"]
}

Focus on creating a single, well-crafted question that will effectively assess the candidate's skills and experience.`;
  }

  /**
   * Build prompt for evaluating candidate answers
   */
  buildAnswerEvaluationPrompt(
    question: string,
    answer: string,
    category: QuestionCategory,
    context?: {
      role?: string;
      company?: string;
      yearsOfExperience?: number;
    },
  ): string {
    const contextInfo = this.buildContextString(context);
    const isBehavioral = category === QuestionCategory.BEHAVIORAL || category === QuestionCategory.SITUATIONAL;

    const starSection = isBehavioral
      ? `
STAR Method Evaluation (for behavioral questions):
- Situation: Did they describe the context clearly?
- Task: Did they explain their responsibility?
- Action: Did they detail specific actions taken?
- Result: Did they share measurable outcomes?

Provide STAR evaluation in this format:
"starEvaluation": {
  "situation": { "present": true/false, "score": 0-100, "comment": "..." },
  "task": { "present": true/false, "score": 0-100, "comment": "..." },
  "action": { "present": true/false, "score": 0-100, "comment": "..." },
  "result": { "present": true/false, "score": 0-100, "comment": "..." }
}`
      : '';

    return `You are an expert interviewer evaluating a candidate's answer${contextInfo}.

Question: "${question}"
Category: ${category}

Candidate's Answer:
"${answer}"

Evaluate this answer comprehensively on a scale of 0-100.

Evaluation Criteria:
1. Relevance: Does the answer address the question directly?
2. Completeness: Is the answer thorough and detailed?
3. Clarity: Is the answer well-structured and easy to understand?
4. Specificity: Does the answer include specific examples and details?
5. Professionalism: Is the tone and language appropriate?
${isBehavioral ? '6. STAR Method: Does it follow the Situation-Task-Action-Result structure?' : ''}

${starSection}

Provide your evaluation in the following JSON format:
{
  "score": 0-100,
  "grade": "A+/A/B+/B/C+/C/D/F",
  "feedback": {
    "strengths": ["strength1", "strength2"],
    "weaknesses": ["weakness1", "weakness2"],
    "suggestions": ["suggestion1", "suggestion2"]
  },
  "scoreBreakdown": {
    "relevance": { "score": 0-100, "comment": "..." },
    "completeness": { "score": 0-100, "comment": "..." },
    "clarity": { "score": 0-100, "comment": "..." },
    "specificity": { "score": 0-100, "comment": "..." },
    "professionalism": { "score": 0-100, "comment": "..." }
  }${isBehavioral ? ',\n  "starEvaluation": { ... }' : ''}
}

Be constructive, specific, and actionable in your feedback.`;
  }

  /**
   * Build prompt for follow-up question generation
   */
  buildFollowUpPrompt(question: string, answer: string): string {
    return `Based on the following interview exchange, generate a thoughtful follow-up question to dig deeper.

Original Question: "${question}"

Candidate's Answer: "${answer}"

Generate a follow-up question that:
1. Explores an interesting point from their answer
2. Probes for more specific details or examples
3. Tests deeper understanding or critical thinking
4. Is natural and conversational

Provide your response as a single follow-up question (no JSON, just the question text).`;
  }

  /**
   * Build prompt for resume analysis
   */
  buildResumeAnalysisPrompt(
    resumeText: string,
    jobDescription?: string,
    targetIndustry?: string,
    targetRole?: string,
  ): string {
    const jobMatchSection = jobDescription
      ? `
Job Description for Matching:
"${jobDescription}"

Provide detailed job match analysis including:
- Match score (0-100)
- Matched skills and experience
- Missing required skills
- Recommendations to better align with this role
`
      : '';

    const targetInfo =
      targetIndustry || targetRole
        ? `\nTarget Industry: ${targetIndustry || 'Not specified'}
Target Role: ${targetRole || 'Not specified'}`
        : '';

    return `You are an expert resume reviewer and career advisor. Analyze the following resume comprehensively.
${targetInfo}

Resume Content:
"""
${resumeText}
"""

${jobMatchSection}

Provide a comprehensive analysis covering:

1. ATS Compatibility (0-100 score)
   - Formatting issues that might break ATS systems
   - Keyword optimization
   - Section structure

2. Overall Quality (0-100 score)
   - Content quality and relevance
   - Achievement quantification
   - Action verb usage
   - Professional presentation

3. Strengths and Weaknesses
   - What works well
   - What needs improvement
   - Missing elements

4. Keyword Analysis
   - Present relevant keywords
   - Missing important keywords
   - Suggestions for optimization

5. Formatting and Structure
   - Issues with current formatting
   - Recommendations for improvement

6. Content Quality
   - Impact of descriptions
   - Use of metrics and achievements
   - Specific improvements needed

Provide your analysis in the following JSON format:
{
  "atsScore": 0-100,
  "overallScore": 0-100,
  "summary": {
    "strengths": ["strength1", "strength2"],
    "weaknesses": ["weakness1", "weakness2"],
    "missingElements": ["element1", "element2"]
  },
  "keywords": {
    "present": ["keyword1", "keyword2"],
    "missing": ["keyword1", "keyword2"],
    "suggestions": ["suggestion1", "suggestion2"]
  },
  "formatting": {
    "score": 0-100,
    "issues": ["issue1", "issue2"],
    "recommendations": ["rec1", "rec2"]
  },
  "content": {
    "score": 0-100,
    "feedback": ["feedback1", "feedback2"],
    "improvements": ["improvement1", "improvement2"]
  },
  "impact": {
    "quantifiedAchievements": number,
    "actionVerbUsage": number (0-100),
    "suggestions": ["suggestion1", "suggestion2"]
  }${
    jobDescription
      ? `,
  "jobMatch": {
    "score": 0-100,
    "matchedSkills": ["skill1", "skill2"],
    "missingSkills": ["skill1", "skill2"],
    "recommendations": ["rec1", "rec2"]
  }`
      : ''
  }
}

Be specific, actionable, and constructive in your feedback.`;
  }

  /**
   * Build prompt for generating comprehensive interview feedback
   */
  buildInterviewFeedbackPrompt(
    interviewData: Array<{
      question: string;
      answer: string;
      category: string;
      score: number;
    }>,
    overallScore?: number,
    targetRole?: string,
  ): string {
    const roleContext = targetRole ? ` for a ${targetRole} position` : '';
    const interviewSummary = interviewData
      .map(
        (item, idx) => `
Q${idx + 1} [${item.category}, Score: ${item.score}]:
Question: "${item.question}"
Answer: "${item.answer}"
`,
      )
      .join('\n');

    return `You are an expert interview coach providing comprehensive feedback${roleContext}.

Interview Performance Summary:
Overall Score: ${overallScore || 'Not calculated'}

Interview Questions and Answers:
${interviewSummary}

Provide comprehensive feedback that:
1. Summarizes overall performance
2. Identifies key strengths demonstrated
3. Highlights areas needing improvement
4. Provides specific, actionable recommendations
5. Breaks down performance by question category
6. Suggests concrete next steps for improvement

Provide your feedback in the following JSON format:
{
  "summary": {
    "overallScore": 0-100,
    "grade": "A+/A/B+/B/C+/C/D/F",
    "performance": "brief overall assessment"
  },
  "strengths": ["strength1", "strength2", "strength3"],
  "areasForImprovement": ["area1", "area2", "area3"],
  "recommendations": ["specific recommendation1", "specific recommendation2"],
  "categoryBreakdown": [
    {
      "category": "category name",
      "score": 0-100,
      "feedback": "specific feedback for this category"
    }
  ],
  "nextSteps": ["actionable step1", "actionable step2", "actionable step3"]
}

Be encouraging yet honest, specific yet concise, and always actionable.`;
  }

  /**
   * Build context string from context object
   */
  private buildContextString(context?: {
    company?: string;
    role?: string;
    industry?: string;
    yearsOfExperience?: number;
  }): string {
    if (!context) return '';

    const parts: string[] = [];
    if (context.role) parts.push(`for a ${context.role} position`);
    if (context.company) parts.push(`at ${context.company}`);
    if (context.industry) parts.push(`in the ${context.industry} industry`);
    if (context.yearsOfExperience)
      parts.push(`(candidate has ${context.yearsOfExperience} years of experience)`);

    return parts.length > 0 ? ' ' + parts.join(' ') : '';
  }

  /**
   * Get category-specific guidance
   */
  private getCategoryGuidance(category: QuestionCategory): string {
    const guidance: Record<QuestionCategory, string> = {
      [QuestionCategory.BEHAVIORAL]: `This is a BEHAVIORAL question. Focus on:
- Past experiences and real situations
- How the candidate handled specific scenarios
- Use the STAR method framework (Situation, Task, Action, Result)
- Personal qualities, soft skills, and decision-making`,

      [QuestionCategory.TECHNICAL]: `This is a TECHNICAL question. Focus on:
- Technical knowledge and expertise
- Problem-solving approach
- Understanding of concepts and best practices
- Practical application of technical skills`,

      [QuestionCategory.SYSTEM_DESIGN]: `This is a SYSTEM DESIGN question. Focus on:
- Architecture and scalability
- Trade-offs and decision-making
- System components and interactions
- Performance, reliability, and maintainability considerations`,

      [QuestionCategory.CODING]: `This is a CODING question. Focus on:
- Algorithm and data structure knowledge
- Code efficiency and optimization
- Problem-solving approach
- Edge cases and testing`,

      [QuestionCategory.CASE_STUDY]: `This is a CASE STUDY question. Focus on:
- Analytical thinking and problem-solving
- Business acumen and strategic thinking
- Structured approach to complex problems
- Practical recommendations`,

      [QuestionCategory.SITUATIONAL]: `This is a SITUATIONAL question. Focus on:
- Hypothetical scenarios and how they would respond
- Decision-making process and priorities
- Problem-solving approach
- Values and work style`,
    };

    return guidance[category];
  }

  /**
   * Get difficulty-specific guidance
   */
  private getDifficultyGuidance(difficulty: DifficultyLevel): string {
    const guidance: Record<DifficultyLevel, string> = {
      [DifficultyLevel.EASY]: `EASY difficulty level:
- Suitable for entry-level or junior candidates
- Focus on fundamental concepts and basic scenarios
- Straightforward with clear expectations
- Should take 2-3 minutes to answer`,

      [DifficultyLevel.MEDIUM]: `MEDIUM difficulty level:
- Suitable for mid-level candidates
- Requires deeper thinking and more specific examples
- May involve multiple considerations or trade-offs
- Should take 3-5 minutes to answer`,

      [DifficultyLevel.HARD]: `HARD difficulty level:
- Suitable for senior-level candidates
- Requires complex problem-solving and deep expertise
- May involve ambiguity or multiple valid approaches
- Should take 5-7 minutes to answer`,
    };

    return guidance[difficulty];
  }
}
