import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { checkAuthSchema, listMyCoursesSchema } from './schemas.js';
import { handleCheckAuth, type CheckAuthDeps } from './tools/check-auth.tool.js';
import { handleListMyCourses, type ListMyCoursesDeps } from './tools/list-my-courses.tool.js';

export interface ToolDeps extends CheckAuthDeps, ListMyCoursesDeps {}

export function registerAllTools(server: McpServer, deps: ToolDeps): void {
  server.registerTool(
    'check_auth',
    {
      title: 'Check Authentication Status',
      description:
        'Verify whether the server can talk to Brightspace on your behalf.\n' +
        'Use when the user asks if they are logged in, or when other tools return auth errors.',
      inputSchema: checkAuthSchema.shape,
    },
    async () => handleCheckAuth(deps),
  );

  server.registerTool(
    'list_my_courses',
    {
      title: 'List My Courses',
      description:
        'List enrolled courses.\n' +
        'Use when the user asks about their classes, semester, or what they are taking.\n' +
        'Defaults to active courses only.',
      inputSchema: listMyCoursesSchema.shape,
    },
    async (input) => handleListMyCourses(deps, input),
  );
}
