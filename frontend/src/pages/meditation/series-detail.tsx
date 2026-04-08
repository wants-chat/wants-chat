// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Progress } from '../../components/ui/progress';
import { Skeleton } from '../../components/ui/skeleton';
import {
  Play,
  Clock,
  ArrowLeft,
  CheckCircle,
  Lock,
  Star,
  Users,
  BookOpen,
  Target,
  Headphones,
} from 'lucide-react';
import Icon from '@mdi/react';
import { mdiMeditation } from '@mdi/js';
import { meditationService } from '../../services/meditationService';
import { toast } from '../../components/ui/sonner';

const SeriesDetail: React.FC = () => {
  const { seriesId } = useParams();
  const navigate = useNavigate();

  // State for API data
  const [series, setSeries] = useState<any>(null);
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Enrollment state
  const [isEnrolling, setIsEnrolling] = useState(false);
  const [enrollmentError, setEnrollmentError] = useState<string | null>(null);
  const [isEnrolled, setIsEnrolled] = useState(false);

  // Load program data on mount
  useEffect(() => {
    const loadProgramData = async () => {
      if (!seriesId) {
        setError('No series ID provided');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Fetch program from API
        const programData = await meditationService.getProgramById(seriesId);

        // Fetch program sessions
        const sessionsData = await meditationService.getProgramSessions(seriesId);

        if (programData) {
          // Add UI-specific fields
          const enhancedProgram = {
            ...programData,
            sessions: sessionsData.total_sessions || programData.sessionsCount || 7,
            sessionsCount: sessionsData.total_sessions || programData.sessionsCount || 7,
            totalDuration: `${
              (sessionsData.total_sessions || programData.sessionsCount || 7) * 15
            } min`,
            rating: programData.rating || 0,
            completed: sessionsData.completed_count || 0,
            nextSession: sessionsData.completed_count + 1,
            accentColor: 'primary',
          };

          // Determine enrollment status:
          // If we have sessions data and at least one session is unlocked or completed, user is enrolled
          const hasUnlockedSessions = sessionsData.sessions.some(
            (s) => !s.is_locked || s.is_completed,
          );
          const enrollmentStatus =
            programData.isEnrolled || hasUnlockedSessions || sessionsData.sessions.length > 0;
          setIsEnrolled(enrollmentStatus);

          setSeries(enhancedProgram);

          // Map sessions data to match UI format
          const mappedSessions =
            sessionsData.sessions.length > 0
              ? sessionsData.sessions.map((session, index) => ({
                  id: session.id || index + 1,
                  title: session.title || `Session ${index + 1}`,
                  description: session.description || '',
                  duration: session.duration_minutes || 15,
                  day: session.day_number || index + 1,
                  completed: session.is_completed || false,
                  isLocked: session.is_locked || false,
                  audioId: session.audio_url || null,  // Use audio_url as available
                  canAccess: !session.is_locked || false,
                  sessionType: session.session_type,
                  instructions: session.instructions,
                }))
              : Array.from({ length: programData.sessionsCount || 7 }, (_, i) => ({
                  id: i + 1,
                  title: `Day ${i + 1}: Session`,
                  description: `${programData.name} - Part ${i + 1}`,
                  duration: 15,
                  day: i + 1,
                  completed: false,
                  isLocked: i > 0,
                }));

          setSessions(mappedSessions);
        } else {
          setError('Program not found');
        }
      } catch (err: any) {
        console.error('Failed to load program data:', err);
        setError(err.message || 'Failed to load program data');
      } finally {
        setLoading(false);
      }
    };

    loadProgramData();
  }, [seriesId]);


  // Loading state
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10 bg-white/10" />
          <div>
            <Skeleton className="h-8 w-64 mb-2 bg-white/10" />
            <Skeleton className="h-4 w-96 bg-white/10" />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2 p-6 bg-white/10 backdrop-blur-xl border border-white/20">
            <Skeleton className="h-64 w-full bg-white/10" />
          </Card>
          <Card className="p-6 bg-white/10 backdrop-blur-xl border border-white/20">
            <Skeleton className="h-48 w-full bg-white/10" />
          </Card>
        </div>

        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="p-6 bg-white/10 backdrop-blur-xl border border-white/20">
              <Skeleton className="h-20 w-full bg-white/10" />
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!series) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-white mb-2">Series Not Found</h2>
          <p className="text-white/60 mb-6">
            The requested meditation series could not be found.
          </p>
          <Button onClick={() => navigate('/meditation/series')} className="bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white">Back to Series</Button>
        </div>
      </div>
    );
  }

  const progressPercentage = (series.completed / series.sessions) * 100;
  const isStarted = series.completed > 0;

  const handlePlaySession = async (sessionId: number, audioId?: string) => {
    if (!seriesId) return;

    // Navigate directly to the meditation player with audio_id if available
    if (audioId) {
      navigate(`/meditation/player/program/${seriesId}/session/${sessionId}/${audioId}`);
    } else {
      // Fallback for sessions without audio_id
      navigate(`/meditation/player/program/${seriesId}/session/${sessionId}`);
    }
  };

  const handleContinue = () => {
    const nextSession = sessions.find((s: any) => !s.completed);
    if (nextSession) {
      handlePlaySession(nextSession.id, nextSession.audioId);
    }
  };

  const handleEnrollment = async () => {
    if (!seriesId) return;

    setIsEnrolling(true);
    setEnrollmentError(null);

    try {
      const result = await meditationService.enrollInMeditationProgram(seriesId);
      console.log('Enrollment successful:', result);

      setIsEnrolled(true);

      // Optionally refresh the program data to get updated enrollment status
      // You could also update the series state directly with the new enrollment data
      if (result.program) {
        setSeries((prev: any) => ({
          ...prev,
          ...result.program,
          isEnrolled: true,
        }));
      }

      // Show success message
      toast.success(result.message || 'Successfully enrolled in program!');
    } catch (error: any) {
      console.error('Enrollment failed:', error);

      // Handle specific error codes
      if (error.statusCode === 409) {
        setEnrollmentError('You are already enrolled in this program');
        setIsEnrolled(true);
      } else if (error.statusCode === 401) {
        setEnrollmentError('Please log in to enroll in programs');
      } else if (error.statusCode === 404) {
        setEnrollmentError('Program not found');
      } else {
        setEnrollmentError(error.message || 'Failed to enroll in program');
      }
    } finally {
      setIsEnrolling(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/meditation/series')} className="text-white hover:bg-white/10">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">
              {series.title || series.name}
            </h1>
            <p className="text-white/60">{series.description}</p>
          </div>
        </div>
      </div>

      {/* Series Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Info */}
        <Card className="lg:col-span-2 p-6 bg-teal-500/20 backdrop-blur-xl border border-teal-400/30">
          <div className="flex items-start gap-6">
            <div className="w-24 h-24 rounded-xl bg-teal-500/20 flex items-center justify-center flex-shrink-0">
              <Icon path={mdiMeditation} size={2} className="text-teal-400" />
            </div>

            <div className="flex-1">
              <div className="flex items-center gap-3 mb-4">
                <h3 className="text-2xl font-bold text-white">
                  {series.title || series.name}
                </h3>
                {series.isPremium && (
                  <Badge className="bg-white/10 backdrop-blur-xl border border-white/20 text-amber-400">
                    Premium
                  </Badge>
                )}
                {isEnrolled && !isStarted && (
                  <Badge className="bg-white/10 backdrop-blur-xl border border-white/20 text-green-400">
                    Enrolled
                  </Badge>
                )}
                {isStarted && <Badge className="bg-gradient-to-r from-teal-500 to-cyan-500 text-white">In Progress</Badge>}
              </div>

              <p className="text-white/60 mb-6 leading-relaxed">{series.description}</p>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-teal-400" />
                  <span className="text-sm text-white/60">{series.sessions} sessions</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-teal-400" />
                  <span className="text-sm text-white/60">{series.totalDuration}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Target className="h-4 w-4 text-teal-400" />
                  <span className="text-sm text-white/60">{series.difficulty}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Star className="h-4 w-4 fill-current text-amber-400" />
                  <span className="text-sm text-white/60">{series.rating}</span>
                </div>
              </div>

              {/* Tags */}
              {series.tags && series.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {series.tags.map((tag: string, tagIndex: number) => (
                    <Badge key={tagIndex} variant="secondary" className="text-xs bg-white/10 text-white/80 border border-white/20">
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}

              {/* Progress */}
              {isStarted && (
                <div className="space-y-2 mb-6">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-white/60">Progress</span>
                    <span className="text-sm font-medium text-white">
                      {series.completed}/{series.sessions} sessions (
                      {Math.round(progressPercentage)}%)
                    </span>
                  </div>
                  <div className="w-full bg-white/10 rounded-full h-2">
                    <div className="bg-gradient-to-r from-teal-500 to-cyan-500 h-2 rounded-full" style={{ width: `${progressPercentage}%` }} />
                  </div>
                </div>
              )}

              <div className="flex gap-3">
                {!isEnrolled ? (
                  // Show enrollment button if not enrolled
                  <Button
                    size="lg"
                    className="bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white"
                    onClick={handleEnrollment}
                    disabled={isEnrolling}
                  >
                    {isEnrolling ? (
                      <>
                        <div className="w-5 h-5 mr-2 animate-spin rounded-full border-2 border-white/30 border-t-white"></div>
                        Enrolling...
                      </>
                    ) : (
                      <>
                        <Users className="h-5 w-5 mr-2" />
                        Enroll in Program
                      </>
                    )}
                  </Button>
                ) : isStarted ? (
                  // Show continue button if enrolled and started
                  <Button
                    size="lg"
                    className="bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white"
                    onClick={handleContinue}
                  >
                    <Play className="h-5 w-5 mr-2" />
                    Continue Series
                  </Button>
                ) : (
                  // Show start button if enrolled but not started
                  <Button
                    size="lg"
                    className="bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white"
                    onClick={() => {
                      const firstSession = sessions[0];
                      handlePlaySession(firstSession?.id || 1, firstSession?.audioId);
                    }}
                  >
                    <Play className="h-5 w-5 mr-2" />
                    Start Series
                  </Button>
                )}

                <Button variant="outline" size="lg" className="border-white/20 text-white hover:bg-white/10">
                  <Users className="h-5 w-5 mr-2" />
                  1.2k joined
                </Button>
              </div>

              {/* Show enrollment error if any */}
              {enrollmentError && (
                <div className="mt-3 p-3 bg-red-500/10 border border-red-400/20 rounded-md">
                  <p className="text-sm text-red-400">{enrollmentError}</p>
                </div>
              )}
            </div>
          </div>
        </Card>

        {/* Instructor Info */}
        <Card className="p-6 bg-white/10 backdrop-blur-xl border border-white/20">
          <h4 className="text-lg font-semibold text-white mb-4">Your Guide</h4>
          <div className="space-y-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-teal-500/20 to-cyan-500/30 flex items-center justify-center">
              <span className="text-lg font-bold text-teal-400">
                {series.instructor
                  .split(' ')
                  .map((n: string) => n[0])
                  .join('')}
              </span>
            </div>
            <div>
              <h5 className="font-semibold text-white">{series.instructor}</h5>
              <p className="text-sm text-white/60">Meditation Teacher</p>
            </div>
            <p className="text-sm text-white/60 leading-relaxed">
              {series.instructor === 'Wants AI Team'
                ? 'Our team of experienced meditation teachers bring diverse perspectives to guide your practice.'
                : 'Expert meditation teacher with years of experience guiding students in mindfulness practice.'}
            </p>
          </div>
        </Card>
      </div>

      {/* Sessions List */}
      <div>
        <h3 className="text-xl font-semibold text-white mb-6">All Sessions</h3>

        {/* Enrollment message for locked sessions */}
        {!isEnrolled && (
          <div className="mb-6 p-4 bg-white/10 backdrop-blur-xl border border-white/20 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Lock className="h-4 w-4 text-blue-400" />
              <p className="text-sm font-medium text-white">
                Enrollment Required
              </p>
            </div>
            <p className="text-xs text-white/80">
              Enroll in this program to unlock all sessions and start your meditation journey.
            </p>
          </div>
        )}

        <div className="space-y-3">
          {sessions.map((session: any, index: number) => {
            const isCompleted = session.completed;
            // For enrolled users, the first incomplete session is current. For non-enrolled users, none are current.
            const isCurrent =
              isEnrolled &&
              !isCompleted &&
              sessions.filter((s: any) => s.completed).length === index;
            // Lock sessions if not enrolled, or if the session itself is locked from API
            const isLocked = !isEnrolled || session.isLocked;

            return (
              <Card
                key={session.id}
                className={`p-6 transition-all duration-200 backdrop-blur-xl ${
                  isLocked
                    ? 'opacity-60 cursor-not-allowed bg-white/5 border border-white/10'
                    : `cursor-pointer hover:shadow-md ${
                        isCurrent
                          ? 'ring-2 ring-teal-400 bg-teal-500/20 border border-teal-400/30'
                          : isCompleted
                          ? 'bg-teal-500/10 border border-teal-400/20'
                          : 'bg-white/10 border border-white/20 hover:bg-white/15'
                      }`
                }`}
                onClick={() => !isLocked && handlePlaySession(session.id, session.audioId)}
              >
                <div className="flex items-center gap-4">
                  {/* Session Number/Status */}
                  <div className="flex-shrink-0">
                    {isCompleted ? (
                      <div className="w-12 h-12 rounded-full bg-gradient-to-r from-teal-500 to-cyan-500 flex items-center justify-center">
                        <CheckCircle className="h-6 w-6 text-white" />
                      </div>
                    ) : isLocked ? (
                      <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center">
                        <Lock className="h-6 w-6 text-white/40" />
                      </div>
                    ) : (
                      <div
                        className={`w-12 h-12 rounded-full border-2 flex items-center justify-center ${
                          isCurrent
                            ? 'border-teal-400 bg-gradient-to-r from-teal-500 to-cyan-500 text-white'
                            : 'border-white/20 bg-white/10 text-white'
                        }`}
                      >
                        {isCurrent ? (
                          <Play className="h-6 w-6 ml-1" />
                        ) : (
                          <span className="font-semibold">{session.day || index + 1}</span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Session Info */}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="text-lg font-semibold text-white">{session.title}</h4>
                      {isCurrent && (
                        <Badge className="bg-gradient-to-r from-teal-500 to-cyan-500 text-white text-xs">Up Next</Badge>
                      )}
                      {isCompleted && (
                        <Badge className="bg-teal-500/20 text-teal-400 border border-teal-400/30 text-xs">Completed</Badge>
                      )}
                    </div>
                    <p className="text-white/60 mb-2">{session.description}</p>
                    <div className="flex items-center gap-4 text-sm text-white/60">
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        <span>{session.duration} minutes</span>
                      </div>
                      <span>Day {session.day || index + 1}</span>
                      {session.audioId && (
                        <div className="flex items-center gap-1">
                          <Headphones className="h-4 w-4 text-teal-400" />
                          <span className="text-xs">Audio</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Action */}
                  <div className="flex-shrink-0">
                    {!isLocked && (
                      <Button
                        variant={isCurrent ? 'default' : 'ghost'}
                        size="sm"
                        className={isCurrent ? 'bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white' : 'text-white hover:bg-white/10'}
                        onClick={(e) => {
                          e.stopPropagation();
                          handlePlaySession(session.id, session.audioId);
                        }}
                      >
                        <Play className="h-4 w-4 mr-2" />
                        {isCompleted ? 'Replay' : 'Play'}
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default SeriesDetail;