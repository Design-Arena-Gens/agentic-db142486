import { z } from 'zod';

export const studentSchema = z.object({
  studentId: z.string().min(1),
  studentName: z.string().min(1),
  class: z.string().min(1),
  section: z.string().min(1),
  parentEmail: z.string().email(),
  marks: z.record(z.number()),
});

export type Student = z.infer<typeof studentSchema>;
