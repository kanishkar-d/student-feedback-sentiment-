import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Course, Department, FacultyCourse, User } from '../types';
import { BookOpen, Plus, UserCheck, Layers, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';

export const CourseManagementPage: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [facultyCourses, setFacultyCourses] = useState<FacultyCourse[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals / Form States
  const [newCourseCode, setNewCourseCode] = useState('');
  const [newCourseTitle, setNewCourseTitle] = useState('');
  const [newCourseDeptId, setNewCourseDeptId] = useState<number | ''>('');

  const [assignFacultyId, setAssignFacultyId] = useState<number | ''>('');
  const [assignCourseId, setAssignCourseId] = useState<number | ''>('');
  const [assignSemester, setAssignSemester] = useState('Fall');
  const [assignYear, setAssignYear] = useState(2026);

  const loadAll = async () => {
    try {
      const [cList, dList, fcList, uList] = await Promise.all([
        api.getCourses(),
        api.getDepartments(),
        api.getFacultyCourses(),
        api.getUsers()
      ]);
      setCourses(cList);
      setDepartments(dList);
      setFacultyCourses(fcList);
      setUsers(uList.filter(u => u.role === 'FACULTY'));
      if (dList.length > 0) setNewCourseDeptId(dList[0].id);
      if (cList.length > 0) setAssignCourseId(cList[0].id);
      const facultyList = uList.filter(u => u.role === 'FACULTY');
      if (facultyList.length > 0) setAssignFacultyId(facultyList[0].id);
    } catch {
      toast.error('Failed to load courses & departments.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCourseCode || !newCourseTitle || !newCourseDeptId) {
      toast.error('Please fill in all course details.');
      return;
    }
    try {
      await api.createCourse({
        code: newCourseCode,
        title: newCourseTitle,
        department_id: Number(newCourseDeptId)
      });
      toast.success('Course created successfully!');
      setNewCourseCode('');
      setNewCourseTitle('');
      loadAll();
    } catch (err: any) {
      toast.error(err.message || 'Failed to create course.');
    }
  };

  const handleAssignFaculty = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assignFacultyId || !assignCourseId) {
      toast.error('Please select both faculty and course.');
      return;
    }
    try {
      await api.assignFacultyCourse({
        faculty_id: Number(assignFacultyId),
        course_id: Number(assignCourseId),
        semester: assignSemester,
        year: Number(assignYear)
      });
      toast.success('Assigned faculty to course!');
      loadAll();
    } catch (err: any) {
      toast.error(err.message || 'Assignment failed.');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw className="w-8 h-8 text-brand-600 animate-spin" />
          <p className="text-sm font-semibold text-slate-500">Loading Academic Catalog...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12">
      {/* Header Banner */}
      <div className="glass-panel p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800/80">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-50 dark:bg-brand-950/60 text-brand-600 dark:text-brand-400 text-xs font-semibold mb-2">
          <BookOpen className="w-3.5 h-3.5 text-brand-500" />
          <span>Curriculum Management</span>
        </div>
        <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
          Courses & Faculty Course Allocations
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Create academic courses, assign faculty instructors, and structure departments.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Create Course Form */}
        <div className="glass-panel p-6 rounded-3xl space-y-4 border border-slate-200/80 dark:border-slate-800/80">
          <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Plus className="w-5 h-5 text-brand-600" /> Add New Course
          </h3>
          <form onSubmit={handleCreateCourse} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Course Code</label>
                <input
                  type="text"
                  placeholder="e.g. CS101"
                  value={newCourseCode}
                  onChange={(e) => setNewCourseCode(e.target.value)}
                  className="w-full text-xs font-semibold px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Department</label>
                <select
                  value={newCourseDeptId}
                  onChange={(e) => setNewCourseDeptId(Number(e.target.value))}
                  className="w-full text-xs font-semibold px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500"
                >
                  {departments.map(d => (
                    <option key={d.id} value={d.id}>{d.name} ({d.code})</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Course Title</label>
              <input
                type="text"
                placeholder="e.g. Introduction to Artificial Intelligence"
                value={newCourseTitle}
                onChange={(e) => setNewCourseTitle(e.target.value)}
                className="w-full text-xs font-semibold px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow-md transition-all"
            >
              Create Course Entry
            </button>
          </form>
        </div>

        {/* Assign Faculty to Course Form */}
        <div className="glass-panel p-6 rounded-3xl space-y-4 border border-slate-200/80 dark:border-slate-800/80">
          <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-emerald-600" /> Assign Faculty to Course
          </h3>
          <form onSubmit={handleAssignFaculty} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Select Faculty</label>
                <select
                  value={assignFacultyId}
                  onChange={(e) => setAssignFacultyId(Number(e.target.value))}
                  className="w-full text-xs font-semibold px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500"
                >
                  {users.map(u => (
                    <option key={u.id} value={u.id}>{u.full_name} ({u.email})</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Select Course</label>
                <select
                  value={assignCourseId}
                  onChange={(e) => setAssignCourseId(Number(e.target.value))}
                  className="w-full text-xs font-semibold px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500"
                >
                  {courses.map(c => (
                    <option key={c.id} value={c.id}>{c.code} - {c.title}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Semester</label>
                <select
                  value={assignSemester}
                  onChange={(e) => setAssignSemester(e.target.value)}
                  className="w-full text-xs font-semibold px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500"
                >
                  <option value="Fall">Fall</option>
                  <option value="Spring">Spring</option>
                  <option value="Summer">Summer</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Year</label>
                <input
                  type="number"
                  value={assignYear}
                  onChange={(e) => setAssignYear(Number(e.target.value))}
                  className="w-full text-xs font-semibold px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition-all"
            >
              Assign Instructor
            </button>
          </form>
        </div>
      </div>

      {/* Courses Catalog Table */}
      <div className="glass-panel p-6 rounded-3xl space-y-4 border border-slate-200/80 dark:border-slate-800/80">
        <h3 className="text-base font-bold text-slate-900 dark:text-white">Active Course Catalog</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100/60 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider">
              <tr>
                <th className="p-3 rounded-l-xl">Code</th>
                <th className="p-3">Course Title</th>
                <th className="p-3">Department</th>
                <th className="p-3 rounded-r-xl">Assigned Faculty</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
              {courses.map((c) => {
                const assigned = facultyCourses.filter(fc => fc.course_id === c.id);
                return (
                  <tr key={c.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="p-3 font-bold text-brand-600 dark:text-brand-400">{c.code}</td>
                    <td className="p-3 font-semibold text-slate-900 dark:text-white">{c.title}</td>
                    <td className="p-3 text-slate-500">{c.department_name || 'Department'}</td>
                    <td className="p-3">
                      {assigned.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {assigned.map((a, i) => (
                            <span key={i} className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 text-[10px] font-bold">
                              {a.faculty_name} ({a.semester} {a.year})
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-[10px] text-slate-400 italic">Unassigned</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
