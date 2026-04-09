// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Header from '../../components/landing/Header';
import { Breadcrumb } from '../../components/ui/breadcrumb';
import { api } from '../../lib/api';
import { toast } from '../../components/ui/sonner';
import { useTestResult, useUpdateTestResult } from '../../hooks/useServices';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import {
  ChevronLeft,
  Save,
  Check,
  Science,
  Info as InfoIcon
} from '@mui/icons-material';
import UploadFileSection from '../../components/health/test-results/UploadFileSection';
import TestInformationSection from '../../components/health/test-results/TestInformationSection';
import DoctorLabInfoSection from '../../components/health/test-results/DoctorLabInfoSection';
import TestParametersSection from '../../components/health/test-results/TestParametersSection';
import AdditionalTestInfoSection from '../../components/health/test-results/AdditionalTestInfoSection';
import { TestParameter, TestResultFormData } from '../../types/health';

const UploadResults: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Check if we're in edit mode
  const isEditMode = searchParams.get('edit') === 'true';
  const [editingTestId, setEditingTestId] = useState<string | null>(null);
  
  // Fetch test data if in edit mode
  const { data: testData, loading: testLoading } = useTestResult(editingTestId);
  const updateTestMutation = useUpdateTestResult();

  const [formData, setFormData] = useState<TestResultFormData>({
    testName: '',
    testType: 'blood_test',
    testDate: new Date().toISOString().split('T')[0],
    resultDate: '',
    orderedBy: '',
    orderingDoctorSpecialty: '',
    laboratory: '',
    labAddress: '',
    labCountryCode: '+1',
    labPhoneNumber: '',
    collectionMethod: 'venipuncture',
    fastingRequired: false,
    urgency: 'routine',
    status: 'completed',
    reportNumber: '',
    notes: '',
    interpretation: '',
    followUpRequired: false,
    followUpDate: '',
    nextTestDate: ''
  });

  const [testParameters, setTestParameters] = useState<TestParameter[]>([
    {
      id: '1',
      parameter: '',
      value: '',
      unit: '',
      referenceRange: '',
      flag: 'normal'
    }
  ]);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [labCountryDropdownOpen, setLabCountryDropdownOpen] = useState(false);
  const [labCountrySearchTerm, setLabCountrySearchTerm] = useState('');

  // Load test ID from localStorage when in edit mode
  useEffect(() => {
    if (isEditMode && !editingTestId) {
      const storedTest = localStorage.getItem('editingTest');
      if (storedTest) {
        try {
          const test = JSON.parse(storedTest);
          if (test.id) {
            setEditingTestId(test.id);
          }
        } catch (error) {
          console.error('Error parsing stored test data:', error);
        }
      }
    }
  }, [isEditMode, editingTestId]);

  // Populate form with test data when fetched
  useEffect(() => {
    if (testData) {
      // Clear localStorage after successfully loading the data
      localStorage.removeItem('editingTest');
      
      setFormData({
        testName: testData.test_name || '',
        testType: testData.test_type || 'blood_test',
        testDate: testData.test_date ? new Date(testData.test_date).toISOString().split('T')[0] : '',
        resultDate: testData.result_date ? new Date(testData.result_date).toISOString().split('T')[0] : '',
        orderedBy: testData.ordered_by || '',
        orderingDoctorSpecialty: (testData as any).ordering_doctor_specialty || '',
        laboratory: testData.lab_name || '',
        labAddress: (testData as any).lab_address || '',
        labCountryCode: (testData as any).lab_country_code || '+1',
        labPhoneNumber: (testData as any).lab_phone_number || '',
        collectionMethod: testData.collection_method || 'venipuncture',
        fastingRequired: testData.fasting_required || false,
        urgency: testData.urgency || 'routine',
        status: testData.status || 'completed',
        reportNumber: testData.report_number || '',
        notes: testData.notes || '',
        interpretation: testData.interpretation || '',
        followUpRequired: testData.follow_up_required || false,
        followUpDate: testData.follow_up_date ? new Date(testData.follow_up_date).toISOString().split('T')[0] : '',
        nextTestDate: testData.next_test_date ? new Date(testData.next_test_date).toISOString().split('T')[0] : ''
      });

      // Load test parameters
      if (testData.test_parameters && testData.test_parameters.length > 0) {
        setTestParameters(testData.test_parameters.map((param: any, index: number) => ({
          id: String(index + 1),
          parameter: param.parameter || '',
          value: param.value || '',
          unit: param.unit || '',
          referenceRange: param.reference_range || '',
          flag: param.flag || 'normal'
        })));
      }
    }
  }, [testData]);

  const handleInputChange = (field: keyof TestResultFormData, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleParameterChange = (id: string, field: keyof TestParameter, value: string) => {
    setTestParameters(prev => prev.map(param => 
      param.id === id ? { ...param, [field]: value } : param
    ));
  };

  const addParameter = () => {
    const newParameter: TestParameter = {
      id: Date.now().toString(),
      parameter: '',
      value: '',
      unit: '',
      referenceRange: '',
      flag: 'normal'
    };
    setTestParameters(prev => [...prev, newParameter]);
  };

  const removeParameter = (id: string) => {
    if (testParameters.length > 1) {
      setTestParameters(prev => prev.filter(param => param.id !== id));
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setUploadedFile(file);
      // In a real app, you might parse the file here to extract test results
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.testName) newErrors.testName = 'Test name is required';
    if (!formData.testDate) newErrors.testDate = 'Test date is required';
    if (!formData.orderedBy) newErrors.orderedBy = 'Ordering doctor is required';
    if (!formData.laboratory) newErrors.laboratory = 'Laboratory name is required';
    
    // Validate at least one parameter has required fields
    const hasValidParameter = testParameters.some(param => 
      param.parameter && param.value
    );
    
    if (!hasValidParameter && !uploadedFile) {
      newErrors.parameters = 'Please add at least one test parameter or upload a file';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      // Transform form data to match API schema
      const apiPayload = {
        test_type: formData.testType,
        test_name: formData.testName,
        test_date: formData.testDate,
        result_date: formData.resultDate || formData.testDate,
        lab_name: formData.laboratory,
        ordered_by: formData.orderedBy,
        report_number: formData.reportNumber,
        collection_method: formData.collectionMethod,
        fasting_required: formData.fastingRequired,
        urgency: formData.urgency,
        status: formData.status,
        interpretation: formData.interpretation,
        notes: formData.notes,
        follow_up_required: formData.followUpRequired,
        follow_up_date: formData.followUpRequired && formData.followUpDate ? formData.followUpDate : null,
        next_test_date: formData.nextTestDate || null,
        test_parameters: testParameters
          .filter(p => p.parameter && p.value)
          .map(p => ({
            parameter: p.parameter,
            value: p.value,
            unit: p.unit,
            reference_range: p.referenceRange,
            flag: p.flag
          })),
        metadata: {
          ordering_doctor_specialty: formData.orderingDoctorSpecialty,
          lab_address: formData.labAddress,
          lab_phone: `${formData.labCountryCode} ${formData.labPhoneNumber}`.trim(),
          uploaded_file: uploadedFile?.name || null
        }
      };

      console.log('Submitting test results:', apiPayload);

      // Make API call based on mode
      let response;
      if (isEditMode && editingTestId) {
        response = await updateTestMutation.mutate({ 
          id: editingTestId, 
          data: apiPayload 
        });
      } else {
        response = await api.request('/health/test-results', {
          method: 'POST',
          body: JSON.stringify(apiPayload),
        });
      }

      console.log('Test results saved successfully:', response);

      setShowSuccess(true);
      toast.success('Test results uploaded successfully! 📋');
      setTimeout(() => {
        navigate('/health/medical-records?tab=tests');
      }, 2000);

    } catch (error) {
      console.error('Error saving test results:', error);
      // Add error state handling here if needed
      toast.error('Failed to save test results. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/health/medical-records?tab=tests');
  };

  // Show loading state while fetching test data in edit mode
  if (isEditMode && editingTestId && testLoading) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading test results...</p>
        </div>
      </div>
    );
  }

  const breadcrumbItems = [
    { label: 'Health Manager', href: '/health' },
    { label: 'Medical Records', href: '/health/medical-records' },
    { label: 'Upload Results', icon: Science }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
      <Header />

      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Breadcrumb items={breadcrumbItems} />
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="mb-8 p-8 rounded-3xl" style={{ backgroundColor: 'rgb(71, 189, 255, 0.1)' }}>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            {isEditMode ? 'Edit' : 'Upload'} Test Results 🧪
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Upload medical test results and lab reports for comprehensive health tracking
          </p>
        </div>

        {showSuccess && (
          <div className="mb-8 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg flex items-center">
            <Check className="h-5 w-5 text-green-600 mr-2" />
            <span className="text-green-800 dark:text-green-200">
              Test results uploaded successfully! Redirecting...
            </span>
          </div>
        )}

        {/* Upload File Section */}
        <UploadFileSection
          uploadedFile={uploadedFile}
          onFileUpload={handleFileUpload}
          onRemoveFile={() => setUploadedFile(null)}
        />

        {/* Test Information */}
        <TestInformationSection
          formData={formData}
          handleInputChange={handleInputChange}
          errors={errors}
        />

        {/* Doctor & Lab Information */}
        <DoctorLabInfoSection
          formData={formData}
          handleInputChange={handleInputChange}
          errors={errors}
          labCountryDropdownOpen={labCountryDropdownOpen}
          labCountrySearchTerm={labCountrySearchTerm}
          onLabCountryDropdownToggle={() => setLabCountryDropdownOpen(!labCountryDropdownOpen)}
          onLabCountrySearchChange={setLabCountrySearchTerm}
          onLabCountrySelect={(code) => {
            handleInputChange('labCountryCode', code);
            setLabCountryDropdownOpen(false);
            setLabCountrySearchTerm('');
          }}
        />

        {/* Test Parameters */}
        <TestParametersSection
          formData={formData}
          handleInputChange={handleInputChange}
          errors={errors}
          testParameters={testParameters}
          handleParameterChange={handleParameterChange}
          addParameter={addParameter}
          removeParameter={removeParameter}
        />

        {/* Additional Information */}
        <AdditionalTestInfoSection
          formData={formData}
          handleInputChange={handleInputChange}
          errors={errors}
        />

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row justify-end gap-4 mb-8">
          <Button 
            variant="outline" 
            onClick={handleCancel}
            className="h-12 px-8 rounded-xl border-2 hover:border-gray-400"
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit}
            disabled={loading}
            className="h-12 px-8 rounded-xl text-white font-semibold disabled:opacity-50"
            style={{ backgroundColor: 'rgb(71, 189, 255)' }}
          >
            {loading ? (
              <>
                <div className="animate-spin h-5 w-5 mr-2 border-2 border-white border-t-transparent rounded-full"></div>
                Saving...
              </>
            ) : (
              <>
                <Save className="h-5 w-5 mr-2" />
                Save Test Results
              </>
            )}
          </Button>
        </div>

        {/* Important Note */}
        <Card className="rounded-2xl border-2 border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/20">
          <CardContent className="p-6">
            <div className="flex gap-4">
              <div 
                className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: 'rgb(251, 146, 60, 0.1)' }}
              >
                <InfoIcon className="h-6 w-6 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <h4 className="text-lg font-semibold text-amber-900 dark:text-amber-100 mb-2">Important Note</h4>
                <p className="text-sm text-amber-700 dark:text-amber-200">
                  This tool is for record-keeping purposes only. Always consult with your healthcare provider 
                  for proper interpretation of test results and medical decisions.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default UploadResults;