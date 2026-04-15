# AI Service API Examples

Complete examples for all API endpoints with various scenarios.

## Base URL

```
http://localhost:3002/api/v1
```

## Authentication

Currently no authentication required. In production, implement API key authentication in the main API service before calling this microservice.

---

## 1. Generate Interview Question

### Endpoint
```
POST /ai/generate-question
```

### Basic Example - Behavioral Question
```bash
curl -X POST http://localhost:3002/api/v1/ai/generate-question \
  -H "Content-Type: application/json" \
  -d '{
    "category": "behavioral",
    "difficulty": "medium"
  }'
```

**Response:**
```json
{
  "question": "Tell me about a time when you had to deal with a difficult team member. How did you handle the situation?",
  "category": "behavioral",
  "difficulty": "medium",
  "suggestedTimeSeconds": 180,
  "evaluationCriteria": [
    "STAR method structure",
    "Conflict resolution approach",
    "Communication skills",
    "Professional maturity",
    "Outcome and learning"
  ],
  "hints": [
    "Use the STAR method (Situation, Task, Action, Result)",
    "Focus on your specific actions and approach",
    "Include measurable outcomes if possible"
  ]
}
```

### Company-Specific Technical Question
```bash
curl -X POST http://localhost:3002/api/v1/ai/generate-question \
  -H "Content-Type: application/json" \
  -d '{
    "category": "technical",
    "difficulty": "hard",
    "company": "Google",
    "role": "Senior Software Engineer",
    "industry": "Tech",
    "yearsOfExperience": 7
  }'
```

### System Design Question
```bash
curl -X POST http://localhost:3002/api/v1/ai/generate-question \
  -H "Content-Type: application/json" \
  -d '{
    "category": "system_design",
    "difficulty": "hard",
    "role": "Principal Engineer"
  }'
```

### Coding Question
```bash
curl -X POST http://localhost:3002/api/v1/ai/generate-question \
  -H "Content-Type: application/json" \
  -d '{
    "category": "coding",
    "difficulty": "medium"
  }'
```

---

## 2. Evaluate Answer

### Endpoint
```
POST /ai/evaluate-answer
```

### Behavioral Answer Evaluation (with STAR)
```bash
curl -X POST http://localhost:3002/api/v1/ai/evaluate-answer \
  -H "Content-Type: application/json" \
  -d '{
    "question": "Tell me about a time when you had to deal with a difficult team member.",
    "answer": "In my previous role as a team lead, we had a developer who consistently missed deadlines and was unresponsive in meetings (Situation). My responsibility was to ensure project delivery while maintaining team morale (Task). I scheduled one-on-one meetings to understand their challenges, discovered they were dealing with personal issues, and worked with them to adjust timelines and provide support (Action). As a result, their performance improved significantly, they became more engaged, and we delivered the project only one week behind schedule instead of the anticipated month delay (Result).",
    "category": "behavioral",
    "context": {
      "role": "Team Lead",
      "yearsOfExperience": 5
    }
  }'
```

**Response:**
```json
{
  "score": 88,
  "grade": "B+",
  "feedback": {
    "strengths": [
      "Excellent use of STAR method structure",
      "Shows empathy and leadership qualities",
      "Quantified the positive outcome",
      "Demonstrates problem-solving approach"
    ],
    "weaknesses": [
      "Could provide more details about the support mechanisms provided",
      "Could mention follow-up actions or lessons learned"
    ],
    "suggestions": [
      "Add specific examples of the adjustments made to timelines",
      "Mention any preventive measures put in place for the future",
      "Could elaborate on how this experience influenced your leadership style"
    ]
  },
  "scoreBreakdown": {
    "relevance": {
      "score": 95,
      "comment": "Directly addresses the question about dealing with difficult team members"
    },
    "completeness": {
      "score": 85,
      "comment": "Comprehensive answer covering all aspects, could add more depth"
    },
    "clarity": {
      "score": 90,
      "comment": "Well-structured and easy to follow"
    },
    "specificity": {
      "score": 82,
      "comment": "Good specific details, could add more about support mechanisms"
    },
    "professionalism": {
      "score": 92,
      "comment": "Demonstrates mature and professional approach"
    }
  },
  "starEvaluation": {
    "situation": {
      "present": true,
      "score": 90,
      "comment": "Clear context about the role and the challenge"
    },
    "task": {
      "present": true,
      "score": 85,
      "comment": "Responsibility clearly stated"
    },
    "action": {
      "present": true,
      "score": 88,
      "comment": "Specific actions taken, could be more detailed"
    },
    "result": {
      "present": true,
      "score": 90,
      "comment": "Quantified outcome with clear improvement"
    }
  }
}
```

### Technical Answer Evaluation
```bash
curl -X POST http://localhost:3002/api/v1/ai/evaluate-answer \
  -H "Content-Type: application/json" \
  -d '{
    "question": "Explain the difference between SQL and NoSQL databases and when you would use each.",
    "answer": "SQL databases are relational and use structured schemas with ACID properties. NoSQL databases are non-relational and more flexible. I use SQL for transactions and complex queries, and NoSQL for high scalability and flexibility.",
    "category": "technical"
  }'
```

### Short/Incomplete Answer
```bash
curl -X POST http://localhost:3002/api/v1/ai/evaluate-answer \
  -H "Content-Type: application/json" \
  -d '{
    "question": "Tell me about a challenging project you worked on.",
    "answer": "I worked on a hard project and it was successful.",
    "category": "behavioral"
  }'
```

---

## 3. Generate Follow-up Question

### Endpoint
```
POST /ai/generate-followup
```

### Example
```bash
curl -X POST http://localhost:3002/api/v1/ai/generate-followup \
  -H "Content-Type: application/json" \
  -d '{
    "question": "Tell me about a time you had to learn a new technology quickly.",
    "answer": "I had to learn Kubernetes in two weeks for a production deployment. I took online courses, built test clusters, and worked with our DevOps team. We successfully migrated our services with zero downtime."
  }'
```

**Response:**
```json
{
  "followUpQuestion": "That sounds like an impressive achievement. Can you walk me through the specific challenges you faced during the Kubernetes migration and how you overcame them?"
}
```

### Technical Deep Dive
```bash
curl -X POST http://localhost:3002/api/v1/ai/generate-followup \
  -H "Content-Type: application/json" \
  -d '{
    "question": "How would you design a URL shortener?",
    "answer": "I would use a hash function to generate short codes, store mappings in a database, and use caching for frequent URLs."
  }'
```

---

## 4. Analyze Resume

### Endpoint
```
POST /ai/analyze-resume
```

### Basic Resume Analysis
```bash
curl -X POST http://localhost:3002/api/v1/ai/analyze-resume \
  -H "Content-Type: application/json" \
  -d '{
    "resumeText": "John Doe\nSenior Software Engineer\n\nEXPERIENCE:\n\nSenior Software Engineer | Tech Corp | 2020-2023\n- Led development of microservices architecture serving 1M+ users\n- Improved system performance by 40% through optimization\n- Mentored team of 5 junior developers\n- Implemented CI/CD pipelines reducing deployment time by 60%\n\nSoftware Engineer | StartupXYZ | 2018-2020\n- Developed full-stack web applications using React and Node.js\n- Collaborated with product team to define features\n- Reduced page load time by 50%\n\nEDUCATION:\nB.S. Computer Science | University of Tech | 2018\n\nSKILLS:\nJavaScript, TypeScript, React, Node.js, Python, AWS, Docker, Kubernetes, PostgreSQL, MongoDB",
    "targetIndustry": "Technology",
    "targetRole": "Senior Software Engineer"
  }'
```

**Response:**
```json
{
  "atsScore": 82,
  "overallScore": 85,
  "summary": {
    "strengths": [
      "Strong quantified achievements (1M+ users, 40% improvement)",
      "Clear career progression from Software Engineer to Senior",
      "Relevant technical skills for target role",
      "Leadership experience (mentoring)",
      "Good use of action verbs"
    ],
    "weaknesses": [
      "Education section could be more detailed",
      "Missing certifications or continuous learning",
      "Could benefit from a professional summary",
      "No mention of soft skills"
    ],
    "missingElements": [
      "Professional summary/objective",
      "Certifications",
      "Projects or open source contributions",
      "Awards or recognition"
    ]
  },
  "keywords": {
    "present": [
      "microservices",
      "React",
      "Node.js",
      "AWS",
      "Docker",
      "Kubernetes",
      "CI/CD",
      "full-stack",
      "mentoring"
    ],
    "missing": [
      "agile",
      "scrum",
      "system design",
      "API design",
      "testing",
      "Git"
    ],
    "suggestions": [
      "Add 'Agile/Scrum methodology' to experience",
      "Include 'API design and development'",
      "Mention testing frameworks used",
      "Add 'Git version control'"
    ]
  },
  "formatting": {
    "score": 88,
    "issues": [
      "Inconsistent spacing between sections",
      "Could use bullet points more effectively"
    ],
    "recommendations": [
      "Add consistent spacing between all sections",
      "Use bullet points for all achievements",
      "Consider adding section dividers",
      "Ensure consistent date formatting"
    ]
  },
  "content": {
    "score": 83,
    "feedback": [
      "Strong quantified achievements in experience section",
      "Good progression of responsibilities",
      "Technical skills are relevant and current"
    ],
    "improvements": [
      "Add more context to each achievement",
      "Include the scale/scope of projects",
      "Mention technologies used for each achievement",
      "Add more recent accomplishments if available"
    ]
  },
  "impact": {
    "quantifiedAchievements": 5,
    "actionVerbUsage": 78,
    "suggestions": [
      "Continue using strong action verbs like 'Led', 'Improved', 'Implemented'",
      "Add more metrics where possible (e.g., team size, budget, user numbers)",
      "Quantify the impact of mentoring (e.g., retention rate, promotion rate)"
    ]
  }
}
```

### Resume Analysis with Job Description
```bash
curl -X POST http://localhost:3002/api/v1/ai/analyze-resume \
  -H "Content-Type: application/json" \
  -d '{
    "resumeText": "...[full resume text]...",
    "jobDescription": "We are seeking a Senior Software Engineer with 5+ years of experience in microservices, AWS, and team leadership. Must have strong experience with React, Node.js, and CI/CD pipelines. Experience with system design and mentoring junior developers is essential.",
    "targetRole": "Senior Software Engineer"
  }'
```

**Additional in Response:**
```json
{
  "jobMatch": {
    "score": 88,
    "matchedSkills": [
      "5+ years experience (meets requirement)",
      "Microservices architecture (strong match)",
      "AWS (direct match)",
      "Team leadership/mentoring (direct match)",
      "React and Node.js (direct match)",
      "CI/CD pipelines (direct match)"
    ],
    "missingSkills": [
      "System design not explicitly mentioned",
      "Could emphasize leadership experience more"
    ],
    "recommendations": [
      "Add a 'System Design' section or mention system design projects",
      "Expand on leadership experience with specific examples",
      "Consider adding a summary that directly addresses the job requirements",
      "Highlight AWS-specific services used (EC2, S3, Lambda, etc.)"
    ]
  }
}
```

---

## 5. Generate Interview Feedback

### Endpoint
```
POST /ai/generate-feedback
```

### Complete Interview Feedback
```bash
curl -X POST http://localhost:3002/api/v1/ai/generate-feedback \
  -H "Content-Type: application/json" \
  -d '{
    "interviewData": [
      {
        "question": "Tell me about yourself.",
        "answer": "I am a software engineer with 5 years of experience, specializing in full-stack development with React and Node.js. I have worked at both startups and large companies, leading teams and building scalable systems.",
        "category": "behavioral",
        "score": 82
      },
      {
        "question": "Describe a challenging project you worked on.",
        "answer": "I led the migration of a monolithic application to microservices, which involved coordinating with multiple teams, designing the architecture, and ensuring zero downtime during the transition. We successfully completed it in 6 months.",
        "category": "behavioral",
        "score": 85
      },
      {
        "question": "How would you design a scalable URL shortener?",
        "answer": "I would use a hash function for generating short codes, implement a distributed caching layer for frequently accessed URLs, use database sharding for scalability, and implement rate limiting to prevent abuse.",
        "category": "system_design",
        "score": 78
      },
      {
        "question": "What is your experience with CI/CD?",
        "answer": "I have set up CI/CD pipelines using GitHub Actions and Jenkins, automated testing, and implemented deployment strategies including blue-green and canary deployments.",
        "category": "technical",
        "score": 80
      }
    ],
    "overallScore": 81,
    "interviewDuration": 45,
    "targetRole": "Senior Software Engineer"
  }'
```

**Response:**
```json
{
  "summary": {
    "overallScore": 81,
    "grade": "B",
    "performance": "Strong performance with good technical knowledge and communication skills. Shows solid experience in system design and team leadership. Some areas could benefit from more depth and specific examples."
  },
  "strengths": [
    "Clear and confident communication style",
    "Strong technical background in full-stack development",
    "Demonstrated leadership experience with team coordination",
    "Good understanding of modern architecture patterns (microservices, CI/CD)",
    "Able to articulate complex technical concepts clearly",
    "Practical experience with scalability challenges"
  ],
  "areasForImprovement": [
    "Provide more specific metrics and quantifiable results",
    "Use STAR method more consistently in behavioral questions",
    "Deeper technical details in system design answers",
    "Include more information about decision-making rationale",
    "Discuss trade-offs more explicitly in technical answers",
    "Provide more context about team size and project scope"
  ],
  "recommendations": [
    "Practice structuring behavioral answers using the STAR method (Situation, Task, Action, Result)",
    "Prepare specific metrics for past achievements (performance improvements, user growth, etc.)",
    "Deepen knowledge of distributed systems concepts for system design questions",
    "When discussing technical solutions, always mention trade-offs and alternatives considered",
    "Prepare examples that demonstrate both technical and leadership skills",
    "Practice explaining technical concepts to different audience levels"
  ],
  "categoryBreakdown": [
    {
      "category": "behavioral",
      "score": 84,
      "feedback": "Strong performance in behavioral questions. Good experience articulation, but could benefit from more structured STAR format and specific metrics. Leadership experience is evident."
    },
    {
      "category": "system_design",
      "score": 78,
      "feedback": "Solid understanding of system design principles. Covered key components like caching, sharding, and rate limiting. Could improve by discussing scalability numbers, failure scenarios, and more detailed trade-off analysis."
    },
    {
      "category": "technical",
      "score": 80,
      "feedback": "Good practical knowledge of CI/CD tools and deployment strategies. Demonstrates hands-on experience. Could enhance by discussing specific challenges faced and how they were overcome."
    }
  ],
  "nextSteps": [
    "Review common system design patterns and practice with scalability scenarios",
    "Prepare 5-7 STAR-formatted stories covering different competencies (leadership, conflict resolution, innovation)",
    "Research the company's tech stack and prepare relevant examples",
    "Practice whiteboard coding and system design exercises",
    "Prepare questions to ask the interviewer about team, culture, and growth opportunities",
    "Review your past projects and quantify your impact with specific metrics"
  ]
}
```

---

## 6. Health Check

### Endpoint
```
GET /ai/health
```

### Example
```bash
curl http://localhost:3002/api/v1/ai/health
```

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2024-04-14T10:30:00.000Z",
  "service": "ai-service",
  "ai": {
    "status": "healthy",
    "model": "claude-3-5-sonnet-20241022",
    "circuitBreakerState": "CLOSED"
  },
  "cache": {
    "enabled": true,
    "connected": true,
    "keyCount": 42
  },
  "tokens": {
    "totalOperations": 150,
    "totalTokens": 75000,
    "estimatedTotalCost": 0.45
  }
}
```

---

## 7. Statistics

### Endpoint
```
GET /ai/stats
```

### Example
```bash
curl http://localhost:3002/api/v1/ai/stats
```

**Response:**
```json
{
  "tokenUsage": {
    "totalOperations": 150,
    "totalInputTokens": 45000,
    "totalOutputTokens": 30000,
    "totalTokens": 75000,
    "estimatedTotalCost": 0.585,
    "operationBreakdown": {
      "generate_question": {
        "count": 50,
        "totalTokens": 20000,
        "estimatedCost": 0.15
      },
      "evaluate_answer": {
        "count": 75,
        "totalTokens": 40000,
        "estimatedCost": 0.35
      },
      "analyze_resume": {
        "count": 25,
        "totalTokens": 15000,
        "estimatedCost": 0.085
      }
    }
  },
  "cacheStats": {
    "enabled": true,
    "connected": true,
    "keyCount": 42
  }
}
```

---

## Error Responses

### Validation Error (400)
```json
{
  "success": false,
  "error": {
    "code": "Bad Request",
    "message": "Validation failed",
    "details": [
      {
        "field": "category",
        "message": "category must be a valid enum value"
      }
    ]
  },
  "timestamp": "2024-04-14T10:30:00.000Z",
  "path": "/api/v1/ai/generate-question"
}
```

### Rate Limit Error (429)
```json
{
  "success": false,
  "error": {
    "code": "TOO_MANY_REQUESTS",
    "message": "Rate limit exceeded. Please try again later."
  },
  "timestamp": "2024-04-14T10:30:00.000Z",
  "path": "/api/v1/ai/evaluate-answer"
}
```

### Service Unavailable (503)
```json
{
  "success": false,
  "error": {
    "code": "SERVICE_UNAVAILABLE",
    "message": "Service temporarily unavailable. Circuit breaker is OPEN."
  },
  "timestamp": "2024-04-14T10:30:00.000Z",
  "path": "/api/v1/ai/generate-question"
}
```

---

## Integration Examples

### JavaScript/TypeScript Client
```typescript
import axios from 'axios';

class AIServiceClient {
  private client;

  constructor(baseURL = 'http://localhost:3002/api/v1') {
    this.client = axios.create({
      baseURL,
      timeout: 65000,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  async generateQuestion(params) {
    const { data } = await this.client.post('/ai/generate-question', params);
    return data;
  }

  async evaluateAnswer(params) {
    const { data } = await this.client.post('/ai/evaluate-answer', params);
    return data;
  }

  async analyzeResume(resumeText, options = {}) {
    const { data } = await this.client.post('/ai/analyze-resume', {
      resumeText,
      ...options,
    });
    return data;
  }

  async getHealth() {
    const { data } = await this.client.get('/ai/health');
    return data;
  }
}

// Usage
const aiService = new AIServiceClient();

const question = await aiService.generateQuestion({
  category: 'behavioral',
  difficulty: 'medium',
  company: 'Google',
});

const evaluation = await aiService.evaluateAnswer({
  question: question.question,
  answer: userAnswer,
  category: 'behavioral',
});
```

### Python Client
```python
import requests
from typing import Dict, Optional

class AIServiceClient:
    def __init__(self, base_url: str = "http://localhost:3002/api/v1"):
        self.base_url = base_url
        self.timeout = 65
        
    def generate_question(self, category: str, difficulty: str, **kwargs) -> Dict:
        response = requests.post(
            f"{self.base_url}/ai/generate-question",
            json={
                "category": category,
                "difficulty": difficulty,
                **kwargs
            },
            timeout=self.timeout
        )
        response.raise_for_status()
        return response.json()
    
    def evaluate_answer(self, question: str, answer: str, category: str, 
                       context: Optional[Dict] = None) -> Dict:
        response = requests.post(
            f"{self.base_url}/ai/evaluate-answer",
            json={
                "question": question,
                "answer": answer,
                "category": category,
                "context": context
            },
            timeout=self.timeout
        )
        response.raise_for_status()
        return response.json()

# Usage
client = AIServiceClient()

question = client.generate_question(
    category="behavioral",
    difficulty="medium",
    company="Google"
)

evaluation = client.evaluate_answer(
    question=question["question"],
    answer=user_answer,
    category="behavioral"
)

print(f"Score: {evaluation['score']}/100")
print(f"Grade: {evaluation['grade']}")
```

---

## Testing Tips

1. **Use Swagger UI**: Visit `http://localhost:3002/api/docs` for interactive testing
2. **Check Health**: Always verify service is healthy before testing
3. **Monitor Stats**: Check `/stats` to see token usage
4. **Rate Limiting**: Be aware of rate limits during testing
5. **Caching**: First request will be slower, subsequent requests will be cached

## Performance Tips

1. **Cache Hits**: Identical requests will return cached results (1-hour TTL for questions)
2. **Parallel Requests**: Service can handle concurrent requests
3. **Timeout**: Set client timeout to >60s to avoid premature timeouts
4. **Error Handling**: Always implement retry logic with exponential backoff
5. **Circuit Breaker**: Service will reject requests if Claude API is down

---

For more information, see:
- [README.md](./README.md) - Full documentation
- [ARCHITECTURE.md](./ARCHITECTURE.md) - System architecture
- [QUICK_START.md](./QUICK_START.md) - Quick setup guide
