import React, { useState } from 'react';
import { Incident } from '../types';
import { 
  Video, 
  FileText, 
  ExternalLink, 
  Loader2, 
  CheckCircle2, 
  Radio,
  FileCheck2,
  Copy,
  Check
} from 'lucide-react';

interface WarRoomActionsProps {
  incident: Incident;
}

export const WarRoomActions: React.FC<WarRoomActionsProps> = ({ incident }) => {
  const [isGeneratingDoc, setIsGeneratingDoc] = useState<boolean>(false);
  const [docGenerated, setDocGenerated] = useState<boolean>(false);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);

  const meetUrl = "https://meet.google.com/new";
  const docUrl = `https://docs.google.com/document/d/1${incident.id.replace(/[^a-zA-Z0-9]/g, '')}-postmortem/edit`;

  const handleGeneratePostMortem = () => {
    setIsGeneratingDoc(true);
    // Simulate generation with Gemini & Google Docs API
    setTimeout(() => {
      setIsGeneratingDoc(false);
      setDocGenerated(true);
    }, 1800);
  };

  const handleCopyDocLink = () => {
    navigator.clipboard.writeText(docUrl).catch(() => {});
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div 
      id="war-room-actions-card"
      className="p-5 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-sm"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-100 dark:border-neutral-800">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400">
            <Radio className="w-5 h-5 animate-pulse" aria-hidden="true" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
              <span>War Room Actions</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300">
                Google Workspace
              </span>
            </h3>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
              Automated conference bridges & incident documentation
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Join Google Meet Button */}
          <a
            id="btn-join-google-meet"
            href={meetUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-white dark:bg-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-700 text-neutral-900 dark:text-neutral-100 border border-neutral-300 dark:border-neutral-700 text-xs font-semibold shadow-xs transition-all active:scale-95"
            title="Join auto-provisioned Google Meet video bridge"
          >
            <Video className="w-4 h-4 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
            <span>Join Google Meet</span>
            <ExternalLink className="w-3.5 h-3.5 text-neutral-400" aria-hidden="true" />
          </a>

          {/* Generate Post-Mortem (Google Docs) Button */}
          {!docGenerated ? (
            <button
              type="button"
              id="btn-generate-postmortem-doc"
              onClick={handleGeneratePostMortem}
              disabled={isGeneratingDoc}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500 text-white text-xs font-semibold shadow-xs transition-all active:scale-95 disabled:opacity-75 disabled:cursor-not-allowed"
            >
              {isGeneratingDoc ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" aria-hidden="true" />
                  <span>Generating Google Doc...</span>
                </>
              ) : (
                <>
                  <FileText className="w-4 h-4 text-blue-100" aria-hidden="true" />
                  <span>Generate Post-Mortem (Google Docs)</span>
                </>
              )}
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <a
                id="link-view-postmortem-doc"
                href={docUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs transition-all active:scale-95"
              >
                <FileCheck2 className="w-4 h-4 text-emerald-200" aria-hidden="true" />
                <span>Open Post-Mortem (Google Docs)</span>
                <ExternalLink className="w-3.5 h-3.5 text-emerald-200" aria-hidden="true" />
              </a>

              <button
                type="button"
                onClick={handleCopyDocLink}
                className="p-2 rounded-lg border border-neutral-300 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors"
                title="Copy Google Doc URL"
                aria-label="Copy Google Doc URL"
              >
                {copiedLink ? (
                  <Check className="w-4 h-4 text-emerald-500" aria-hidden="true" />
                ) : (
                  <Copy className="w-4 h-4" aria-hidden="true" />
                )}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Dynamic Status / Feedback notice */}
      {docGenerated ? (
        <div className="mt-3.5 flex items-center justify-between text-xs bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 rounded-xl px-3.5 py-2.5 text-emerald-800 dark:text-emerald-300 animate-in fade-in duration-300">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" aria-hidden="true" />
            <span>
              Google Doc generated with root-cause analysis, impacted scope, and step-by-step mitigation timeline.
            </span>
          </div>
          <span className="font-mono text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 shrink-0 hidden sm:inline">
            docs.google.com/document
          </span>
        </div>
      ) : (
        <div className="mt-3 flex items-center gap-2 text-[11px] text-neutral-500 dark:text-neutral-400">
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-500"></span>
          <span>Google Meet bridge provisioned automatically for Incident Commander & on-call engineers.</span>
        </div>
      )}
    </div>
  );
};
