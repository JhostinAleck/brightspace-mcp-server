import type { AssignmentRepository } from '@/contexts/assignments/domain/AssignmentRepository.js';
import { getFeedback } from '@/contexts/assignments/application/getFeedback.js';
import { getFeedbackSchema } from '@/mcp/schemas.js';
import { feedbackToText } from '@/mcp/tool-helpers.js';
import { OrgUnitId } from '@/shared-kernel/types/OrgUnitId.js';
import { AssignmentId } from '@/contexts/assignments/domain/AssignmentId.js';

export interface GetFeedbackDeps { assignmentRepo: AssignmentRepository; }

export async function handleGetFeedback(deps: GetFeedbackDeps, rawInput: unknown) {
  const input = getFeedbackSchema.parse(rawInput);
  const fb = await getFeedback({
    repo: deps.assignmentRepo,
    courseId: OrgUnitId.of(input.course_id),
    assignmentId: AssignmentId.of(input.assignment_id),
  });
  return { content: [{ type: 'text' as const, text: feedbackToText(fb) }] };
}
