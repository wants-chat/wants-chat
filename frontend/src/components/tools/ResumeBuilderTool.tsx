import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  User,
  Briefcase,
  GraduationCap,
  Award,
  FolderOpen,
  Globe,
  Plus,
  Trash2,
  GripVertical,
  ChevronUp,
  ChevronDown,
  Save,
  Upload,
  Download,
  Eye,
  FileText,
  Linkedin,
  Mail,
  Phone,
  MapPin,
  Link as LinkIcon,
  Check,
  Copy,
  Printer,
  Sparkles,
  Loader2,
} from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';
import { ExportDropdown } from '../ui/ExportDropdown';
import { SyncStatus } from '../ui/SyncStatus';
import { WidgetEmbedButton } from '../ui/WidgetEmbedButton';
import { useToolData } from '../../hooks/useToolData';
import type { ColumnConfig } from '../../lib/toolDataUtils';

// Types
interface PersonalInfo {
  fullName: string;
  professionalTitle: string;
  email: string;
  phone: string;
  location: string;
  linkedin: string;
  portfolio: string;
  summary: string;
}

interface WorkExperience {
  id: string;
  company: string;
  title: string;
  location: string;
  startDate: string;
  endDate: string;
  isCurrentJob: boolean;
  description: string;
}

interface Education {
  id: string;
  institution: string;
  degree: string;
  fieldOfStudy: string;
  graduationDate: string;
  gpa: string;
  awards: string;
}

interface Skill {
  id: string;
  name: string;
  proficiency: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
  category: 'Technical' | 'Soft Skills' | 'Languages';
}

interface Certification {
  id: string;
  name: string;
  issuer: string;
  date: string;
}

interface Project {
  id: string;
  name: string;
  description: string;
  link: string;
}

interface Language {
  id: string;
  language: string;
  proficiency: 'Basic' | 'Conversational' | 'Professional' | 'Native';
}

interface ResumeData {
  personalInfo: PersonalInfo;
  workExperience: WorkExperience[];
  education: Education[];
  skills: Skill[];
  certifications: Certification[];
  projects: Project[];
  languages: Language[];
}

// Wrapper type for useToolData compatibility (requires id field)
interface ResumeDataWithId extends ResumeData {
  id: string;
  name?: string;
  createdAt: string;
  updatedAt: string;
}

type TemplateType = 'modern' | 'classic' | 'minimal';

// Column configuration for exports
const RESUME_COLUMNS: ColumnConfig[] = [
  { key: 'name', header: 'Resume Name', type: 'string' },
  { key: 'personalInfo.fullName', header: 'Full Name', type: 'string' },
  { key: 'personalInfo.professionalTitle', header: 'Title', type: 'string' },
  { key: 'personalInfo.email', header: 'Email', type: 'string' },
  { key: 'createdAt', header: 'Created', type: 'date' },
  { key: 'updatedAt', header: 'Updated', type: 'date' },
];

// Helper function to generate unique IDs
const generateId = () => Math.random().toString(36).substr(2, 9);

// Initial state
const initialPersonalInfo: PersonalInfo = {
  fullName: '',
  professionalTitle: '',
  email: '',
  phone: '',
  location: '',
  linkedin: '',
  portfolio: '',
  summary: '',
};

const initialResumeData: ResumeData = {
  personalInfo: initialPersonalInfo,
  workExperience: [],
  education: [],
  skills: [],
  certifications: [],
  projects: [],
  languages: [],
};

// Proficiency levels
const skillProficiencyLevels = ['Beginner', 'Intermediate', 'Advanced', 'Expert'] as const;
const skillCategories = ['Technical', 'Soft Skills', 'Languages'] as const;
const languageProficiencies = ['Basic', 'Conversational', 'Professional', 'Native'] as const;

interface ResumeBuilderToolProps {
  uiConfig?: UIConfig;
}

export const ResumeBuilderTool: React.FC<ResumeBuilderToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [isPrefilled, setIsPrefilled] = useState(false);

  // Use the useToolData hook for backend persistence of saved resumes
  const {
    data: savedResumes,
    setData: setSavedResumes,
    addItem: addSavedResume,
    updateItem: updateSavedResume,
    deleteItem: deleteSavedResume,
    exportCSV,
    exportExcel,
    exportJSON,
    exportPDF,
    importCSV,
    importJSON,
    copyToClipboard: copyToClipboardHook,
    print: printHook,
    isLoading,
    isSaving,
    isSynced,
    lastSaved,
    syncError,
    forceSync,
  } = useToolData<ResumeDataWithId>('resume-builder', [], RESUME_COLUMNS);

  // Current resume being edited (local state for immediate editing)
  const [resumeData, setResumeData] = useState<ResumeData>(initialResumeData);
  const [currentResumeId, setCurrentResumeId] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState<string>('personal');
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateType>('modern');
  const [showPreview, setShowPreview] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [saveName, setSaveName] = useState('');

  // Handle prefill from uiConfig
  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as ToolPrefillData;
      if (params.text || params.content) {
        setResumeData(prev => ({
          ...prev,
          personalInfo: {
            ...prev.personalInfo,
            fullName: params.text || params.content || ''
          }
        }));
        setIsPrefilled(true);
      }
      if (params.formData) {
        if (params.formData.fullName) {
          setResumeData(prev => ({
            ...prev,
            personalInfo: { ...prev.personalInfo, fullName: params.formData!.fullName }
          }));
        }
        if (params.formData.professionalTitle) {
          setResumeData(prev => ({
            ...prev,
            personalInfo: { ...prev.personalInfo, professionalTitle: params.formData!.professionalTitle }
          }));
        }
        if (params.formData.email) {
          setResumeData(prev => ({
            ...prev,
            personalInfo: { ...prev.personalInfo, email: params.formData!.email }
          }));
        }
        if (params.formData.summary) {
          setResumeData(prev => ({
            ...prev,
            personalInfo: { ...prev.personalInfo, summary: params.formData!.summary }
          }));
        }
        setIsPrefilled(true);
      }
    }
  }, [uiConfig?.params]);

  // Update personal info
  const updatePersonalInfo = (field: keyof PersonalInfo, value: string) => {
    setResumeData((prev) => ({
      ...prev,
      personalInfo: { ...prev.personalInfo, [field]: value },
    }));
  };

  // Work Experience handlers
  const addWorkExperience = () => {
    const newExp: WorkExperience = {
      id: generateId(),
      company: '',
      title: '',
      location: '',
      startDate: '',
      endDate: '',
      isCurrentJob: false,
      description: '',
    };
    setResumeData((prev) => ({
      ...prev,
      workExperience: [...prev.workExperience, newExp],
    }));
  };

  const updateWorkExperience = (id: string, field: keyof WorkExperience, value: string | boolean) => {
    setResumeData((prev) => ({
      ...prev,
      workExperience: prev.workExperience.map((exp) => (exp.id === id ? { ...exp, [field]: value } : exp)),
    }));
  };

  const removeWorkExperience = (id: string) => {
    setResumeData((prev) => ({
      ...prev,
      workExperience: prev.workExperience.filter((exp) => exp.id !== id),
    }));
  };

  const moveWorkExperience = (id: string, direction: 'up' | 'down') => {
    setResumeData((prev) => {
      const index = prev.workExperience.findIndex((exp) => exp.id === id);
      if ((direction === 'up' && index === 0) || (direction === 'down' && index === prev.workExperience.length - 1)) {
        return prev;
      }
      const newExp = [...prev.workExperience];
      const newIndex = direction === 'up' ? index - 1 : index + 1;
      [newExp[index], newExp[newIndex]] = [newExp[newIndex], newExp[index]];
      return { ...prev, workExperience: newExp };
    });
  };

  // Education handlers
  const addEducation = () => {
    const newEdu: Education = {
      id: generateId(),
      institution: '',
      degree: '',
      fieldOfStudy: '',
      graduationDate: '',
      gpa: '',
      awards: '',
    };
    setResumeData((prev) => ({
      ...prev,
      education: [...prev.education, newEdu],
    }));
  };

  const updateEducation = (id: string, field: keyof Education, value: string) => {
    setResumeData((prev) => ({
      ...prev,
      education: prev.education.map((edu) => (edu.id === id ? { ...edu, [field]: value } : edu)),
    }));
  };

  const removeEducation = (id: string) => {
    setResumeData((prev) => ({
      ...prev,
      education: prev.education.filter((edu) => edu.id !== id),
    }));
  };

  // Skills handlers
  const addSkill = () => {
    const newSkill: Skill = {
      id: generateId(),
      name: '',
      proficiency: 'Intermediate',
      category: 'Technical',
    };
    setResumeData((prev) => ({
      ...prev,
      skills: [...prev.skills, newSkill],
    }));
  };

  const updateSkill = (id: string, field: keyof Skill, value: string) => {
    setResumeData((prev) => ({
      ...prev,
      skills: prev.skills.map((skill) => (skill.id === id ? { ...skill, [field]: value } : skill)),
    }));
  };

  const removeSkill = (id: string) => {
    setResumeData((prev) => ({
      ...prev,
      skills: prev.skills.filter((skill) => skill.id !== id),
    }));
  };

  // Certification handlers
  const addCertification = () => {
    const newCert: Certification = {
      id: generateId(),
      name: '',
      issuer: '',
      date: '',
    };
    setResumeData((prev) => ({
      ...prev,
      certifications: [...prev.certifications, newCert],
    }));
  };

  const updateCertification = (id: string, field: keyof Certification, value: string) => {
    setResumeData((prev) => ({
      ...prev,
      certifications: prev.certifications.map((cert) => (cert.id === id ? { ...cert, [field]: value } : cert)),
    }));
  };

  const removeCertification = (id: string) => {
    setResumeData((prev) => ({
      ...prev,
      certifications: prev.certifications.filter((cert) => cert.id !== id),
    }));
  };

  // Project handlers
  const addProject = () => {
    const newProject: Project = {
      id: generateId(),
      name: '',
      description: '',
      link: '',
    };
    setResumeData((prev) => ({
      ...prev,
      projects: [...prev.projects, newProject],
    }));
  };

  const updateProject = (id: string, field: keyof Project, value: string) => {
    setResumeData((prev) => ({
      ...prev,
      projects: prev.projects.map((proj) => (proj.id === id ? { ...proj, [field]: value } : proj)),
    }));
  };

  const removeProject = (id: string) => {
    setResumeData((prev) => ({
      ...prev,
      projects: prev.projects.filter((proj) => proj.id !== id),
    }));
  };

  // Language handlers
  const addLanguage = () => {
    const newLang: Language = {
      id: generateId(),
      language: '',
      proficiency: 'Conversational',
    };
    setResumeData((prev) => ({
      ...prev,
      languages: [...prev.languages, newLang],
    }));
  };

  const updateLanguage = (id: string, field: keyof Language, value: string) => {
    setResumeData((prev) => ({
      ...prev,
      languages: prev.languages.map((lang) => (lang.id === id ? { ...lang, [field]: value } : lang)),
    }));
  };

  const removeLanguage = (id: string) => {
    setResumeData((prev) => ({
      ...prev,
      languages: prev.languages.filter((lang) => lang.id !== id),
    }));
  };

  // Save/Load handlers - now using useToolData hook
  const saveResume = () => {
    if (!saveName.trim()) return;
    const now = new Date().toISOString();

    if (currentResumeId) {
      // Update existing resume
      updateSavedResume(currentResumeId, {
        ...resumeData,
        name: saveName,
        updatedAt: now,
      });
    } else {
      // Create new resume
      const newResume: ResumeDataWithId = {
        id: generateId(),
        name: saveName,
        ...resumeData,
        createdAt: now,
        updatedAt: now,
      };
      addSavedResume(newResume);
      setCurrentResumeId(newResume.id);
    }

    setShowSaveModal(false);
    setSaveName('');
  };

  const loadResume = (id: string) => {
    const resume = savedResumes.find(r => r.id === id);
    if (resume) {
      setResumeData({
        personalInfo: resume.personalInfo,
        workExperience: resume.workExperience,
        education: resume.education,
        skills: resume.skills,
        certifications: resume.certifications,
        projects: resume.projects,
        languages: resume.languages,
      });
      setCurrentResumeId(resume.id);
      setSaveName(resume.name || '');
    }
  };

  const deleteResume = (id: string) => {
    deleteSavedResume(id);
    // If we deleted the currently loaded resume, clear the editor
    if (currentResumeId === id) {
      setResumeData(initialResumeData);
      setCurrentResumeId(null);
      setSaveName('');
    }
  };

  // Create a new blank resume
  const createNewResume = () => {
    setResumeData(initialResumeData);
    setCurrentResumeId(null);
    setSaveName('');
  };

  // Generate text summary for download
  const generateTextSummary = useCallback((): string => {
    const { personalInfo, workExperience, education, skills, certifications, projects, languages } = resumeData;

    let text = '';

    // Header
    text += `${'='.repeat(60)}\n`;
    text += `${personalInfo.fullName.toUpperCase()}\n`;
    text += `${personalInfo.professionalTitle}\n`;
    text += `${'='.repeat(60)}\n\n`;

    // Contact
    text += `CONTACT INFORMATION\n${'-'.repeat(40)}\n`;
    if (personalInfo.email) text += `Email: ${personalInfo.email}\n`;
    if (personalInfo.phone) text += `Phone: ${personalInfo.phone}\n`;
    if (personalInfo.location) text += `Location: ${personalInfo.location}\n`;
    if (personalInfo.linkedin) text += `LinkedIn: ${personalInfo.linkedin}\n`;
    if (personalInfo.portfolio) text += `Portfolio: ${personalInfo.portfolio}\n`;
    text += '\n';

    // Summary
    if (personalInfo.summary) {
      text += `PROFESSIONAL SUMMARY\n${'-'.repeat(40)}\n`;
      text += `${personalInfo.summary}\n\n`;
    }

    // Work Experience
    if (workExperience.length > 0) {
      text += `WORK EXPERIENCE\n${'-'.repeat(40)}\n`;
      workExperience.forEach((exp) => {
        text += `${exp.title} at ${exp.company}\n`;
        text += `${exp.location} | ${exp.startDate} - ${exp.isCurrentJob ? 'Present' : exp.endDate}\n`;
        if (exp.description) {
          exp.description.split('\n').forEach((line) => {
            text += `  ${line.trim().startsWith('-') || line.trim().startsWith('*') ? '' : '- '}${line.trim()}\n`;
          });
        }
        text += '\n';
      });
    }

    // Education
    if (education.length > 0) {
      text += `EDUCATION\n${'-'.repeat(40)}\n`;
      education.forEach((edu) => {
        text += `${edu.degree} in ${edu.fieldOfStudy}\n`;
        text += `${edu.institution} | ${edu.graduationDate}\n`;
        if (edu.gpa) text += `GPA: ${edu.gpa}\n`;
        if (edu.awards) text += `Awards: ${edu.awards}\n`;
        text += '\n';
      });
    }

    // Skills
    if (skills.length > 0) {
      text += `SKILLS\n${'-'.repeat(40)}\n`;
      const skillsByCategory = skills.reduce(
        (acc, skill) => {
          if (!acc[skill.category]) acc[skill.category] = [];
          acc[skill.category].push(`${skill.name} (${skill.proficiency})`);
          return acc;
        },
        {} as Record<string, string[]>
      );
      Object.entries(skillsByCategory).forEach(([category, categorySkills]) => {
        text += `${category}: ${categorySkills.join(', ')}\n`;
      });
      text += '\n';
    }

    // Certifications
    if (certifications.length > 0) {
      text += `CERTIFICATIONS\n${'-'.repeat(40)}\n`;
      certifications.forEach((cert) => {
        text += `${cert.name} - ${cert.issuer} (${cert.date})\n`;
      });
      text += '\n';
    }

    // Projects
    if (projects.length > 0) {
      text += `PROJECTS\n${'-'.repeat(40)}\n`;
      projects.forEach((proj) => {
        text += `${proj.name}\n`;
        if (proj.description) text += `  ${proj.description}\n`;
        if (proj.link) text += `  Link: ${proj.link}\n`;
        text += '\n';
      });
    }

    // Languages
    if (languages.length > 0) {
      text += `LANGUAGES\n${'-'.repeat(40)}\n`;
      languages.forEach((lang) => {
        text += `${lang.language}: ${lang.proficiency}\n`;
      });
    }

    return text;
  }, [resumeData]);

  const handleDownload = () => {
    const text = generateTextSummary();
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${resumeData.personalInfo.fullName.replace(/\s+/g, '_') || 'Resume'}_Resume.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleCopy = async () => {
    const text = generateTextSummary();
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  // Input styling
  const inputClass = `w-full px-4 py-2.5 border ${isDark ? 'bg-gray-700 border-gray-600 text-white placeholder:text-gray-400' : 'bg-white border-gray-200 text-gray-900 placeholder:text-gray-400'} rounded-xl focus:ring-2 focus:ring-[#0D9488]/20 focus:border-[#0D9488] outline-none transition-all`;

  const textareaClass = `w-full px-4 py-3 border ${isDark ? 'bg-gray-700 border-gray-600 text-white placeholder:text-gray-400' : 'bg-white border-gray-200 text-gray-900 placeholder:text-gray-400'} rounded-xl focus:ring-2 focus:ring-[#0D9488]/20 focus:border-[#0D9488] outline-none transition-all resize-none`;

  const selectClass = `w-full px-4 py-2.5 border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-200 text-gray-900'} rounded-xl focus:ring-2 focus:ring-[#0D9488]/20 focus:border-[#0D9488] outline-none transition-all`;

  const labelClass = `block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'} mb-1`;

  const sectionButtonClass = (isActive: boolean) =>
    `flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
      isActive
        ? 'bg-[#0D9488] text-white'
        : isDark
          ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
    }`;

  const actionButtonClass = `p-2 ${isDark ? 'hover:bg-gray-600 text-gray-400 hover:text-white' : 'hover:bg-gray-100 text-gray-500 hover:text-gray-700'} rounded-lg transition-colors`;

  // Section navigation items
  const sections = [
    { id: 'personal', label: 'Personal', icon: User },
    { id: 'experience', label: 'Experience', icon: Briefcase },
    { id: 'education', label: 'Education', icon: GraduationCap },
    { id: 'skills', label: 'Skills', icon: Award },
    { id: 'additional', label: 'Additional', icon: FolderOpen },
  ];


  // Export handlers - using the hook's export functions for saved resumes list
  // For single resume export, we use the getExportData approach
  const handleExportCSV = useCallback(() => {
    const filename = resumeData.personalInfo.fullName
      ? `${resumeData.personalInfo.fullName.replace(/\s+/g, '_')}_Resume`
      : 'Resume';
    exportCSV({ filename });
  }, [exportCSV, resumeData.personalInfo.fullName]);

  const handleExportExcel = useCallback(() => {
    const filename = resumeData.personalInfo.fullName
      ? `${resumeData.personalInfo.fullName.replace(/\s+/g, '_')}_Resume`
      : 'Resume';
    exportExcel({ filename });
  }, [exportExcel, resumeData.personalInfo.fullName]);

  const handleExportJSON = useCallback(() => {
    const filename = resumeData.personalInfo.fullName
      ? `${resumeData.personalInfo.fullName.replace(/\s+/g, '_')}_Resume`
      : 'Resume';
    exportJSON({ filename, includeMetadata: true });
  }, [exportJSON, resumeData.personalInfo.fullName]);

  const handleExportPDF = useCallback(async () => {
    const filename = resumeData.personalInfo.fullName
      ? `${resumeData.personalInfo.fullName.replace(/\s+/g, '_')}_Resume`
      : 'Resume';
    await exportPDF({
      filename,
      title: resumeData.personalInfo.fullName || 'Resume',
      subtitle: resumeData.personalInfo.professionalTitle || 'Professional Resume',
      orientation: 'portrait',
    });
  }, [exportPDF, resumeData.personalInfo.fullName, resumeData.personalInfo.professionalTitle]);

  const handleExportCopyToClipboard = useCallback(async () => {
    return await copyToClipboardHook('tab');
  }, [copyToClipboardHook]);

  const handleExportPrint = useCallback(() => {
    printHook(resumeData.personalInfo.fullName
      ? `${resumeData.personalInfo.fullName} - Resume`
      : 'Resume');
  }, [printHook, resumeData.personalInfo.fullName]);

  // Import handlers
  const handleImportCSV = useCallback(async (file: File) => {
    await importCSV(file);
  }, [importCSV]);

  const handleImportJSON = useCallback(async (file: File) => {
    await importJSON(file);
  }, [importJSON]);

  // Get proficiency bar width
  const getProficiencyWidth = (proficiency: Skill['proficiency']) => {
    switch (proficiency) {
      case 'Beginner':
        return '25%';
      case 'Intermediate':
        return '50%';
      case 'Advanced':
        return '75%';
      case 'Expert':
        return '100%';
      default:
        return '50%';
    }
  };

  // Render Preview Component
  const ResumePreview = () => {
    const { personalInfo, workExperience, education, skills, certifications, projects, languages } = resumeData;

    const templateStyles = {
      modern: {
        container: 'bg-white text-gray-900',
        header: 'bg-gradient-to-r from-[#0D9488] to-[#2DD4BF] text-white p-8',
        section: 'border-l-4 border-[#0D9488] pl-4 mb-6',
        sectionTitle: 'text-[#0D9488] font-bold text-lg mb-3',
      },
      classic: {
        container: 'bg-white text-gray-900',
        header: 'border-b-2 border-gray-800 pb-4 mb-6 text-center',
        section: 'mb-6',
        sectionTitle: 'text-gray-800 font-bold text-lg border-b border-gray-300 pb-1 mb-3 uppercase tracking-wide',
      },
      minimal: {
        container: 'bg-white text-gray-800',
        header: 'mb-8',
        section: 'mb-6',
        sectionTitle: 'text-gray-600 font-medium text-sm uppercase tracking-wider mb-3',
      },
    };

    const style = templateStyles[selectedTemplate];

    return (
      <div className={`${style.container} p-8 max-w-4xl mx-auto print:p-0 print:max-w-none shadow-lg`} id="resume-preview">
        {/* Header */}
        <div className={style.header}>
          <h1 className={`text-3xl font-bold ${selectedTemplate === 'modern' ? '' : 'text-gray-900'}`}>
            {personalInfo.fullName || 'Your Name'}
          </h1>
          <p className={`text-xl ${selectedTemplate === 'modern' ? 'text-white/90' : 'text-gray-600'} mt-1`}>
            {personalInfo.professionalTitle || 'Professional Title'}
          </p>

          <div
            className={`flex flex-wrap gap-4 mt-4 text-sm ${selectedTemplate === 'modern' ? 'text-white/80' : 'text-gray-600'}`}
          >
            {personalInfo.email && (
              <span className="flex items-center gap-1">
                <Mail className="w-4 h-4" /> {personalInfo.email}
              </span>
            )}
            {personalInfo.phone && (
              <span className="flex items-center gap-1">
                <Phone className="w-4 h-4" /> {personalInfo.phone}
              </span>
            )}
            {personalInfo.location && (
              <span className="flex items-center gap-1">
                <MapPin className="w-4 h-4" /> {personalInfo.location}
              </span>
            )}
            {personalInfo.linkedin && (
              <span className="flex items-center gap-1">
                <Linkedin className="w-4 h-4" /> {personalInfo.linkedin}
              </span>
            )}
            {personalInfo.portfolio && (
              <span className="flex items-center gap-1">
                <Globe className="w-4 h-4" /> {personalInfo.portfolio}
              </span>
            )}
          </div>
        </div>

        <div className={selectedTemplate === 'modern' ? 'p-8' : ''}>
          {/* Summary */}
          {personalInfo.summary && (
            <div className={style.section}>
              <h2 className={style.sectionTitle}>{t('tools.resumeBuilder.professionalSummary', 'Professional Summary')}</h2>
              <p className="text-gray-700 leading-relaxed">{personalInfo.summary}</p>
            </div>
          )}

          {/* Work Experience */}
          {workExperience.length > 0 && (
            <div className={style.section}>
              <h2 className={style.sectionTitle}>{t('tools.resumeBuilder.workExperience', 'Work Experience')}</h2>
              {workExperience.map((exp) => (
                <div key={exp.id} className="mb-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-gray-900">{exp.title}</h3>
                      <p className="text-gray-600">
                        {exp.company}
                        {exp.location && ` - ${exp.location}`}
                      </p>
                    </div>
                    <span className="text-sm text-gray-500">
                      {exp.startDate} - {exp.isCurrentJob ? 'Present' : exp.endDate}
                    </span>
                  </div>
                  {exp.description && (
                    <ul className="mt-2 text-gray-700 text-sm list-disc list-inside">
                      {exp.description.split('\n').map((line, i) => {
                        const trimmedLine = line
                          .trim()
                          .replace(/^[-*]\s*/, '')
                          .trim();
                        return trimmedLine ? <li key={i}>{trimmedLine}</li> : null;
                      })}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Education */}
          {education.length > 0 && (
            <div className={style.section}>
              <h2 className={style.sectionTitle}>{t('tools.resumeBuilder.education', 'Education')}</h2>
              {education.map((edu) => (
                <div key={edu.id} className="mb-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {edu.degree} {edu.fieldOfStudy && `in ${edu.fieldOfStudy}`}
                      </h3>
                      <p className="text-gray-600">{edu.institution}</p>
                      {edu.gpa && <p className="text-sm text-gray-500">GPA: {edu.gpa}</p>}
                      {edu.awards && <p className="text-sm text-gray-500">Awards: {edu.awards}</p>}
                    </div>
                    <span className="text-sm text-gray-500">{edu.graduationDate}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Skills */}
          {skills.length > 0 && (
            <div className={style.section}>
              <h2 className={style.sectionTitle}>{t('tools.resumeBuilder.skills', 'Skills')}</h2>
              <div className="grid grid-cols-2 gap-4">
                {skillCategories.map((category) => {
                  const categorySkills = skills.filter((s) => s.category === category);
                  if (categorySkills.length === 0) return null;
                  return (
                    <div key={category}>
                      <h4 className="font-medium text-gray-700 mb-2">{category}</h4>
                      {categorySkills.map((skill) => (
                        <div key={skill.id} className="mb-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-700">{skill.name}</span>
                            <span className="text-gray-500">{skill.proficiency}</span>
                          </div>
                          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-[#0D9488] transition-all"
                              style={{ width: getProficiencyWidth(skill.proficiency) }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Certifications */}
          {certifications.length > 0 && (
            <div className={style.section}>
              <h2 className={style.sectionTitle}>{t('tools.resumeBuilder.certifications', 'Certifications')}</h2>
              {certifications.map((cert) => (
                <div key={cert.id} className="flex justify-between mb-2">
                  <div>
                    <span className="font-medium text-gray-900">{cert.name}</span>
                    <span className="text-gray-500"> - {cert.issuer}</span>
                  </div>
                  <span className="text-sm text-gray-500">{cert.date}</span>
                </div>
              ))}
            </div>
          )}

          {/* Projects */}
          {projects.length > 0 && (
            <div className={style.section}>
              <h2 className={style.sectionTitle}>{t('tools.resumeBuilder.projects', 'Projects')}</h2>
              {projects.map((proj) => (
                <div key={proj.id} className="mb-3">
                  <h3 className="font-semibold text-gray-900">
                    {proj.name}
                    {proj.link && (
                      <a
                        href={proj.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#0D9488] text-sm ml-2"
                      >
                        {t('tools.resumeBuilder.viewProject', 'View Project')}
                      </a>
                    )}
                  </h3>
                  {proj.description && <p className="text-gray-700 text-sm">{proj.description}</p>}
                </div>
              ))}
            </div>
          )}

          {/* Languages */}
          {languages.length > 0 && (
            <div className={style.section}>
              <h2 className={style.sectionTitle}>{t('tools.resumeBuilder.languages', 'Languages')}</h2>
              <div className="flex flex-wrap gap-4">
                {languages.map((lang) => (
                  <span key={lang.id} className="text-gray-700">
                    <span className="font-medium">{lang.language}</span>
                    <span className="text-gray-500"> - {lang.proficiency}</span>
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Loading state
  if (isLoading) {
    return (
      <div className={`${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-sm border overflow-hidden`}>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-[#0D9488]" />
        </div>
      </div>
    );
  }

  return (
    <div
      className={`${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-sm border overflow-hidden`}
    >
      {/* Header */}
      <div
        className={`bg-gradient-to-r ${isDark ? t('tools.resumeBuilder.fromGray800To0d9488', 'from-gray-800 to-[#0D9488]/20') : t('tools.resumeBuilder.fromWhiteTo0d94885', 'from-white to-[#0D9488]/5')} px-6 py-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-100'}`}
      >
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#0D9488]/10 rounded-lg">
              <FileText className="w-5 h-5 text-[#0D9488]" />
            </div>
            <div>
              <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.resumeBuilder.professionalResumeBuilder', 'Professional Resume Builder')}</h3>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                {t('tools.resumeBuilder.createAndCustomizeYourProfessional', 'Create and customize your professional resume')}
              </p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2">
            <WidgetEmbedButton toolSlug="resume-builder" toolName="Resume Builder" />

            <SyncStatus
              isSynced={isSynced}
              isSaving={isSaving}
              lastSaved={lastSaved}
              syncError={syncError}
              onForceSync={forceSync}
              theme={isDark ? 'dark' : 'light'}
              size="sm"
            />
            <button
              onClick={() => setShowPreview(!showPreview)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all ${
                showPreview
                  ? 'bg-[#0D9488] text-white'
                  : isDark
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Eye className="w-4 h-4" />
              <span className="hidden sm:inline">{t('tools.resumeBuilder.preview', 'Preview')}</span>
            </button>
            <button
              onClick={() => setShowSaveModal(true)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all ${isDark ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
            >
              <Save className="w-4 h-4" />
              <span className="hidden sm:inline">{t('tools.resumeBuilder.save', 'Save')}</span>
            </button>
            <button
              onClick={handleCopy}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all ${isDark ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              <span className="hidden sm:inline">{copied ? t('tools.resumeBuilder.copied', 'Copied!') : t('tools.resumeBuilder.copy', 'Copy')}</span>
            </button>
            <button
              onClick={handleDownload}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all ${isDark ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">{t('tools.resumeBuilder.download', 'Download')}</span>
            </button>
            <ExportDropdown
              onExportCSV={handleExportCSV}
              onExportExcel={handleExportExcel}
              onExportJSON={handleExportJSON}
              onExportPDF={handleExportPDF}
              onCopyToClipboard={handleExportCopyToClipboard}
              onPrint={handleExportPrint}
              onImportCSV={handleImportCSV}
              onImportJSON={handleImportJSON}
              showImport={true}
              theme={isDark ? 'dark' : 'light'}
            />
          </div>
        </div>
      </div>

      {/* Save Modal */}
      {showSaveModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div
            className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-xl p-6 w-full max-w-md mx-4 shadow-2xl`}
          >
            <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.resumeBuilder.saveResume', 'Save Resume')}</h3>
            <input
              type="text"
              value={saveName}
              onChange={(e) => setSaveName(e.target.value)}
              placeholder={t('tools.resumeBuilder.enterANameForThis', 'Enter a name for this resume')}
              className={inputClass}
            />
            <div className="flex gap-3 mt-4">
              <button
                onClick={() => setShowSaveModal(false)}
                className={`flex-1 py-2 rounded-lg ${isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'}`}
              >
                {t('tools.resumeBuilder.cancel', 'Cancel')}
              </button>
              <button
                onClick={saveResume}
                disabled={!saveName.trim()}
                className="flex-1 py-2 rounded-lg bg-[#0D9488] text-white disabled:opacity-50"
              >
                {t('tools.resumeBuilder.save2', 'Save')}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="p-6">
        {isPrefilled && (
          <div className="flex items-center gap-2 px-4 py-2 mb-4 bg-[#0D9488]/10 rounded-xl border border-[#0D9488]/20">
            <Sparkles className="w-4 h-4 text-[#0D9488]" />
            <span className="text-sm text-[#0D9488] font-medium">{t('tools.resumeBuilder.contentLoadedFromYourConversation', 'Content loaded from your conversation')}</span>
          </div>
        )}

        {showPreview ? (
          /* Preview Mode */
          <div>
            {/* Template selector */}
            <div className="flex items-center gap-4 mb-6">
              <span className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.resumeBuilder.template', 'Template:')}</span>
              {(['modern', 'classic', 'minimal'] as TemplateType[]).map((template) => (
                <button
                  key={template}
                  onClick={() => setSelectedTemplate(template)}
                  className={`px-4 py-2 rounded-lg capitalize ${
                    selectedTemplate === template
                      ? 'bg-[#0D9488] text-white'
                      : isDark
                        ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {template}
                </button>
              ))}
              <button
                onClick={handlePrint}
                className={`ml-auto flex items-center gap-2 px-4 py-2 rounded-lg ${isDark ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
              >
                <Printer className="w-4 h-4" />
                {t('tools.resumeBuilder.print', 'Print')}
              </button>
            </div>

            {/* Preview container */}
            <div className={`${isDark ? 'bg-gray-900' : 'bg-gray-100'} p-6 rounded-xl overflow-auto max-h-[800px]`}>
              <ResumePreview />
            </div>
          </div>
        ) : (
          /* Edit Mode */
          <div className="space-y-6">
            {/* Section navigation */}
            <div className="flex flex-wrap gap-2">
              {sections.map((section) => (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={sectionButtonClass(activeSection === section.id)}
                >
                  <section.icon className="w-4 h-4" />
                  <span>{section.label}</span>
                </button>
              ))}
            </div>

            {/* Saved Resumes */}
            {savedResumes.length > 0 && (
              <div
                className={`p-4 rounded-xl ${isDark ? 'bg-gray-700/50' : 'bg-gray-50'} border ${isDark ? 'border-gray-600' : 'border-gray-200'}`}
              >
                <div className="flex items-center justify-between mb-2">
                  <h4 className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    Saved Resumes ({savedResumes.length})
                  </h4>
                  <button
                    onClick={createNewResume}
                    className={`text-xs px-2 py-1 rounded ${isDark ? 'bg-gray-600 text-gray-300 hover:bg-gray-500' : 'bg-gray-200 text-gray-600 hover:bg-gray-300'}`}
                  >
                    <Plus className="w-3 h-3 inline mr-1" />
                    {t('tools.resumeBuilder.new', 'New')}
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {savedResumes.map((resume) => (
                    <div
                      key={resume.id}
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-lg ${
                        currentResumeId === resume.id
                          ? 'bg-[#0D9488]/20 border border-[#0D9488]'
                          : isDark ? 'bg-gray-600' : 'bg-white border border-gray-200'
                      }`}
                    >
                      <button
                        onClick={() => loadResume(resume.id)}
                        className={`text-sm ${currentResumeId === resume.id ? 'text-[#0D9488]' : isDark ? 'text-gray-200' : 'text-gray-700'} hover:text-[#0D9488]`}
                      >
                        <Upload className="w-3 h-3 inline mr-1" />
                        {resume.name || resume.personalInfo?.fullName || 'Untitled Resume'}
                      </button>
                      <button
                        onClick={() => deleteResume(resume.id)}
                        className="text-red-500 hover:text-red-600"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Personal Information Section */}
            {activeSection === 'personal' && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <User className="w-5 h-5 text-[#0D9488]" />
                  <h4 className={`text-lg font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {t('tools.resumeBuilder.personalInformation', 'Personal Information')}
                  </h4>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>{t('tools.resumeBuilder.fullName', 'Full Name *')}</label>
                    <input
                      type="text"
                      value={resumeData.personalInfo.fullName}
                      onChange={(e) => updatePersonalInfo('fullName', e.target.value)}
                      placeholder={t('tools.resumeBuilder.johnDoe', 'John Doe')}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>{t('tools.resumeBuilder.professionalTitle', 'Professional Title *')}</label>
                    <input
                      type="text"
                      value={resumeData.personalInfo.professionalTitle}
                      onChange={(e) => updatePersonalInfo('professionalTitle', e.target.value)}
                      placeholder={t('tools.resumeBuilder.seniorSoftwareEngineer', 'Senior Software Engineer')}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>{t('tools.resumeBuilder.email', 'Email *')}</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="email"
                        value={resumeData.personalInfo.email}
                        onChange={(e) => updatePersonalInfo('email', e.target.value)}
                        placeholder={t('tools.resumeBuilder.johnDoeEmailCom', 'john.doe@email.com')}
                        className={`${inputClass} pl-10`}
                      />
                    </div>
                  </div>
                  <div>
                    <label className={labelClass}>{t('tools.resumeBuilder.phone', 'Phone *')}</label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="tel"
                        value={resumeData.personalInfo.phone}
                        onChange={(e) => updatePersonalInfo('phone', e.target.value)}
                        placeholder="+1 (555) 123-4567"
                        className={`${inputClass} pl-10`}
                      />
                    </div>
                  </div>
                  <div>
                    <label className={labelClass}>{t('tools.resumeBuilder.location', 'Location')}</label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        value={resumeData.personalInfo.location}
                        onChange={(e) => updatePersonalInfo('location', e.target.value)}
                        placeholder={t('tools.resumeBuilder.sanFranciscoCa', 'San Francisco, CA')}
                        className={`${inputClass} pl-10`}
                      />
                    </div>
                  </div>
                  <div>
                    <label className={labelClass}>{t('tools.resumeBuilder.linkedin', 'LinkedIn')}</label>
                    <div className="relative">
                      <Linkedin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        value={resumeData.personalInfo.linkedin}
                        onChange={(e) => updatePersonalInfo('linkedin', e.target.value)}
                        placeholder={t('tools.resumeBuilder.linkedinComInJohndoe', 'linkedin.com/in/johndoe')}
                        className={`${inputClass} pl-10`}
                      />
                    </div>
                  </div>
                  <div className="md:col-span-2">
                    <label className={labelClass}>{t('tools.resumeBuilder.portfolioWebsite', 'Portfolio Website')}</label>
                    <div className="relative">
                      <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        value={resumeData.personalInfo.portfolio}
                        onChange={(e) => updatePersonalInfo('portfolio', e.target.value)}
                        placeholder={t('tools.resumeBuilder.httpsJohndoeDev', 'https://johndoe.dev')}
                        className={`${inputClass} pl-10`}
                      />
                    </div>
                  </div>
                  <div className="md:col-span-2">
                    <label className={labelClass}>{t('tools.resumeBuilder.professionalSummary2', 'Professional Summary')}</label>
                    <textarea
                      value={resumeData.personalInfo.summary}
                      onChange={(e) => updatePersonalInfo('summary', e.target.value)}
                      placeholder={t('tools.resumeBuilder.writeACompellingProfessionalSummary', 'Write a compelling professional summary that highlights your key qualifications, experience, and career objectives...')}
                      rows={4}
                      className={textareaClass}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Work Experience Section */}
            {activeSection === 'experience' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Briefcase className="w-5 h-5 text-[#0D9488]" />
                    <h4 className={`text-lg font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.resumeBuilder.workExperience2', 'Work Experience')}</h4>
                  </div>
                  <button
                    onClick={addWorkExperience}
                    className="flex items-center gap-2 px-3 py-2 bg-[#0D9488] text-white rounded-lg hover:bg-[#0D9488]/90 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    {t('tools.resumeBuilder.addExperience', 'Add Experience')}
                  </button>
                </div>

                {resumeData.workExperience.length === 0 ? (
                  <div
                    className={`text-center py-12 ${isDark ? 'bg-gray-700/30' : 'bg-gray-50'} rounded-xl border-2 border-dashed ${isDark ? 'border-gray-600' : 'border-gray-200'}`}
                  >
                    <Briefcase className={`w-12 h-12 mx-auto mb-3 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
                    <p className={`${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                      {t('tools.resumeBuilder.noWorkExperienceAddedYet', 'No work experience added yet')}
                    </p>
                    <button
                      onClick={addWorkExperience}
                      className="mt-4 text-[#0D9488] hover:underline"
                    >
                      {t('tools.resumeBuilder.addYourFirstJob', 'Add your first job')}
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {resumeData.workExperience.map((exp, index) => (
                      <div
                        key={exp.id}
                        className={`p-4 rounded-xl border ${isDark ? 'bg-gray-700/50 border-gray-600' : 'bg-gray-50 border-gray-200'}`}
                      >
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center gap-2">
                            <GripVertical className={`w-4 h-4 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
                            <span className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                              Position {index + 1}
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => moveWorkExperience(exp.id, 'up')}
                              disabled={index === 0}
                              className={`${actionButtonClass} disabled:opacity-30`}
                            >
                              <ChevronUp className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => moveWorkExperience(exp.id, 'down')}
                              disabled={index === resumeData.workExperience.length - 1}
                              className={`${actionButtonClass} disabled:opacity-30`}
                            >
                              <ChevronDown className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => removeWorkExperience(exp.id)}
                              className={`${actionButtonClass} text-red-500 hover:text-red-600`}
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className={labelClass}>{t('tools.resumeBuilder.company', 'Company *')}</label>
                            <input
                              type="text"
                              value={exp.company}
                              onChange={(e) => updateWorkExperience(exp.id, 'company', e.target.value)}
                              placeholder={t('tools.resumeBuilder.companyName', 'Company Name')}
                              className={inputClass}
                            />
                          </div>
                          <div>
                            <label className={labelClass}>{t('tools.resumeBuilder.jobTitle', 'Job Title *')}</label>
                            <input
                              type="text"
                              value={exp.title}
                              onChange={(e) => updateWorkExperience(exp.id, 'title', e.target.value)}
                              placeholder={t('tools.resumeBuilder.seniorDeveloper', 'Senior Developer')}
                              className={inputClass}
                            />
                          </div>
                          <div>
                            <label className={labelClass}>{t('tools.resumeBuilder.location2', 'Location')}</label>
                            <input
                              type="text"
                              value={exp.location}
                              onChange={(e) => updateWorkExperience(exp.id, 'location', e.target.value)}
                              placeholder={t('tools.resumeBuilder.cityState', 'City, State')}
                              className={inputClass}
                            />
                          </div>
                          <div className="flex gap-4">
                            <div className="flex-1">
                              <label className={labelClass}>{t('tools.resumeBuilder.startDate', 'Start Date')}</label>
                              <input
                                type="text"
                                value={exp.startDate}
                                onChange={(e) => updateWorkExperience(exp.id, 'startDate', e.target.value)}
                                placeholder={t('tools.resumeBuilder.jan2020', 'Jan 2020')}
                                className={inputClass}
                              />
                            </div>
                            <div className="flex-1">
                              <label className={labelClass}>{t('tools.resumeBuilder.endDate', 'End Date')}</label>
                              <input
                                type="text"
                                value={exp.endDate}
                                onChange={(e) => updateWorkExperience(exp.id, 'endDate', e.target.value)}
                                placeholder={t('tools.resumeBuilder.dec2023', 'Dec 2023')}
                                disabled={exp.isCurrentJob}
                                className={`${inputClass} ${exp.isCurrentJob ? 'opacity-50' : ''}`}
                              />
                            </div>
                          </div>
                          <div className="md:col-span-2">
                            <label className="flex items-center gap-2 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={exp.isCurrentJob}
                                onChange={(e) => updateWorkExperience(exp.id, 'isCurrentJob', e.target.checked)}
                                className="w-4 h-4 rounded border-gray-300 text-[#0D9488] focus:ring-[#0D9488]"
                              />
                              <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                {t('tools.resumeBuilder.iCurrentlyWorkHere', 'I currently work here')}
                              </span>
                            </label>
                          </div>
                          <div className="md:col-span-2">
                            <label className={labelClass}>{t('tools.resumeBuilder.descriptionOneBulletPointPer', 'Description (one bullet point per line)')}</label>
                            <textarea
                              value={exp.description}
                              onChange={(e) => updateWorkExperience(exp.id, 'description', e.target.value)}
                              placeholder={t('tools.resumeBuilder.ledDevelopmentOfKeyFeatures', '- Led development of key features&#10;- Increased performance by 40%&#10;- Mentored junior developers')}
                              rows={4}
                              className={textareaClass}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Education Section */}
            {activeSection === 'education' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <GraduationCap className="w-5 h-5 text-[#0D9488]" />
                    <h4 className={`text-lg font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.resumeBuilder.education2', 'Education')}</h4>
                  </div>
                  <button
                    onClick={addEducation}
                    className="flex items-center gap-2 px-3 py-2 bg-[#0D9488] text-white rounded-lg hover:bg-[#0D9488]/90 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    {t('tools.resumeBuilder.addEducation', 'Add Education')}
                  </button>
                </div>

                {resumeData.education.length === 0 ? (
                  <div
                    className={`text-center py-12 ${isDark ? 'bg-gray-700/30' : 'bg-gray-50'} rounded-xl border-2 border-dashed ${isDark ? 'border-gray-600' : 'border-gray-200'}`}
                  >
                    <GraduationCap className={`w-12 h-12 mx-auto mb-3 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
                    <p className={`${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.resumeBuilder.noEducationAddedYet', 'No education added yet')}</p>
                    <button onClick={addEducation} className="mt-4 text-[#0D9488] hover:underline">
                      {t('tools.resumeBuilder.addYourEducation', 'Add your education')}
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {resumeData.education.map((edu) => (
                      <div
                        key={edu.id}
                        className={`p-4 rounded-xl border ${isDark ? 'bg-gray-700/50 border-gray-600' : 'bg-gray-50 border-gray-200'}`}
                      >
                        <div className="flex items-start justify-between mb-4">
                          <GraduationCap className={`w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                          <button
                            onClick={() => removeEducation(edu.id)}
                            className={`${actionButtonClass} text-red-500 hover:text-red-600`}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className={labelClass}>{t('tools.resumeBuilder.institution', 'Institution *')}</label>
                            <input
                              type="text"
                              value={edu.institution}
                              onChange={(e) => updateEducation(edu.id, 'institution', e.target.value)}
                              placeholder={t('tools.resumeBuilder.universityName', 'University Name')}
                              className={inputClass}
                            />
                          </div>
                          <div>
                            <label className={labelClass}>{t('tools.resumeBuilder.degree', 'Degree *')}</label>
                            <input
                              type="text"
                              value={edu.degree}
                              onChange={(e) => updateEducation(edu.id, 'degree', e.target.value)}
                              placeholder={t('tools.resumeBuilder.bachelorOfScience', 'Bachelor of Science')}
                              className={inputClass}
                            />
                          </div>
                          <div>
                            <label className={labelClass}>{t('tools.resumeBuilder.fieldOfStudy', 'Field of Study')}</label>
                            <input
                              type="text"
                              value={edu.fieldOfStudy}
                              onChange={(e) => updateEducation(edu.id, 'fieldOfStudy', e.target.value)}
                              placeholder={t('tools.resumeBuilder.computerScience', 'Computer Science')}
                              className={inputClass}
                            />
                          </div>
                          <div>
                            <label className={labelClass}>{t('tools.resumeBuilder.graduationDate', 'Graduation Date')}</label>
                            <input
                              type="text"
                              value={edu.graduationDate}
                              onChange={(e) => updateEducation(edu.id, 'graduationDate', e.target.value)}
                              placeholder={t('tools.resumeBuilder.may2020', 'May 2020')}
                              className={inputClass}
                            />
                          </div>
                          <div>
                            <label className={labelClass}>{t('tools.resumeBuilder.gpaOptional', 'GPA (Optional)')}</label>
                            <input
                              type="text"
                              value={edu.gpa}
                              onChange={(e) => updateEducation(edu.id, 'gpa', e.target.value)}
                              placeholder="3.8/4.0"
                              className={inputClass}
                            />
                          </div>
                          <div>
                            <label className={labelClass}>{t('tools.resumeBuilder.awardsHonors', 'Awards/Honors')}</label>
                            <input
                              type="text"
                              value={edu.awards}
                              onChange={(e) => updateEducation(edu.id, 'awards', e.target.value)}
                              placeholder={t('tools.resumeBuilder.deanSListSummaCum', 'Dean\'s List, Summa Cum Laude')}
                              className={inputClass}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Skills Section */}
            {activeSection === 'skills' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Award className="w-5 h-5 text-[#0D9488]" />
                    <h4 className={`text-lg font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.resumeBuilder.skills2', 'Skills')}</h4>
                  </div>
                  <button
                    onClick={addSkill}
                    className="flex items-center gap-2 px-3 py-2 bg-[#0D9488] text-white rounded-lg hover:bg-[#0D9488]/90 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    {t('tools.resumeBuilder.addSkill', 'Add Skill')}
                  </button>
                </div>

                {resumeData.skills.length === 0 ? (
                  <div
                    className={`text-center py-12 ${isDark ? 'bg-gray-700/30' : 'bg-gray-50'} rounded-xl border-2 border-dashed ${isDark ? 'border-gray-600' : 'border-gray-200'}`}
                  >
                    <Award className={`w-12 h-12 mx-auto mb-3 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
                    <p className={`${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.resumeBuilder.noSkillsAddedYet', 'No skills added yet')}</p>
                    <button onClick={addSkill} className="mt-4 text-[#0D9488] hover:underline">
                      {t('tools.resumeBuilder.addYourSkills', 'Add your skills')}
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {resumeData.skills.map((skill) => (
                      <div
                        key={skill.id}
                        className={`p-4 rounded-xl border ${isDark ? 'bg-gray-700/50 border-gray-600' : 'bg-gray-50 border-gray-200'}`}
                      >
                        <div className="flex items-center justify-between mb-3">
                          <input
                            type="text"
                            value={skill.name}
                            onChange={(e) => updateSkill(skill.id, 'name', e.target.value)}
                            placeholder={t('tools.resumeBuilder.skillName', 'Skill name')}
                            className={`${inputClass} flex-1`}
                          />
                          <button
                            onClick={() => removeSkill(skill.id)}
                            className={`${actionButtonClass} text-red-500 hover:text-red-600 ml-2`}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                        <div className="grid grid-cols-2 gap-3 mb-3">
                          <div>
                            <label className={`${labelClass} text-xs`}>{t('tools.resumeBuilder.category', 'Category')}</label>
                            <select
                              value={skill.category}
                              onChange={(e) => updateSkill(skill.id, 'category', e.target.value)}
                              className={selectClass}
                            >
                              {skillCategories.map((cat) => (
                                <option key={cat} value={cat}>
                                  {cat}
                                </option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <label className={`${labelClass} text-xs`}>{t('tools.resumeBuilder.proficiency', 'Proficiency')}</label>
                            <select
                              value={skill.proficiency}
                              onChange={(e) => updateSkill(skill.id, 'proficiency', e.target.value)}
                              className={selectClass}
                            >
                              {skillProficiencyLevels.map((level) => (
                                <option key={level} value={level}>
                                  {level}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>

                        {/* Visual skill bar */}
                        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-[#0D9488] to-[#2DD4BF] transition-all duration-300"
                            style={{ width: getProficiencyWidth(skill.proficiency) }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Additional Sections */}
            {activeSection === 'additional' && (
              <div className="space-y-8">
                {/* Certifications */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Award className="w-5 h-5 text-[#0D9488]" />
                      <h4 className={`text-lg font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {t('tools.resumeBuilder.certifications2', 'Certifications')}
                      </h4>
                    </div>
                    <button
                      onClick={addCertification}
                      className="flex items-center gap-2 px-3 py-2 bg-[#0D9488] text-white rounded-lg hover:bg-[#0D9488]/90 transition-colors text-sm"
                    >
                      <Plus className="w-4 h-4" />
                      {t('tools.resumeBuilder.add', 'Add')}
                    </button>
                  </div>

                  {resumeData.certifications.length === 0 ? (
                    <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                      {t('tools.resumeBuilder.noCertificationsAdded', 'No certifications added')}
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {resumeData.certifications.map((cert) => (
                        <div
                          key={cert.id}
                          className={`p-3 rounded-xl border ${isDark ? 'bg-gray-700/50 border-gray-600' : 'bg-gray-50 border-gray-200'} flex items-center gap-3`}
                        >
                          <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-3">
                            <input
                              type="text"
                              value={cert.name}
                              onChange={(e) => updateCertification(cert.id, 'name', e.target.value)}
                              placeholder={t('tools.resumeBuilder.certificationName', 'Certification name')}
                              className={inputClass}
                            />
                            <input
                              type="text"
                              value={cert.issuer}
                              onChange={(e) => updateCertification(cert.id, 'issuer', e.target.value)}
                              placeholder={t('tools.resumeBuilder.issuingOrganization', 'Issuing organization')}
                              className={inputClass}
                            />
                            <input
                              type="text"
                              value={cert.date}
                              onChange={(e) => updateCertification(cert.id, 'date', e.target.value)}
                              placeholder={t('tools.resumeBuilder.dateObtained', 'Date obtained')}
                              className={inputClass}
                            />
                          </div>
                          <button
                            onClick={() => removeCertification(cert.id)}
                            className={`${actionButtonClass} text-red-500 hover:text-red-600`}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Projects */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FolderOpen className="w-5 h-5 text-[#0D9488]" />
                      <h4 className={`text-lg font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.resumeBuilder.projects2', 'Projects')}</h4>
                    </div>
                    <button
                      onClick={addProject}
                      className="flex items-center gap-2 px-3 py-2 bg-[#0D9488] text-white rounded-lg hover:bg-[#0D9488]/90 transition-colors text-sm"
                    >
                      <Plus className="w-4 h-4" />
                      {t('tools.resumeBuilder.add2', 'Add')}
                    </button>
                  </div>

                  {resumeData.projects.length === 0 ? (
                    <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.resumeBuilder.noProjectsAdded', 'No projects added')}</p>
                  ) : (
                    <div className="space-y-3">
                      {resumeData.projects.map((proj) => (
                        <div
                          key={proj.id}
                          className={`p-4 rounded-xl border ${isDark ? 'bg-gray-700/50 border-gray-600' : 'bg-gray-50 border-gray-200'}`}
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-3">
                              <input
                                type="text"
                                value={proj.name}
                                onChange={(e) => updateProject(proj.id, 'name', e.target.value)}
                                placeholder={t('tools.resumeBuilder.projectName', 'Project name')}
                                className={inputClass}
                              />
                              <div className="relative">
                                <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                  type="text"
                                  value={proj.link}
                                  onChange={(e) => updateProject(proj.id, 'link', e.target.value)}
                                  placeholder={t('tools.resumeBuilder.projectUrl', 'Project URL')}
                                  className={`${inputClass} pl-10`}
                                />
                              </div>
                            </div>
                            <button
                              onClick={() => removeProject(proj.id)}
                              className={`${actionButtonClass} text-red-500 hover:text-red-600 ml-2`}
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                          <textarea
                            value={proj.description}
                            onChange={(e) => updateProject(proj.id, 'description', e.target.value)}
                            placeholder={t('tools.resumeBuilder.briefDescriptionOfTheProject', 'Brief description of the project')}
                            rows={2}
                            className={textareaClass}
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Languages */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Globe className="w-5 h-5 text-[#0D9488]" />
                      <h4 className={`text-lg font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.resumeBuilder.languages2', 'Languages')}</h4>
                    </div>
                    <button
                      onClick={addLanguage}
                      className="flex items-center gap-2 px-3 py-2 bg-[#0D9488] text-white rounded-lg hover:bg-[#0D9488]/90 transition-colors text-sm"
                    >
                      <Plus className="w-4 h-4" />
                      {t('tools.resumeBuilder.add3', 'Add')}
                    </button>
                  </div>

                  {resumeData.languages.length === 0 ? (
                    <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.resumeBuilder.noLanguagesAdded', 'No languages added')}</p>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {resumeData.languages.map((lang) => (
                        <div
                          key={lang.id}
                          className={`p-3 rounded-xl border ${isDark ? 'bg-gray-700/50 border-gray-600' : 'bg-gray-50 border-gray-200'} flex items-center gap-3`}
                        >
                          <input
                            type="text"
                            value={lang.language}
                            onChange={(e) => updateLanguage(lang.id, 'language', e.target.value)}
                            placeholder={t('tools.resumeBuilder.language', 'Language')}
                            className={`${inputClass} flex-1`}
                          />
                          <select
                            value={lang.proficiency}
                            onChange={(e) => updateLanguage(lang.id, 'proficiency', e.target.value)}
                            className={`${selectClass} w-40`}
                          >
                            {languageProficiencies.map((prof) => (
                              <option key={prof} value={prof}>
                                {prof}
                              </option>
                            ))}
                          </select>
                          <button
                            onClick={() => removeLanguage(lang.id)}
                            className={`${actionButtonClass} text-red-500 hover:text-red-600`}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Print styles */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #resume-preview, #resume-preview * {
            visibility: visible;
          }
          #resume-preview {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
};

export default ResumeBuilderTool;
