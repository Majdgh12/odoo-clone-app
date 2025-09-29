// src/components/EmployeeNotebook/ResumeEditForm.tsx
"use client";

import React, { useState, useEffect } from "react";
import { X, Trash2, Plus } from "lucide-react";

interface ResumeEditFormProps {
  employeeId: string;
  initialData?: any; // { resume: { experience[], education[] }, skills: { programming_languages[], language[], other_skills[] } }
  onClose: () => void;
  onSaved: (updated: any) => void;
}

const emptyExperience = () => ({ title: "", job_description: "", date_from: "", date_to: "" });
const emptyEducation = () => ({ title: "", from_date: "", to_date: "" });
const emptySkill = () => ({ name: "", skill_name: "", percentage: 0 });

export default function ResumeEditForm({
  employeeId,
  initialData = {},
  onClose,
  onSaved,
}: ResumeEditFormProps) {
  const resume = initialData.resume ?? {};
  const skills = initialData.skills ?? {};

  const normalizeSkillRows = (arr: any[]) =>
    (arr ?? []).length
      ? arr.map((s) => ({
          name: s.name ?? s.skill_name ?? s.language_name ?? "",
          skill_name: s.skill_name ?? s.name ?? s.language_name ?? "",
          percentage: s.percentage ?? 0,
          level: s.level ?? undefined,
        }))
      : [emptySkill()];

  const [experiences, setExperiences] = useState<any[]>(
    () => (resume.experience ?? []).length ? (resume.experience ?? []).map((x: any) => ({ ...x })) : [emptyExperience()]
  );
  const [education, setEducation] = useState<any[]>(
    () => (resume.education ?? []).length ? (resume.education ?? []).map((x: any) => ({ ...x })) : [emptyEducation()]
  );
  const [programming, setProgramming] = useState<any[]>(() => normalizeSkillRows(skills.programming_languages ?? []));
  const [languages, setLanguages] = useState<any[]>(() => normalizeSkillRows(skills.language ?? []));
  const [otherSkills, setOtherSkills] = useState<any[]>(() => {
    const os = skills.other_skills ?? [];
    if (!os || os.length === 0) return [{ name: "", skill_name: "", percentage: 0 }];
    return os.map((s: any) =>
      typeof s === "string"
        ? { name: s, skill_name: s, percentage: 0 }
        : { name: s.name ?? s.skill_name ?? s.language_name ?? "", skill_name: s.skill_name ?? s.name ?? s.language_name ?? "", percentage: s.percentage ?? 0, level: s.level ?? undefined }
    );
  });

  const [saving, setSaving] = useState(false);

  useEffect(() => {
    // Reset when initialData changes
    setExperiences((resume.experience ?? []).length ? (resume.experience ?? []).map((x: any) => ({ ...x })) : [emptyExperience()]);
    setEducation((resume.education ?? []).length ? (resume.education ?? []).map((x: any) => ({ ...x })) : [emptyEducation()]);
    setProgramming(normalizeSkillRows(skills.programming_languages ?? []));
    setLanguages(normalizeSkillRows(skills.language ?? []));
    setOtherSkills(() => {
      const os = skills.other_skills ?? [];
      if (!os || os.length === 0) return [{ name: "", skill_name: "", percentage: 0 }];
      return os.map((s: any) => (typeof s === "string" ? { name: s, skill_name: s, percentage: 0 } : { name: s.name ?? s.skill_name ?? s.language_name ?? "", skill_name: s.skill_name ?? s.name ?? s.language_name ?? "", percentage: s.percentage ?? 0, level: s.level ?? undefined }));
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialData]);

  const addRow = (setter: React.Dispatch<React.SetStateAction<any[]>>, emptyRow: any) =>
    setter((prev) => [...prev, typeof emptyRow === "function" ? emptyRow() : emptyRow]);

  const removeRow = (setter: React.Dispatch<React.SetStateAction<any[]>>, idx: number) =>
    setter((prev) => prev.filter((_, i) => i !== idx));

  const handleChange = (setter: React.Dispatch<React.SetStateAction<any[]>>, idx: number, key: string, value: any) =>
    setter((prev) => prev.map((row, i) => (i === idx ? { ...row, [key]: value } : row)));

  // Parse a date-like value to Date object or null
  const parseDateOrNull = (val: any): Date | null => {
    if (!val && val !== 0) return null;
    // if already a Date
    if (val instanceof Date) {
      return isNaN(val.getTime()) ? null : val;
    }
    // If it's an ISO string or yyyy-mm-dd
    try {
      const d = new Date(val);
      if (isNaN(d.getTime())) return null;
      return d;
    } catch {
      return null;
    }
  };

  // Validate percentages and dates
  const validate = () => {
    // percentages
    for (const p of programming) {
      if (p.percentage !== undefined && (isNaN(Number(p.percentage)) || Number(p.percentage) < 0 || Number(p.percentage) > 100)) {
        alert("Programming percentages must be 0-100");
        return false;
      }
    }
    for (const l of languages) {
      if (l.percentage !== undefined && (isNaN(Number(l.percentage)) || Number(l.percentage) < 0 || Number(l.percentage) > 100)) {
        alert("Language percentages must be 0-100");
        return false;
      }
    }
    for (const s of otherSkills) {
      if (s.percentage !== undefined && (isNaN(Number(s.percentage)) || Number(s.percentage) < 0 || Number(s.percentage) > 100)) {
        alert("Other skills percentages must be 0-100");
        return false;
      }
    }

    // date validations: experiences
    for (let i = 0; i < experiences.length; i++) {
      const row = experiences[i];
      const fromRaw = row.date_from ?? row.dateFrom ?? row.date_from;
      const toRaw = row.date_to ?? row.dateTo ?? row.date_to;
      const from = parseDateOrNull(fromRaw);
      const to = parseDateOrNull(toRaw);

      if (from && to && from.getTime() > to.getTime()) {
        alert(`Experience row ${i + 1}: 'From' date must be before or equal to 'To' date.`);
        return false;
      }
    }

    // date validations: education
    for (let i = 0; i < education.length; i++) {
      const row = education[i];
      const fromRaw = row.from_date ?? row.fromDate ?? row.from_date;
      const toRaw = row.to_date ?? row.toDate ?? row.to_date;
      const from = parseDateOrNull(fromRaw);
      const to = parseDateOrNull(toRaw);

      if (from && to && from.getTime() > to.getTime()) {
        alert(`Education row ${i + 1}: 'From' date must be before or equal to 'To' date.`);
        return false;
      }
    }

    return true;
  };

  const handleSave = async () => {
    if (!validate()) return;

    setSaving(true);
    try {
      // Build request body mapping fields the backend expects.
      const mapSkill = (s: any) => ({
        name: s.name ?? s.skill_name ?? "",
        skill_name: s.skill_name ?? s.name ?? "",
        percentage: s.percentage !== undefined && s.percentage !== null ? Number(s.percentage) : 0,
      });

      // Convert experience/education dates into ISO strings if present (backend prefers ISO)
      const normalizeDateField = (v: any) => {
        const d = parseDateOrNull(v);
        return d ? d.toISOString() : null;
      };

      const eduPayload = education.map((e) => {
        return {
          ...e,
          from_date: normalizeDateField(e.from_date ?? e.fromDate ?? e.from_date),
          to_date: normalizeDateField(e.to_date ?? e.toDate ?? e.to_date),
        };
      });

      const expPayload = experiences.map((e) => {
        return {
          ...e,
          date_from: normalizeDateField(e.date_from ?? e.dateFrom ?? e.date_from),
          date_to: normalizeDateField(e.date_to ?? e.dateTo ?? e.date_to),
        };
      });

      // languages must use `language_name` (your schema)
      const langPayload = languages
        .map((l) => {
          const lang = (l.name ?? l.skill_name ?? l.language_name ?? "").toString().trim();
          if (!lang) return null; // skip empty
          return {
            language_name: lang,
            level: l.level && String(l.level).trim() ? String(l.level) : undefined,
            percentage: l.percentage !== undefined && l.percentage !== null ? Number(l.percentage) : 0,
          };
        })
        .filter(Boolean);

      const otherPayload = otherSkills
        .map((s) => {
          const name = (s.name ?? s.skill_name ?? "").toString().trim();
          if (!name) return null;
          return {
            skill_name: name,
            category: s.category && String(s.category).trim() ? String(s.category) : undefined,
            level: s.level && String(s.level).trim() ? String(s.level) : undefined,
            percentage: s.percentage !== undefined && s.percentage !== null ? Number(s.percentage) : 0,
          };
        })
        .filter(Boolean);

      const progPayload = programming
        .map((p) => {
          const name = (p.name ?? p.skill_name ?? "").toString().trim();
          if (!name) return null;
          return {
            name,
            level: p.level && String(p.level).trim() ? String(p.level) : undefined,
            percentage: p.percentage !== undefined && p.percentage !== null ? Number(p.percentage) : 0,
          };
        })
        .filter(Boolean);

      const requestBody = {
        education: eduPayload,
        experience: expPayload,
        languageSkills: langPayload,
        otherSkills: otherPayload,
        programmingSkills: progPayload,
      };

      console.log("[ResumeEditForm] Sending payload:", JSON.stringify(requestBody, null, 2));

      const res = await fetch(`http://localhost:5000/api/resume/employee/${employeeId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });

      const text = await res.text();
      let data: any;
      try {
        data = JSON.parse(text);
      } catch {
        data = { raw: text };
      }

      console.log("[ResumeEditForm] Server response:", res.status, data);

      if (!res.ok) {
        let msg = "Server error";
        if (data?.message) msg = data.message;
        else if (data?.error) msg = data.error;
        else if (typeof data === "string") msg = data;
        throw new Error(msg);
      }

      // Build normalized returned data
      const updated = data ?? {
        resume: {
          experience: expPayload,
          education: eduPayload,
        },
        skills: {
          programming_languages: progPayload,
          language: langPayload,
          other_skills: otherPayload,
        },
      };

      onSaved(updated);
      onClose();
    } catch (err: any) {
      console.error("[ResumeEditForm] Save error:", err);
      alert("Failed to save resume: " + (err.message || err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="relative z-10 bg-white p-6 rounded-lg w-11/12 max-w-4xl max-h-[90vh] overflow-auto">
        <button className="absolute top-4 right-4 text-gray-600" onClick={onClose}>
          <X className="w-5 h-5" />
        </button>
        <h3 className="text-xl font-semibold mb-4">Edit Resume</h3>

        {/* Experiences */}
        <div className="mb-6 p-4 rounded-lg bg-gray-50 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-lg font-semibold">Experiences</h4>
            <button onClick={() => addRow(setExperiences, emptyExperience)} className="flex items-center gap-1 text-sm text-teal-600">
              <Plus className="w-4 h-4" /> Add
            </button>
          </div>

          {experiences.map((exp, index) => (
            <div key={index} className="flex flex-col space-y-2 mb-4">
              <div className="flex items-center gap-2">
                <input type="text" placeholder="Title" className="border p-2 rounded flex-1" value={exp.title ?? ""} onChange={(e) => handleChange(setExperiences, index, "title", e.target.value)} />
                <button className="text-red-500" onClick={() => removeRow(setExperiences, index)}>
                  <Trash2 />
                </button>
              </div>
              <textarea placeholder="Job Description" className="border p-2 rounded resize-none" value={exp.job_description ?? ""} onChange={(e) => handleChange(setExperiences, index, "job_description", e.target.value)} />
              <div className="flex gap-2">
                <input type="date" className="border p-2 rounded flex-1" value={exp.date_from ? new Date(exp.date_from).toISOString().slice(0, 10) : ""} onChange={(e) => handleChange(setExperiences, index, "date_from", e.target.value)} />
                <input type="date" className="border p-2 rounded flex-1" value={exp.date_to ? new Date(exp.date_to).toISOString().slice(0, 10) : ""} onChange={(e) => handleChange(setExperiences, index, "date_to", e.target.value)} />
              </div>
            </div>
          ))}
        </div>

        {/* Education */}
        <div className="mb-6 p-4 rounded-lg bg-gray-50 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-lg font-semibold">Education</h4>
            <button onClick={() => addRow(setEducation, emptyEducation)} className="flex items-center gap-1 text-sm text-teal-600">
              <Plus className="w-4 h-4" /> Add
            </button>
          </div>

          {education.map((edu, index) => (
            <div key={index} className="flex flex-col space-y-2 mb-4">
              <div className="flex items-center gap-2">
                <input type="text" placeholder="Title" className="border p-2 rounded flex-1" value={edu.title ?? ""} onChange={(e) => handleChange(setEducation, index, "title", e.target.value)} />
                <button className="text-red-500" onClick={() => removeRow(setEducation, index)}>
                  <Trash2 />
                </button>
              </div>
              <div className="flex gap-2">
                <input type="date" className="border p-2 rounded flex-1" value={edu.from_date ? new Date(edu.from_date).toISOString().slice(0, 10) : ""} onChange={(e) => handleChange(setEducation, index, "from_date", e.target.value)} />
                <input type="date" className="border p-2 rounded flex-1" value={edu.to_date ? new Date(edu.to_date).toISOString().slice(0, 10) : ""} onChange={(e) => handleChange(setEducation, index, "to_date", e.target.value)} />
              </div>
            </div>
          ))}
        </div>

        {/* Skills */}
        <div className="mb-6 p-4 rounded-lg bg-gray-50 shadow-sm">
          <h4 className="text-lg font-semibold mb-3">Skills</h4>

          {/* Programming */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <h5 className="font-medium">Programming Languages</h5>
              <button onClick={() => addRow(setProgramming, emptySkill)} className="text-sm text-teal-600 flex items-center gap-1">
                <Plus className="w-4 h-4" />Add
              </button>
            </div>
            {programming.map((p, idx) => (
              <div key={idx} className="flex items-center gap-2 mb-2">
                <input type="text" placeholder="Name" className="border p-2 rounded flex-1" value={p.name ?? p.skill_name ?? ""} onChange={(e) => handleChange(setProgramming, idx, "name", e.target.value)} />
                <input type="number" placeholder="%" className="border p-2 rounded w-20" value={p.percentage ?? 0} onChange={(e) => handleChange(setProgramming, idx, "percentage", Number(e.target.value))} />
                <button className="text-red-500" onClick={() => removeRow(setProgramming, idx)}>
                  <Trash2 />
                </button>
              </div>
            ))}
          </div>

          {/* Languages */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <h5 className="font-medium">Languages</h5>
              <button onClick={() => addRow(setLanguages, emptySkill)} className="text-sm text-teal-600 flex items-center gap-1">
                <Plus className="w-4 h-4" />Add
              </button>
            </div>
            {languages.map((p, idx) => (
              <div key={idx} className="flex items-center gap-2 mb-2">
                <input type="text" placeholder="Language" className="border p-2 rounded flex-1" value={p.name ?? p.skill_name ?? p.language_name ?? ""} onChange={(e) => handleChange(setLanguages, idx, "name", e.target.value)} />
                <input type="number" placeholder="%" className="border p-2 rounded w-20" value={p.percentage ?? 0} onChange={(e) => handleChange(setLanguages, idx, "percentage", Number(e.target.value))} />
                <button className="text-red-500" onClick={() => removeRow(setLanguages, idx)}>
                  <Trash2 />
                </button>
              </div>
            ))}
          </div>

          {/* Other Skills */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h5 className="font-medium">Other Skills</h5>
              <button onClick={() => addRow(setOtherSkills, { name: "", skill_name: "", percentage: 0 })} className="text-sm text-teal-600 flex items-center gap-1">
                <Plus className="w-4 h-4" />Add
              </button>
            </div>
            {otherSkills.map((s, idx) => (
              <div key={idx} className="flex items-center gap-2 mb-2">
                <input type="text" placeholder="Skill" className="border p-2 rounded flex-1" value={s.name ?? s.skill_name ?? ""} onChange={(e) => handleChange(setOtherSkills, idx, "name", e.target.value)} />
                <input type="number" placeholder="%" className="border p-2 rounded w-20" value={s.percentage ?? 0} onChange={(e) => handleChange(setOtherSkills, idx, "percentage", Number(e.target.value))} />
                <button className="text-red-500" onClick={() => removeRow(setOtherSkills, idx)}>
                  <Trash2 />
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-4">
          <button onClick={onClose} className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300">
            Cancel
          </button>
          <button onClick={handleSave} disabled={saving} className="px-4 py-2 rounded bg-[#65435C] text-white hover:bg-[#54344c]">
            {saving ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}
