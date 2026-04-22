# brightspace-mcp

MCP server for D2L Brightspace with multi-strategy authentication and opt-in write operations.

**Status:** Under active development. Not production-ready.

## Quick start (Plan 1 preview)

1. Clone and install:

   ```bash
   git clone <this repo>
   cd brightspace-mcp
   npm install
   npm run build
   ```

2. Create `~/.brightspace-mcp/config.yaml`:

   ```yaml
   default_profile: my_school
   profiles:
     my_school:
       base_url: https://your-school.brightspace.com
       auth:
         strategy: api_token
         api_token: { token_ref: env:BRIGHTSPACE_API_TOKEN }
   ```

3. Export your D2L Valence token and run:

   ```bash
   export BRIGHTSPACE_API_TOKEN="<your-token>"
   node build/cli/main.js serve
   ```

4. Register the binary with your MCP client (e.g., Claude Desktop):

   ```json
   { "brightspace": { "command": "node", "args": ["/abs/path/to/build/cli/main.js", "serve"] } }
   ```

## Status

- [x] Plan 1: Foundation + vertical slice (`check_auth`, `list_my_courses`, `api_token` auth)
- [ ] Plan 2: Browser, OAuth, Session Cookie, Headless + MFA (TOTP, Duo, Manual)
- [ ] Plan 3: Retry/backoff, rate limit, coalescing, File/Redis cache
- [ ] Plans 4–8: Remaining contexts, CLI wizard, writes, release pipeline

## License

MIT
