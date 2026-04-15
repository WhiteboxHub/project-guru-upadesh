# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Initial project setup with monorepo structure
- NestJS backend API with authentication
- Next.js 14 frontend with App Router
- AI service microservice with Claude API integration
- PostgreSQL database with Prisma ORM
- Redis caching layer
- Docker Compose for local development
- Comprehensive documentation
- CI/CD pipelines with GitHub Actions
- Mock interview system
- Question bank with 100+ questions
- User analytics and performance tracking
- Real-time WebSocket communication
- Resume analysis feature

## [1.0.0] - 2026-04-14

### Added
- 🎉 Initial release of Guru Upadesh
- User authentication with JWT
- Mock interview system with AI evaluation
- Question bank across multiple categories
- Performance analytics dashboard
- Real-time interview sessions via WebSocket
- Resume analysis and ATS compatibility checking
- Comprehensive API documentation
- Docker support for easy deployment
- CI/CD pipelines for automated testing and deployment

### Security
- Implemented bcrypt password hashing (12 rounds)
- JWT access and refresh token mechanism
- Rate limiting on all public endpoints
- Input validation and sanitization
- CORS and security headers (Helmet.js)
- SQL injection prevention with Prisma ORM

[Unreleased]: https://github.com/yourusername/guru-upadesh/compare/v1.0.0...HEAD
[1.0.0]: https://github.com/yourusername/guru-upadesh/releases/tag/v1.0.0
