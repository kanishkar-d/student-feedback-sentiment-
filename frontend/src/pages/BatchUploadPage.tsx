import React, { useState } from 'react';
import { api } from '../services/api';
import { UploadResponse } from '../types';
import { UploadCloud, FileSpreadsheet, CheckCircle2, AlertCircle, RefreshCw, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';

export const BatchUploadPage: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<UploadResponse | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      if (!selected.name.endsWith('.csv')) {
        toast.error('Please select a valid .csv file.');
        return;
      }
      setFile(selected);
      setResult(null);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      toast.error('Please select a CSV file first.');
      return;
    }

    setUploading(true);
    try {
      const res = await api.uploadCSV(file);
      setResult(res);
      toast.success(`Processed ${res.successful_rows} rows successfully!`);
    } catch (err: any) {
      toast.error(err.message || 'CSV Upload failed.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header Banner */}
      <div className="glass-panel p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800/80">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-50 dark:bg-brand-950/60 text-brand-600 dark:text-brand-400 text-xs font-semibold mb-2">
          <UploadCloud className="w-3.5 h-3.5 text-brand-500" />
          <span>Institutional Bulk Ingestion</span>
        </div>
        <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
          Bulk Student Feedback CSV Import
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Upload bulk course evaluation files for automated background batch NLP sentiment analysis.
        </p>
      </div>

      <div className="max-w-3xl mx-auto space-y-6">
        {/* Upload Zone Card */}
        <div className="glass-panel p-8 rounded-3xl space-y-6 border border-slate-200/80 dark:border-slate-800/80 text-center">
          <div className="w-16 h-16 rounded-3xl bg-brand-500/10 text-brand-600 dark:text-brand-400 flex items-center justify-center mx-auto">
            <UploadCloud className="w-8 h-8" />
          </div>

          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Select or Drop CSV Dataset File
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Required CSV Columns: <code className="bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded font-mono text-[11px]">course_id</code>, <code className="bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded font-mono text-[11px]">faculty_id</code>, <code className="bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded font-mono text-[11px]">rating</code>, <code className="bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded font-mono text-[11px]">raw_comment</code>
            </p>
          </div>

          <input
            type="file"
            accept=".csv"
            id="csv-file-input"
            onChange={handleFileChange}
            className="hidden"
          />

          <label
            htmlFor="csv-file-input"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs transition-all cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-500" />
            {file ? file.name : 'Choose .CSV File'}
          </label>

          {file && (
            <div className="pt-4">
              <button
                onClick={handleUpload}
                disabled={uploading}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-700 hover:to-indigo-700 text-white font-bold text-xs shadow-xl shadow-brand-500/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {uploading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" /> Batch Processing Dataset...
                  </>
                ) : (
                  <>
                    Start Automated Batch NLP Processing <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          )}
        </div>

        {/* Upload Summary Result Card */}
        {result && (
          <div className="glass-panel p-6 rounded-3xl space-y-4 border border-slate-200/80 dark:border-slate-800/80">
            <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-500" /> Ingestion Summary
            </h4>

            <div className="grid grid-cols-3 gap-3 text-center text-xs">
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50">
                <p className="text-base font-black text-slate-900 dark:text-white">{result.total_rows}</p>
                <p className="text-[10px] text-slate-500">Total Rows</p>
              </div>
              <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300">
                <p className="text-base font-black text-emerald-600">{result.successful_rows}</p>
                <p className="text-[10px]">Successful</p>
              </div>
              <div className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300">
                <p className="text-base font-black text-rose-600">{result.failed_rows}</p>
                <p className="text-[10px]">Skipped/Failed</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
