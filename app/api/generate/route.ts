import { NextRequest, NextResponse } from 'next/server';
import { Student, studentSchema } from '@/lib/types';
import { z } from 'zod';
import { pdf } from '@react-pdf/renderer';
import { Marksheet } from '@/lib/pdf/Marksheet';

const bodySchema = z.object({
  students: z.array(studentSchema),
});

export async function POST(req: NextRequest) {
  try {
    const json = await req.json();
    const { students } = bodySchema.parse(json);

    const files = await Promise.all(
      students.map(async (s) => {
        const doc = <Marksheet student={s} />;
        const asPdf = pdf();
        asPdf.updateContainer(doc);
        const buf = await asPdf.toBuffer();
        const base64 = Buffer.from(buf).toString('base64');
        const filename = `${s.studentName.replace(/\s+/g, '_')}_${s.class}-${s.section}.pdf`;
        return { filename, base64 };
      })
    );

    return NextResponse.json({ files });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Invalid input' }, { status: 400 });
  }
}
