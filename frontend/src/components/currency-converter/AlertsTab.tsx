import React, { useState, useCallback } from 'react';
import AlertsForm from './AlertsForm';
import AlertList from './alerts/AlertList';
import AlertDetails from './alerts/AlertDetails';
import AlertDashboard from './alerts/AlertDashboard';
import { CurrencyAlert, CurrencyAlertFormData } from '../../types/currency-converter/currencyAlert';
import { useUpdateAlert } from '../../hooks/currency/useCurrencyAlerts';
import { toast } from 'sonner';
import { ArrowLeft } from 'lucide-react';
import { Button } from '../ui/button';

type ViewMode = 'dashboard' | 'create' | 'details' | 'edit' | 'list';

const AlertsTab: React.FC = () => {
  const [viewMode, setViewMode] = useState<ViewMode>('dashboard');
  const [selectedAlert, setSelectedAlert] = useState<CurrencyAlert | null>(null);
  const [editingAlert, setEditingAlert] = useState<CurrencyAlert | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const { updateAlert, loading: isUpdating } = useUpdateAlert();

  // Callback to refresh the alert list
  const handleAlertCreated = useCallback(() => {
    console.log('AlertsTab: handleAlertCreated called, incrementing refreshKey');
    setRefreshKey(prev => {
      console.log('AlertsTab: refreshKey changing from', prev, 'to', prev + 1);
      return prev + 1;
    });
    setViewMode('dashboard');
  }, []);

  const handleSelectAlert = (alert: CurrencyAlert | null) => {
    setSelectedAlert(alert);
    if (alert) {
      setViewMode('details');
    }
  };

  const handleCreateNew = () => {
    setViewMode('create');
    setSelectedAlert(null);
    setEditingAlert(null);
  };

  const handleEditAlert = (alert: CurrencyAlert) => {
    setEditingAlert(alert);
    setViewMode('edit');
  };

  const handleUpdateAlert = async (data: CurrencyAlertFormData & { is_active?: boolean }) => {
    if (!editingAlert) return;

    const result = await updateAlert(editingAlert.id, data);
    if (result) {
      toast.success('Alert has been updated successfully.');
      setEditingAlert(null);
      setSelectedAlert(result);
      setViewMode('details');
    } else {
      toast.error('Failed to update alert. Please try again.');
    }
  };

  const handleDeleteAlert = () => {
    setSelectedAlert(null);
    setViewMode('dashboard');
  };

  const handleBackToDashboard = () => {
    setViewMode('dashboard');
    setSelectedAlert(null);
    setEditingAlert(null);
  };

  // Mobile responsive: show list view on small screens when not in specific mode
  const isMobile = window.innerWidth < 768;

  // Desktop Layout: Two-panel
  if (!isMobile) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-280px)]">
        {/* Left Panel - Alert List */}
        <div className="lg:col-span-1">
          <div className="h-full overflow-hidden bg-white/10 backdrop-blur-xl rounded-xl border border-white/20">
            <AlertList
              key={refreshKey}
              onSelectAlert={handleSelectAlert}
              onCreateNew={handleCreateNew}
              onEditAlert={handleEditAlert}
              selectedAlert={selectedAlert}
            />
          </div>
        </div>

        {/* Right Panel - Dynamic Content */}
        <div className="lg:col-span-2">
          <div className="h-full overflow-auto bg-white/10 backdrop-blur-xl rounded-xl border border-white/20">
            <div className="p-6">
              {viewMode === 'dashboard' && (
                <AlertDashboard onCreateNew={handleCreateNew} />
              )}

              {viewMode === 'create' && (
                <div>
                  <Button
                    variant="ghost"
                    onClick={handleBackToDashboard}
                    className="mb-4 text-white/80 hover:text-white hover:bg-white/10"
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Dashboard
                  </Button>
                  <AlertsForm onSuccess={handleAlertCreated} />
                </div>
              )}

              {viewMode === 'details' && selectedAlert && (
                <div>
                  <Button
                    variant="ghost"
                    onClick={handleBackToDashboard}
                    className="mb-4 text-white/80 hover:text-white hover:bg-white/10"
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Dashboard
                  </Button>
                  <AlertDetails
                    alert={selectedAlert}
                    onEdit={() => handleEditAlert(selectedAlert)}
                    onDelete={handleDeleteAlert}
                    onClose={handleBackToDashboard}
                  />
                </div>
              )}

              {viewMode === 'edit' && editingAlert && (
                <div>
                  <Button
                    variant="ghost"
                    onClick={() => {
                      setViewMode('details');
                      setEditingAlert(null);
                    }}
                    className="mb-4 text-white/80 hover:text-white hover:bg-white/10"
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Cancel Edit
                  </Button>
                  <AlertsForm
                    initialData={editingAlert}
                    onSubmit={handleUpdateAlert}
                    isUpdating={isUpdating}
                    mode="edit"
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Mobile Layout: Single view with navigation
  return (
    <div className="space-y-4">
      {/* Mobile Navigation */}
      {viewMode !== 'dashboard' && viewMode !== 'list' && (
        <Button
          variant="ghost"
          onClick={viewMode === 'details' || viewMode === 'edit' ? () => setViewMode('list') : handleBackToDashboard}
          className="mb-4 text-white/80 hover:text-white hover:bg-white/10"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
      )}

      {/* Mobile Content */}
      <div className="bg-white/10 backdrop-blur-xl rounded-xl border border-white/20">
        <div className="p-4">
          {viewMode === 'dashboard' && (
            <>
              <AlertDashboard onCreateNew={handleCreateNew} />
              <Button
                onClick={() => setViewMode('list')}
                className="w-full mt-4 border border-white/20 text-white hover:bg-white/10"
                variant="outline"
              >
                View All Alerts
              </Button>
            </>
          )}

          {viewMode === 'list' && (
            <div className="space-y-4">
              <Button
                variant="ghost"
                onClick={handleBackToDashboard}
                className="w-full text-white/80 hover:text-white hover:bg-white/10"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
              <AlertList
                key={refreshKey}
                onSelectAlert={handleSelectAlert}
                onCreateNew={handleCreateNew}
                onEditAlert={handleEditAlert}
                selectedAlert={selectedAlert}
              />
            </div>
          )}

          {viewMode === 'create' && (
            <AlertsForm onSuccess={handleAlertCreated} />
          )}

          {viewMode === 'details' && selectedAlert && (
            <AlertDetails
              alert={selectedAlert}
              onEdit={() => handleEditAlert(selectedAlert)}
              onDelete={() => {
                handleDeleteAlert();
                setViewMode('list');
              }}
              onClose={() => setViewMode('list')}
            />
          )}

          {viewMode === 'edit' && editingAlert && (
            <AlertsForm
              initialData={editingAlert}
              onSubmit={handleUpdateAlert}
              isUpdating={isUpdating}
              mode="edit"
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default AlertsTab;