# Contributing Guidelines

## Development Setup

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   cd backend && npm install
   ```
3. Set up environment variables (see `.env.local.example`)
4. Set up Supabase database (see `INTERNAL.md`)
5. Run seed script: `cd backend && npm run seed`

## Code Style

- Use TypeScript for frontend
- Use ES6+ JavaScript for backend
- Follow existing code patterns
- Use meaningful variable names
- Add comments for complex logic

## Commit Messages

Use clear, descriptive commit messages:
- `feat: add appointment booking feature`
- `fix: resolve CORS issue`
- `docs: update deployment guide`
- `refactor: improve API error handling`

## Pull Request Process

1. Create a feature branch
2. Make your changes
3. Test thoroughly
4. Update documentation if needed
5. Submit pull request with description

## Testing

- Test all new features manually
- Verify API endpoints work correctly
- Check for console errors
- Test authentication flows

## Documentation

- Update relevant docs when adding features
- Keep `INTERNAL.md` updated
- Add comments to complex code
- Update API documentation if endpoints change

