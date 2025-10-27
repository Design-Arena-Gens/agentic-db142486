"use client";

import { useMemo, useState } from 'react';
import Papa from 'papaparse';
import { z } from 'zod';
import { Student, studentSchema } from '@/lib/types';
import { saveAs } from '@/lib/download';

const sampleCsv = `studentId,studentName,class,section,parentEmail,Math,Science,English,History,Geography,Computer
S001,Aarav Sharma,8,A,aarav.parent@example.com,88,92,85,90,87,95
S002,Diya Patel,8,A,diya.parent@example.com,76,81,79,70,75,80
S003,Krish Gupta,8,A,krish.parent@example.com,94,89,93,91,90,96
S004,Aanya Singh,8,B,aanya.parent@example.com,65,72,70,68,71,74
S005,Vivaan Kumar,8,B,vivaan.parent@example.com,82,85,80,78,83,88`;

const columns = [
  'studentId',
  'studentName',
  'class',
  'section',
  'parentEmail',
  'Math',
  'Science',
  'English',
  'History',
  'Geography',
  'Computer',
] as const;

export default function Dashboard() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [message, setMessage] = useState('');

  const totalSelected = selectedIds.length;

  const classSection = useMemo(() => {
    if (!students.length) return '';
    const s = students[0];
    return `${s.class}-${s.section}`;
  }, [students]);

  function toggleSelectAll() {
    if (selectedIds.length === students.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(students.map((s) => s.studentId));
    }
  }

  function toggleSelectOne(id: string) {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }

  function handleFile(file: File) {
    setLoading(true);
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (res) => {
        try {
          const parsed = z
            .array(studentSchema)
            .parse(res.data.map((r: any) => normalizeRow(r)));
          setStudents(parsed);
          setSelectedIds(parsed.map((s) => s.studentId));
        } catch (e) {
          alert('Invalid CSV format. Please match required columns.');
        } finally {
          setLoading(false);
        }
      },
      error: () => {
        setLoading(false);
        alert('Failed to parse CSV');
      },
    });
  }

  function normalizeRow(r: Record<string, any>): Student {
    const base: any = {};
    for (const key of columns) {
      base[key] = r[key];
    }
    const subjects = ['Math','Science','English','History','Geography','Computer'];
    const marks: Record<string, number> = {};
    for (const sub of subjects) marks[sub] = Number(base[sub] ?? 0);

    return {
      studentId: String(base.studentId ?? '').trim(),
      studentName: String(base.studentName ?? '').trim(),
      class: String(base.class ?? '').trim(),
      section: String(base.section ?? '').trim(),
      parentEmail: String(base.parentEmail ?? '').trim(),
      marks,
    };
  }

  async function generatePdfs(ids: string[]) {
    setLoading(true);
    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ students: students.filter(s => ids.includes(s.studentId)) }),
      });
      if (!res.ok) throw new Error('Failed');
      const json = await res.json();
      // json.files: [{filename, base64}]
      json.files.forEach((f: any) => saveAs(f.base64, f.filename));
    } catch {
      alert('PDF generation failed');
    } finally {
      setLoading(false);
    }
  }

  async function sendEmails(ids: string[]) {
    setLoading(true);
    try {
      const res = await fetch('/api/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ students: students.filter(s => ids.includes(s.studentId)), message }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed');
      alert(`Emails sent: ${json.sent}`);
    } catch (e: any) {
      alert(e.message || 'Email sending failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="card p-6">
        <h1 className="text-2xl font-semibold mb-2">Report Card Management</h1>
        <p className="text-white/70 mb-4">Upload CSV, generate PDFs, and send to parents.</p>
        <div className="flex items-center gap-3">
          <label className="btn btn-secondary cursor-pointer">
            <input type="file" accept=".csv" className="hidden" onChange={(e) => e.target.files && handleFile(e.target.files[0])} />
            Upload CSV
          </label>
          <button className="btn btn-secondary" onClick={() => {
            const blob = new Blob([sampleCsv], { type: 'text/csv' });
            handleFile(new File([blob], 'sample.csv', { type: 'text/csv' }));
          }}>Load Sample Data</button>
          {classSection && (
            <span className="text-white/60 text-sm">Class-Section: {classSection}</span>
          )}
        </div>
      </div>

      {students.length > 0 && (
        <div className="card p-6 space-y-4">
          <div className="flex justify-between items-center">
            <div className="text-sm text-white/70">Selected {totalSelected} of {students.length}</div>
            <div className="flex items-center gap-2">
              <button disabled={!selectedIds.length || loading} className="btn btn-secondary" onClick={() => generatePdfs(selectedIds)}>Download PDFs</button>
              <button disabled={!selectedIds.length || loading} className="btn btn-primary" onClick={() => sendEmails(selectedIds)}>Send Emails</button>
            </div>
          </div>

          <div>
            <textarea className="input w-full h-24" placeholder="Optional message to include in email" value={message} onChange={(e) => setMessage(e.target.value)} />
          </div>

          <div className="overflow-auto">
            <table className="table min-w-[800px]">
              <thead>
                <tr>
                  <th><input type="checkbox" checked={selectedIds.length === students.length} onChange={toggleSelectAll} /></th>
                  <th>Student</th>
                  <th>Parent Email</th>
                  <th>Math</th>
                  <th>Science</th>
                  <th>English</th>
                  <th>History</th>
                  <th>Geography</th>
                  <th>Computer</th>
                  <th>Total</th>
                  <th>%</th>
                </tr>
              </thead>
              <tbody>
                {students.map((s) => {
                  const total = Object.values(s.marks).reduce((a, b) => a + b, 0);
                  const percent = Math.round((total / (Object.keys(s.marks).length * 100)) * 100);
                  return (
                    <tr key={s.studentId} className="hover:bg-white/5">
                      <td><input type="checkbox" checked={selectedIds.includes(s.studentId)} onChange={() => toggleSelectOne(s.studentId)} /></td>
                      <td className="whitespace-nowrap">
                        <div className="font-medium">{s.studentName}</div>
                        <div className="text-xs text-white/60">{s.studentId} • {s.class}-{s.section}</div>
                      </td>
                      <td className="whitespace-nowrap">{s.parentEmail}</td>
                      <td>{s.marks.Math}</td>
                      <td>{s.marks.Science}</td>
                      <td>{s.marks.English}</td>
                      <td>{s.marks.History}</td>
                      <td>{s.marks.Geography}</td>
                      <td>{s.marks.Computer}</td>
                      <td>{total}</td>
                      <td>{percent}%</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
