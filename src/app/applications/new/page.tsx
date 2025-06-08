'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

const courseTypes = ['Short Course', 'Congress', 'Long Course', 'Modular Course', 'Elearning'];
const deliveryTypes = ['In Person', 'Online', 'Combined'];
const speciesOptions = ['Feline', 'Equine', 'Canine', 'Bovine', 'Porcine'];
const subjectOptions = ['Medicine', 'Surgery', 'Orthopaedics', 'Soft Tissue Surgery', 'Diagnostic Imaging'];
const audienceOptions = ['General Practitioners', 'Middle Tier', 'Specialist (EQF 7/8)'];
const locationTypes = ['Online', 'Single Location', 'Multiple Locations'];

export default function NewApplication() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    courseType: '',
    deliveryType: '',
    title: '',
    species: '',
    subject: '',
    frequency: 'single',
    language: '',
    summary: '',
    audience: '',
    locationType: '',
    locationDetails: '',
    prerequisites: '',
    hoursLecture: '',
    hoursPractical: '',
    hoursOnline: '',
    ects: '',
    cost: '',
    sessions: [],
    strategy: '',
    quality: '',
    assessment: '',
    ethics: '',
    declarations: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const computeECTS = () => {
    const total = parseFloat(formData.hoursLecture || '0') +
      parseFloat(formData.hoursPractical || '0') +
      parseFloat(formData.hoursOnline || '0');
    const ects = total / 25;
    return ects.toFixed(2);
  };

  const save = async (status: string) => {
    setIsSaving(true);
    try {
      const res = await fetch('/api/courses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, ects: computeECTS(), status })
      });
      if (res.ok) {
        router.push('/dashboard');
      }
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">New Course Application</h1>
        <div className="space-x-2">
          <button className="btn-sm btn-outline" onClick={() => save('draft')} disabled={isSaving}>Save Draft</button>
          <button className="btn-sm btn-outline" onClick={() => save('submitted')} disabled={isSaving}>Submit</button>
        </div>
      </div>

      <div className="border-b">
        <nav className="flex space-x-4">
          {['Course Details','Organisation','Strategy & QA','Assessment','Ethics'].map((name, idx) => (
            <button
              key={idx}
              onClick={() => setActiveTab(idx)}
              className={`px-3 py-2 text-sm font-medium border-b-2 ${activeTab===idx ? 'border-blue-600' : 'border-transparent'}`}
            >
              {name}
            </button>
          ))}
        </nav>
      </div>

      {activeTab === 0 && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Course Type</label>
            <select name="courseType" value={formData.courseType} onChange={handleChange} className="form-select">
              <option value="">Select type</option>
              {courseTypes.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Delivery Type</label>
            <select name="deliveryType" value={formData.deliveryType} onChange={handleChange} className="form-select">
              <option value="">Select delivery</option>
              {deliveryTypes.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Course Title</label>
            <input type="text" name="title" value={formData.title} onChange={handleChange} className="form-input" />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Species</label>
            <select name="species" value={formData.species} onChange={handleChange} className="form-select">
              <option value="">Select species</option>
              {speciesOptions.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Subject</label>
            <select name="subject" value={formData.subject} onChange={handleChange} className="form-select">
              <option value="">Select subject</option>
              {subjectOptions.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Frequency</label>
            <select name="frequency" value={formData.frequency} onChange={handleChange} className="form-select">
              <option value="single">Single Accreditation</option>
              <option value="multiple">Multiple (5 years)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Language</label>
            <input type="text" name="language" value={formData.language} onChange={handleChange} className="form-input" />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Summary</label>
            <textarea name="summary" value={formData.summary} onChange={handleChange} rows={4} className="form-textarea" />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Audience</label>
            <select name="audience" value={formData.audience} onChange={handleChange} className="form-select">
              <option value="">Select audience</option>
              {audienceOptions.map(a => <option key={a} value={a}>{a}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Location Type</label>
            <select name="locationType" value={formData.locationType} onChange={handleChange} className="form-select">
              <option value="">Select location</option>
              {locationTypes.map(l => <option key={l} value={l}>{l}</option>)}
            </select>
          </div>

          {formData.locationType !== 'Online' && (
            <div>
              <label className="block text-sm font-medium mb-1">Location Details</label>
              <input type="text" name="locationDetails" value={formData.locationDetails} onChange={handleChange} className="form-input" />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium mb-1">Prerequisites</label>
            <textarea name="prerequisites" value={formData.prerequisites} onChange={handleChange} rows={3} className="form-textarea" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Lecture Hours</label>
              <input type="number" name="hoursLecture" value={formData.hoursLecture} onChange={handleChange} className="form-input" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Practical Hours</label>
              <input type="number" name="hoursPractical" value={formData.hoursPractical} onChange={handleChange} className="form-input" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Online Hours</label>
              <input type="number" name="hoursOnline" value={formData.hoursOnline} onChange={handleChange} className="form-input" />
            </div>
          </div>

          <div className="mt-4 p-4 bg-gray-50 rounded">
            <p className="text-sm">ECTS Credits: {computeECTS()}</p>
          </div>
        </div>
      )}

      {activeTab === 1 && (
        <div className="space-y-4">
          <p className="text-sm">Session organisation and upload will go here.</p>
        </div>
      )}

      {activeTab === 2 && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Active Learning Strategy</label>
            <textarea name="strategy" value={formData.strategy} onChange={handleChange} rows={4} className="form-textarea" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Quality Assurance</label>
            <textarea name="quality" value={formData.quality} onChange={handleChange} rows={4} className="form-textarea" />
          </div>
        </div>
      )}

      {activeTab === 3 && (
        <div>
          <label className="block text-sm font-medium mb-1">Assessment Methods</label>
          <textarea name="assessment" value={formData.assessment} onChange={handleChange} rows={4} className="form-textarea" />
        </div>
      )}

      {activeTab === 4 && (
        <div>
          <label className="block text-sm font-medium mb-1">Ethical Considerations</label>
          <textarea name="ethics" value={formData.ethics} onChange={handleChange} rows={4} className="form-textarea" />
        </div>
      )}
    </div>
  );
}
