import React, { useState, useEffect } from 'react';
import { Heart, Plus, Search, Trash2, Edit2, Calendar, Pill, Stethoscope, Dog, Cat, Bird, Fish } from 'lucide-react';
import Header from '../../components/landing/Header';
import BackgroundEffects from '../../components/ui/BackgroundEffects';
import { useConfirm } from '../../contexts/ConfirmDialogContext';

interface Pet {
  id: number;
  name: string;
  type: 'dog' | 'cat' | 'bird' | 'fish' | 'other';
  breed: string;
  age: string;
  weight: string;
  imageUrl?: string;
  notes: string;
  timestamp: string;
}

interface VetVisit {
  id: number;
  petId: number;
  date: string;
  reason: string;
  diagnosis: string;
  treatment: string;
  nextVisit: string;
  cost: string;
  notes: string;
  timestamp: string;
}

interface Medication {
  id: number;
  petId: number;
  name: string;
  dosage: string;
  frequency: string;
  startDate: string;
  endDate: string;
  notes: string;
  active: boolean;
  timestamp: string;
}

const PET_TYPES = [
  { id: 'dog', name: 'Dog', icon: Dog, color: 'from-amber-500 to-orange-500' },
  { id: 'cat', name: 'Cat', icon: Cat, color: 'from-purple-500 to-pink-500' },
  { id: 'bird', name: 'Bird', icon: Bird, color: 'from-blue-500 to-cyan-500' },
  { id: 'fish', name: 'Fish', icon: Fish, color: 'from-cyan-500 to-teal-500' },
];

const PetCare: React.FC = () => {
  const { confirm } = useConfirm();
  const [pets, setPets] = useState<Pet[]>([]);
  const [vetVisits, setVetVisits] = useState<VetVisit[]>([]);
  const [medications, setMedications] = useState<Medication[]>([]);
  const [selectedPet, setSelectedPet] = useState<Pet | null>(null);
  const [showAddPetModal, setShowAddPetModal] = useState(false);
  const [showAddVetModal, setShowAddVetModal] = useState(false);
  const [showAddMedModal, setShowAddMedModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'pets' | 'vet' | 'meds'>('pets');

  const [petForm, setPetForm] = useState({
    name: '',
    type: 'dog' as 'dog' | 'cat' | 'bird' | 'fish' | 'other',
    breed: '',
    age: '',
    weight: '',
    notes: '',
  });

  const [vetForm, setVetForm] = useState({
    date: '',
    reason: '',
    diagnosis: '',
    treatment: '',
    nextVisit: '',
    cost: '',
    notes: '',
  });

  const [medForm, setMedForm] = useState({
    name: '',
    dosage: '',
    frequency: '',
    startDate: '',
    endDate: '',
    notes: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    const storedPets = localStorage.getItem('pets');
    const storedVets = localStorage.getItem('vetVisits');
    const storedMeds = localStorage.getItem('medications');

    if (storedPets) setPets(JSON.parse(storedPets));
    if (storedVets) setVetVisits(JSON.parse(storedVets));
    if (storedMeds) setMedications(JSON.parse(storedMeds));
  };

  const savePets = (newPets: Pet[]) => {
    localStorage.setItem('pets', JSON.stringify(newPets));
    setPets(newPets);
  };

  const saveVetVisits = (newVisits: VetVisit[]) => {
    localStorage.setItem('vetVisits', JSON.stringify(newVisits));
    setVetVisits(newVisits);
  };

  const saveMedications = (newMeds: Medication[]) => {
    localStorage.setItem('medications', JSON.stringify(newMeds));
    setMedications(newMeds);
  };

  const handleAddPet = (e: React.FormEvent) => {
    e.preventDefault();
    const newPet: Pet = {
      id: Date.now(),
      ...petForm,
      timestamp: new Date().toISOString(),
    };
    savePets([newPet, ...pets]);
    setSelectedPet(newPet);
    setPetForm({ name: '', type: 'dog', breed: '', age: '', weight: '', notes: '' });
    setShowAddPetModal(false);
  };

  const handleAddVetVisit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPet) return;

    const newVisit: VetVisit = {
      id: Date.now(),
      petId: selectedPet.id,
      ...vetForm,
      timestamp: new Date().toISOString(),
    };
    saveVetVisits([newVisit, ...vetVisits]);
    setVetForm({ date: '', reason: '', diagnosis: '', treatment: '', nextVisit: '', cost: '', notes: '' });
    setShowAddVetModal(false);
  };

  const handleAddMedication = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPet) return;

    const newMed: Medication = {
      id: Date.now(),
      petId: selectedPet.id,
      ...medForm,
      active: true,
      timestamp: new Date().toISOString(),
    };
    saveMedications([newMed, ...medications]);
    setMedForm({ name: '', dosage: '', frequency: '', startDate: '', endDate: '', notes: '' });
    setShowAddMedModal(false);
  };

  const deletePet = async (id: number) => {
    const confirmed = await confirm({
      title: 'Delete Pet',
      message: 'Are you sure you want to delete this pet? This will also delete all associated records.',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      variant: 'destructive',
    });
    if (confirmed) {
      savePets(pets.filter(p => p.id !== id));
      saveVetVisits(vetVisits.filter(v => v.petId !== id));
      saveMedications(medications.filter(m => m.petId !== id));
      if (selectedPet?.id === id) setSelectedPet(null);
    }
  };

  const deleteVetVisit = async (id: number) => {
    const confirmed = await confirm({
      title: 'Delete Vet Visit',
      message: 'Are you sure you want to delete this vet visit?',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      variant: 'destructive',
    });
    if (confirmed) {
      saveVetVisits(vetVisits.filter(v => v.id !== id));
    }
  };

  const deleteMedication = async (id: number) => {
    const confirmed = await confirm({
      title: 'Delete Medication',
      message: 'Are you sure you want to delete this medication?',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      variant: 'destructive',
    });
    if (confirmed) {
      saveMedications(medications.filter(m => m.id !== id));
    }
  };

  const toggleMedicationActive = (id: number) => {
    saveMedications(
      medications.map(m => (m.id === id ? { ...m, active: !m.active } : m))
    );
  };

  const getPetIcon = (type: string) => {
    const petType = PET_TYPES.find(t => t.id === type);
    return petType ? petType.icon : Dog;
  };

  const getPetColor = (type: string) => {
    const petType = PET_TYPES.find(t => t.id === type);
    return petType?.color || 'from-teal-500 to-cyan-500';
  };

  const selectedPetVets = selectedPet ? vetVisits.filter(v => v.petId === selectedPet.id) : [];
  const selectedPetMeds = selectedPet ? medications.filter(m => m.petId === selectedPet.id) : [];

  return (
    <div className="min-h-screen bg-slate-900">
      <BackgroundEffects variant="subtle" />
      <Header />

      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-pink-500 to-purple-500 rounded-2xl mb-4">
            <Heart className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">Pet Care Tracker</h1>
          <p className="text-gray-400">Manage your pets' health, vet visits, and medications</p>
        </div>

        <div className="max-w-6xl mx-auto">
          {/* Tabs */}
          <div className="flex gap-2 mb-6">
            <button
              onClick={() => setActiveTab('pets')}
              className={`flex-1 px-6 py-3 rounded-xl font-medium transition-all ${
                activeTab === 'pets'
                  ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white'
                  : 'bg-slate-800/50 text-gray-400 hover:text-white'
              }`}
            >
              <Heart className="w-5 h-5 inline mr-2" />
              Pets
            </button>
            <button
              onClick={() => setActiveTab('vet')}
              disabled={!selectedPet}
              className={`flex-1 px-6 py-3 rounded-xl font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                activeTab === 'vet'
                  ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white'
                  : 'bg-slate-800/50 text-gray-400 hover:text-white'
              }`}
            >
              <Stethoscope className="w-5 h-5 inline mr-2" />
              Vet Visits
            </button>
            <button
              onClick={() => setActiveTab('meds')}
              disabled={!selectedPet}
              className={`flex-1 px-6 py-3 rounded-xl font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                activeTab === 'meds'
                  ? 'bg-gradient-to-r from-teal-500 to-cyan-500 text-white'
                  : 'bg-slate-800/50 text-gray-400 hover:text-white'
              }`}
            >
              <Pill className="w-5 h-5 inline mr-2" />
              Medications
            </button>
          </div>

          {/* Pets Tab */}
          {activeTab === 'pets' && (
            <>
              <div className="flex flex-col md:flex-row gap-4 mb-6">
                <div className="flex-1 relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search pets..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-slate-800/50 border border-pink-500/30 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-pink-500"
                  />
                </div>
                <button
                  onClick={() => setShowAddPetModal(true)}
                  className="px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white rounded-xl font-medium transition-all flex items-center justify-center gap-2"
                >
                  <Plus className="w-5 h-5" />
                  Add Pet
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {pets.length === 0 ? (
                  <div className="col-span-full text-center py-12">
                    <Heart className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-500">No pets added yet</p>
                    <button
                      onClick={() => setShowAddPetModal(true)}
                      className="mt-4 px-6 py-2 bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white rounded-xl font-medium transition-all"
                    >
                      Add Your First Pet
                    </button>
                  </div>
                ) : (
                  pets.map(pet => {
                    const Icon = getPetIcon(pet.type);
                    return (
                      <div
                        key={pet.id}
                        className={`bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-xl rounded-2xl border ${
                          selectedPet?.id === pet.id ? 'border-pink-500' : 'border-pink-500/30'
                        } p-6 hover:border-pink-500/50 transition-all cursor-pointer`}
                        onClick={() => setSelectedPet(pet)}
                      >
                        <div className="flex items-start justify-between mb-4">
                          <div className={`p-3 rounded-xl bg-gradient-to-br ${getPetColor(pet.type)}`}>
                            <Icon className="w-6 h-6 text-white" />
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              deletePet(pet.id);
                            }}
                            className="p-2 bg-red-500/20 text-red-400 hover:bg-red-500/30 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>

                        <h3 className="text-xl font-semibold text-white mb-2">{pet.name}</h3>
                        <p className="text-sm text-gray-400 mb-4">{pet.breed}</p>

                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-400">Age:</span>
                            <span className="text-white">{pet.age}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-400">Weight:</span>
                            <span className="text-white">{pet.weight}</span>
                          </div>
                        </div>

                        {pet.notes && (
                          <div className="mt-4 pt-4 border-t border-slate-700">
                            <p className="text-xs text-gray-400">{pet.notes}</p>
                          </div>
                        )}

                        {selectedPet?.id === pet.id && (
                          <div className="mt-4 pt-4 border-t border-pink-500/30">
                            <p className="text-sm text-pink-400 font-medium">Selected</p>
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </>
          )}

          {/* Vet Visits Tab */}
          {activeTab === 'vet' && selectedPet && (
            <>
              <div className="mb-6 flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-bold text-white">Vet Visits for {selectedPet.name}</h2>
                  <p className="text-gray-400">Track medical appointments and treatments</p>
                </div>
                <button
                  onClick={() => setShowAddVetModal(true)}
                  className="px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white rounded-xl font-medium transition-all flex items-center gap-2"
                >
                  <Plus className="w-5 h-5" />
                  Add Visit
                </button>
              </div>

              <div className="space-y-4">
                {selectedPetVets.length === 0 ? (
                  <div className="text-center py-12 bg-slate-800/50 rounded-2xl">
                    <Stethoscope className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-500">No vet visits recorded</p>
                  </div>
                ) : (
                  selectedPetVets.map(visit => (
                    <div
                      key={visit.id}
                      className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-xl rounded-2xl border border-blue-500/30 p-6"
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <div className="flex items-center gap-3 mb-2">
                            <Calendar className="w-5 h-5 text-blue-400" />
                            <span className="text-lg font-semibold text-white">{visit.date}</span>
                          </div>
                          <p className="text-gray-400">{visit.reason}</p>
                        </div>
                        <button
                          onClick={() => deleteVetVisit(visit.id)}
                          className="p-2 bg-red-500/20 text-red-400 hover:bg-red-500/30 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <p className="text-sm font-medium text-gray-400 mb-1">Diagnosis</p>
                          <p className="text-white">{visit.diagnosis}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-400 mb-1">Treatment</p>
                          <p className="text-white">{visit.treatment}</p>
                        </div>
                      </div>

                      {visit.nextVisit && (
                        <div className="mb-4">
                          <p className="text-sm font-medium text-gray-400 mb-1">Next Visit</p>
                          <p className="text-cyan-400">{visit.nextVisit}</p>
                        </div>
                      )}

                      {visit.cost && (
                        <div className="mb-4">
                          <p className="text-sm font-medium text-gray-400 mb-1">Cost</p>
                          <p className="text-green-400">${visit.cost}</p>
                        </div>
                      )}

                      {visit.notes && (
                        <div className="pt-4 border-t border-slate-700">
                          <p className="text-sm text-gray-400">{visit.notes}</p>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </>
          )}

          {/* Medications Tab */}
          {activeTab === 'meds' && selectedPet && (
            <>
              <div className="mb-6 flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-bold text-white">Medications for {selectedPet.name}</h2>
                  <p className="text-gray-400">Track prescriptions and supplements</p>
                </div>
                <button
                  onClick={() => setShowAddMedModal(true)}
                  className="px-6 py-3 bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white rounded-xl font-medium transition-all flex items-center gap-2"
                >
                  <Plus className="w-5 h-5" />
                  Add Medication
                </button>
              </div>

              <div className="space-y-4">
                {selectedPetMeds.length === 0 ? (
                  <div className="text-center py-12 bg-slate-800/50 rounded-2xl">
                    <Pill className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-500">No medications recorded</p>
                  </div>
                ) : (
                  selectedPetMeds.map(med => (
                    <div
                      key={med.id}
                      className={`bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-xl rounded-2xl border border-teal-500/30 p-6 ${
                        !med.active ? 'opacity-60' : ''
                      }`}
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <Pill className="w-5 h-5 text-teal-400" />
                            <h3 className="text-lg font-semibold text-white">{med.name}</h3>
                            {med.active && (
                              <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded-full">
                                Active
                              </span>
                            )}
                          </div>
                          <p className="text-gray-400">{med.dosage}</p>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => toggleMedicationActive(med.id)}
                            className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                              med.active
                                ? 'bg-amber-500/20 text-amber-400 hover:bg-amber-500/30'
                                : 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
                            }`}
                          >
                            {med.active ? 'Mark Inactive' : 'Mark Active'}
                          </button>
                          <button
                            onClick={() => deleteMedication(med.id)}
                            className="p-2 bg-red-500/20 text-red-400 hover:bg-red-500/30 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <p className="text-sm font-medium text-gray-400 mb-1">Frequency</p>
                          <p className="text-white">{med.frequency}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-400 mb-1">Start Date</p>
                          <p className="text-white">{med.startDate}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-400 mb-1">End Date</p>
                          <p className="text-white">{med.endDate || 'Ongoing'}</p>
                        </div>
                      </div>

                      {med.notes && (
                        <div className="mt-4 pt-4 border-t border-slate-700">
                          <p className="text-sm text-gray-400">{med.notes}</p>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </>
          )}
        </div>

        {/* Add Pet Modal */}
        {showAddPetModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-slate-800 rounded-2xl border border-pink-500/30 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-slate-700">
                <h2 className="text-2xl font-bold text-white">Add Pet</h2>
              </div>

              <form onSubmit={handleAddPet} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Pet Type</label>
                  <select
                    value={petForm.type}
                    onChange={(e) => setPetForm({ ...petForm, type: e.target.value as any })}
                    className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white focus:outline-none focus:border-pink-500"
                    required
                  >
                    {PET_TYPES.map(type => (
                      <option key={type.id} value={type.id}>{type.name}</option>
                    ))}
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Name</label>
                  <input
                    type="text"
                    value={petForm.name}
                    onChange={(e) => setPetForm({ ...petForm, name: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white focus:outline-none focus:border-pink-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Breed</label>
                  <input
                    type="text"
                    value={petForm.breed}
                    onChange={(e) => setPetForm({ ...petForm, breed: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white focus:outline-none focus:border-pink-500"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Age</label>
                    <input
                      type="text"
                      value={petForm.age}
                      onChange={(e) => setPetForm({ ...petForm, age: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white focus:outline-none focus:border-pink-500"
                      placeholder="e.g., 3 years"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Weight</label>
                    <input
                      type="text"
                      value={petForm.weight}
                      onChange={(e) => setPetForm({ ...petForm, weight: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white focus:outline-none focus:border-pink-500"
                      placeholder="e.g., 25 lbs"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Notes (optional)</label>
                  <textarea
                    value={petForm.notes}
                    onChange={(e) => setPetForm({ ...petForm, notes: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white focus:outline-none focus:border-pink-500"
                    placeholder="Any special notes about your pet..."
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowAddPetModal(false)}
                    className="flex-1 px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-xl font-medium transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white rounded-xl font-medium transition-all"
                  >
                    Add Pet
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Add Vet Visit Modal */}
        {showAddVetModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-slate-800 rounded-2xl border border-blue-500/30 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-slate-700">
                <h2 className="text-2xl font-bold text-white">Add Vet Visit</h2>
              </div>

              <form onSubmit={handleAddVetVisit} className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Date</label>
                    <input
                      type="date"
                      value={vetForm.date}
                      onChange={(e) => setVetForm({ ...vetForm, date: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white focus:outline-none focus:border-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Cost</label>
                    <input
                      type="text"
                      value={vetForm.cost}
                      onChange={(e) => setVetForm({ ...vetForm, cost: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white focus:outline-none focus:border-blue-500"
                      placeholder="0.00"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Reason for Visit</label>
                  <input
                    type="text"
                    value={vetForm.reason}
                    onChange={(e) => setVetForm({ ...vetForm, reason: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white focus:outline-none focus:border-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Diagnosis</label>
                  <textarea
                    value={vetForm.diagnosis}
                    onChange={(e) => setVetForm({ ...vetForm, diagnosis: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white focus:outline-none focus:border-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Treatment</label>
                  <textarea
                    value={vetForm.treatment}
                    onChange={(e) => setVetForm({ ...vetForm, treatment: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white focus:outline-none focus:border-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Next Visit (optional)</label>
                  <input
                    type="date"
                    value={vetForm.nextVisit}
                    onChange={(e) => setVetForm({ ...vetForm, nextVisit: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Notes (optional)</label>
                  <textarea
                    value={vetForm.notes}
                    onChange={(e) => setVetForm({ ...vetForm, notes: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowAddVetModal(false)}
                    className="flex-1 px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-xl font-medium transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white rounded-xl font-medium transition-all"
                  >
                    Add Visit
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Add Medication Modal */}
        {showAddMedModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-slate-800 rounded-2xl border border-teal-500/30 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-slate-700">
                <h2 className="text-2xl font-bold text-white">Add Medication</h2>
              </div>

              <form onSubmit={handleAddMedication} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Medication Name</label>
                  <input
                    type="text"
                    value={medForm.name}
                    onChange={(e) => setMedForm({ ...medForm, name: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white focus:outline-none focus:border-teal-500"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Dosage</label>
                    <input
                      type="text"
                      value={medForm.dosage}
                      onChange={(e) => setMedForm({ ...medForm, dosage: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white focus:outline-none focus:border-teal-500"
                      placeholder="e.g., 10mg"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Frequency</label>
                    <input
                      type="text"
                      value={medForm.frequency}
                      onChange={(e) => setMedForm({ ...medForm, frequency: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white focus:outline-none focus:border-teal-500"
                      placeholder="e.g., Twice daily"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Start Date</label>
                    <input
                      type="date"
                      value={medForm.startDate}
                      onChange={(e) => setMedForm({ ...medForm, startDate: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white focus:outline-none focus:border-teal-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">End Date (optional)</label>
                    <input
                      type="date"
                      value={medForm.endDate}
                      onChange={(e) => setMedForm({ ...medForm, endDate: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white focus:outline-none focus:border-teal-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Notes (optional)</label>
                  <textarea
                    value={medForm.notes}
                    onChange={(e) => setMedForm({ ...medForm, notes: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white focus:outline-none focus:border-teal-500"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowAddMedModal(false)}
                    className="flex-1 px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-xl font-medium transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white rounded-xl font-medium transition-all"
                  >
                    Add Medication
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PetCare;
