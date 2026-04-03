/**
 * Lesson Player Generator for React Native App Creator
 *
 * Generates lesson player, sidebar, and quiz components:
 * - Video player placeholder (expo-av)
 * - Lesson navigation sidebar
 * - Quiz with questions and answers
 */

export interface LessonPlayerOptions {
  componentName?: string;
  endpoint?: string;
}

export interface LessonSidebarOptions {
  componentName?: string;
  endpoint?: string;
}

export interface QuizPlayerOptions {
  componentName?: string;
  endpoint?: string;
}

/**
 * Generate a lesson player component for React Native with expo-av
 */
export function generateLessonPlayer(options: LessonPlayerOptions = {}): string {
  const {
    componentName = 'LessonPlayer',
    endpoint = '/lessons',
  } = options;

  return `import React, { useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  Dimensions,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { Video, ResizeMode, AVPlaybackStatus } from 'expo-av';
import { api } from '@/lib/api';
import { showToast } from '@/lib/toast';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const VIDEO_HEIGHT = SCREEN_WIDTH * 0.5625; // 16:9 aspect ratio

interface ${componentName}Props {
  courseId?: string;
  lessonId?: string;
  style?: any;
}

const ${componentName}: React.FC<${componentName}Props> = ({
  courseId: propCourseId,
  lessonId: propLessonId,
  style,
}) => {
  const route = useRoute<any>();
  const navigation = useNavigation();
  const queryClient = useQueryClient();
  const videoRef = useRef<Video>(null);

  const courseId = propCourseId || route.params?.courseId;
  const lessonId = propLessonId || route.params?.lessonId;

  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [position, setPosition] = useState(0);

  const { data: lesson, isLoading } = useQuery({
    queryKey: ['lesson', lessonId],
    queryFn: async () => {
      const response = await api.get<any>('${endpoint}/' + lessonId);
      return response?.data || response;
    },
    enabled: !!lessonId,
  });

  const completeMutation = useMutation({
    mutationFn: () => api.post(\`/lessons/\${lessonId}/complete\`, {}),
    onSuccess: () => {
      showToast('success', 'Lesson completed!');
      queryClient.invalidateQueries({ queryKey: ['lesson', lessonId] });
      queryClient.invalidateQueries({ queryKey: ['enrollment', courseId] });
      queryClient.invalidateQueries({ queryKey: ['lessons', courseId] });
    },
  });

  const handlePlaybackStatusUpdate = useCallback((status: AVPlaybackStatus) => {
    if (!status.isLoaded) return;

    setIsPlaying(status.isPlaying);
    setDuration(status.durationMillis || 0);
    setPosition(status.positionMillis || 0);

    if (status.durationMillis) {
      const currentProgress = (status.positionMillis / status.durationMillis) * 100;
      setProgress(currentProgress);

      // Mark lesson as complete when 90% watched
      if (currentProgress >= 90 && !lesson?.is_completed && !completeMutation.isPending) {
        completeMutation.mutate();
      }
    }
  }, [lesson?.is_completed, completeMutation]);

  const togglePlayPause = async () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      await videoRef.current.pauseAsync();
    } else {
      await videoRef.current.playAsync();
    }
  };

  const toggleMute = async () => {
    if (!videoRef.current) return;
    await videoRef.current.setIsMutedAsync(!isMuted);
    setIsMuted(!isMuted);
  };

  const seekTo = async (percent: number) => {
    if (!videoRef.current || !duration) return;
    const newPosition = (percent / 100) * duration;
    await videoRef.current.setPositionAsync(newPosition);
  };

  const formatTime = (millis: number) => {
    const totalSeconds = Math.floor(millis / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return \`\${minutes}:\${seconds.toString().padStart(2, '0')}\`;
  };

  if (isLoading) {
    return (
      <View style={[styles.container, styles.centered, style]}>
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  if (!lesson) {
    return (
      <View style={[styles.container, styles.centered, style]}>
        <Text style={styles.errorText}>Lesson not found</Text>
      </View>
    );
  }

  const videoUrl = lesson.video_url;
  const title = lesson.title || 'Untitled Lesson';
  const description = lesson.description;
  const content = lesson.content;
  const isCompleted = lesson.is_completed;

  return (
    <ScrollView style={[styles.container, style]} showsVerticalScrollIndicator={false}>
      {/* Video Player */}
      <View style={styles.videoContainer}>
        {videoUrl ? (
          <>
            <Video
              ref={videoRef}
              source={{ uri: videoUrl }}
              style={styles.video}
              resizeMode={ResizeMode.CONTAIN}
              onPlaybackStatusUpdate={handlePlaybackStatusUpdate}
              useNativeControls={false}
            />

            {/* Custom Controls */}
            <View style={styles.controlsOverlay}>
              {/* Progress Bar */}
              <TouchableOpacity
                style={styles.progressBarContainer}
                onPress={(e) => {
                  const percent = (e.nativeEvent.locationX / (SCREEN_WIDTH - 32)) * 100;
                  seekTo(Math.max(0, Math.min(100, percent)));
                }}
                activeOpacity={1}
              >
                <View style={styles.progressBarBackground}>
                  <View style={[styles.progressBarFill, { width: \`\${progress}%\` }]} />
                </View>
              </TouchableOpacity>

              {/* Bottom Controls */}
              <View style={styles.controlsRow}>
                <View style={styles.leftControls}>
                  <TouchableOpacity
                    style={styles.controlButton}
                    onPress={togglePlayPause}
                    activeOpacity={0.7}
                  >
                    <Ionicons
                      name={isPlaying ? 'pause' : 'play'}
                      size={24}
                      color="#FFFFFF"
                    />
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.controlButton}
                    onPress={toggleMute}
                    activeOpacity={0.7}
                  >
                    <Ionicons
                      name={isMuted ? 'volume-mute' : 'volume-high'}
                      size={22}
                      color="#FFFFFF"
                    />
                  </TouchableOpacity>

                  <Text style={styles.timeText}>
                    {formatTime(position)} / {formatTime(duration)}
                  </Text>
                </View>

                <TouchableOpacity
                  style={styles.controlButton}
                  onPress={async () => {
                    if (videoRef.current) {
                      await videoRef.current.presentFullscreenPlayer();
                    }
                  }}
                  activeOpacity={0.7}
                >
                  <Ionicons name="expand" size={22} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
            </View>
          </>
        ) : (
          <View style={styles.noVideoContainer}>
            <Ionicons name="videocam-off-outline" size={48} color="#9CA3AF" />
            <Text style={styles.noVideoText}>No video available</Text>
          </View>
        )}
      </View>

      {/* Lesson Info */}
      <View style={styles.infoContainer}>
        <View style={styles.titleRow}>
          <Text style={styles.lessonTitle}>{title}</Text>
          {isCompleted && (
            <View style={styles.completedBadge}>
              <Ionicons name="checkmark-circle" size={20} color="#10B981" />
              <Text style={styles.completedText}>Completed</Text>
            </View>
          )}
        </View>

        {description && (
          <Text style={styles.description}>{description}</Text>
        )}

        {content && (
          <View style={styles.contentContainer}>
            <Text style={styles.contentText}>{content}</Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 300,
  },
  videoContainer: {
    width: SCREEN_WIDTH,
    height: VIDEO_HEIGHT,
    backgroundColor: '#000000',
    position: 'relative',
  },
  video: {
    width: '100%',
    height: '100%',
  },
  noVideoContainer: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1F2937',
  },
  noVideoText: {
    color: '#9CA3AF',
    fontSize: 16,
    marginTop: 12,
  },
  controlsOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    paddingTop: 32,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  progressBarContainer: {
    marginBottom: 12,
  },
  progressBarBackground: {
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 2,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#3B82F6',
    borderRadius: 2,
  },
  controlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  leftControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  controlButton: {
    padding: 4,
  },
  timeText: {
    color: '#FFFFFF',
    fontSize: 12,
  },
  infoContainer: {
    backgroundColor: '#FFFFFF',
    padding: 16,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  lessonTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
    flex: 1,
  },
  completedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginLeft: 12,
  },
  completedText: {
    fontSize: 14,
    color: '#10B981',
    fontWeight: '500',
  },
  description: {
    fontSize: 16,
    color: '#4B5563',
    lineHeight: 24,
    marginBottom: 16,
  },
  contentContainer: {
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  contentText: {
    fontSize: 16,
    color: '#374151',
    lineHeight: 24,
  },
  errorText: {
    color: '#EF4444',
    fontSize: 16,
  },
});

export default ${componentName};
`;
}

/**
 * Generate a lesson sidebar/navigation component for React Native
 */
export function generateLessonSidebar(options: LessonSidebarOptions = {}): string {
  const {
    componentName = 'LessonSidebar',
    endpoint = '/lessons',
  } = options;

  return `import React, { useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { api } from '@/lib/api';

interface ${componentName}Props {
  courseId?: string;
  currentLessonId?: string;
  onLessonSelect?: (lesson: any) => void;
  style?: any;
}

interface LessonItemProps {
  lesson: any;
  index: number;
  isActive: boolean;
  onPress: () => void;
}

const LessonItem: React.FC<LessonItemProps> = ({ lesson, index, isActive, onPress }) => {
  const isLocked = lesson.is_locked;
  const isCompleted = lesson.is_completed;
  const isVideo = lesson.type === 'video';

  const getIcon = () => {
    if (isCompleted) return { name: 'checkmark-circle', color: '#10B981' };
    if (isLocked) return { name: 'lock-closed', color: '#9CA3AF' };
    if (isVideo) return { name: 'play-circle', color: isActive ? '#3B82F6' : '#6B7280' };
    return { name: 'document-text', color: isActive ? '#3B82F6' : '#6B7280' };
  };

  const icon = getIcon();

  return (
    <TouchableOpacity
      style={[
        styles.lessonItem,
        isActive && styles.lessonItemActive,
        isLocked && styles.lessonItemLocked,
      ]}
      onPress={isLocked ? undefined : onPress}
      activeOpacity={isLocked ? 1 : 0.7}
      disabled={isLocked}
    >
      <Text style={styles.lessonIndex}>{index + 1}</Text>
      <Ionicons name={icon.name as any} size={20} color={icon.color} />
      <View style={styles.lessonContent}>
        <Text
          style={[
            styles.lessonTitle,
            isActive && styles.lessonTitleActive,
            isLocked && styles.lessonTitleLocked,
          ]}
          numberOfLines={2}
        >
          {lesson.title}
        </Text>
        {lesson.duration && (
          <Text style={styles.lessonDuration}>{lesson.duration}</Text>
        )}
      </View>
    </TouchableOpacity>
  );
};

const ${componentName}: React.FC<${componentName}Props> = ({
  courseId: propCourseId,
  currentLessonId: propLessonId,
  onLessonSelect,
  style,
}) => {
  const route = useRoute<any>();
  const navigation = useNavigation();
  const courseId = propCourseId || route.params?.courseId;
  const currentLessonId = propLessonId || route.params?.lessonId;

  const { data: lessons, isLoading } = useQuery({
    queryKey: ['lessons', courseId],
    queryFn: async () => {
      const response = await api.get<any>('${endpoint}?course_id=' + courseId);
      return Array.isArray(response) ? response : (response?.data || []);
    },
    enabled: !!courseId,
  });

  const handleLessonPress = useCallback((lesson: any) => {
    if (onLessonSelect) {
      onLessonSelect(lesson);
    } else {
      navigation.navigate(
        'LessonPlayer' as never,
        { courseId, lessonId: lesson.id } as never
      );
    }
  }, [onLessonSelect, navigation, courseId]);

  const renderLesson = useCallback(({ item, index }: { item: any; index: number }) => (
    <LessonItem
      lesson={item}
      index={index}
      isActive={item.id === currentLessonId}
      onPress={() => handleLessonPress(item)}
    />
  ), [currentLessonId, handleLessonPress]);

  const keyExtractor = useCallback((item: any) => (item.id || item._id)?.toString(), []);

  if (isLoading) {
    return (
      <View style={[styles.container, styles.centered, style]}>
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  return (
    <View style={[styles.container, style]}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Course Content</Text>
      </View>
      <FlatList
        data={lessons}
        renderItem={renderLesson}
        keyExtractor={keyExtractor}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 150,
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  listContent: {
    paddingVertical: 8,
  },
  separator: {
    height: 1,
    backgroundColor: '#F3F4F6',
    marginHorizontal: 16,
  },
  lessonItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    gap: 12,
  },
  lessonItemActive: {
    backgroundColor: '#EFF6FF',
    borderLeftWidth: 3,
    borderLeftColor: '#3B82F6',
  },
  lessonItemLocked: {
    opacity: 0.5,
  },
  lessonIndex: {
    fontSize: 14,
    color: '#9CA3AF',
    width: 24,
    textAlign: 'center',
  },
  lessonContent: {
    flex: 1,
  },
  lessonTitle: {
    fontSize: 14,
    color: '#111827',
  },
  lessonTitleActive: {
    color: '#3B82F6',
    fontWeight: '500',
  },
  lessonTitleLocked: {
    color: '#9CA3AF',
  },
  lessonDuration: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
});

export default ${componentName};
`;
}

/**
 * Generate a quiz player component for React Native
 */
export function generateQuizPlayer(options: QuizPlayerOptions = {}): string {
  const {
    componentName = 'QuizPlayer',
    endpoint = '/quizzes',
  } = options;

  return `import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { api } from '@/lib/api';
import { showToast } from '@/lib/toast';

interface ${componentName}Props {
  quizId?: string;
  style?: any;
}

interface QuestionData {
  id: string;
  text: string;
  options: string[];
}

interface QuizResults {
  score: number;
  correct: number;
  total: number;
}

const ${componentName}: React.FC<${componentName}Props> = ({ quizId: propQuizId, style }) => {
  const route = useRoute<any>();
  const navigation = useNavigation();
  const quizId = propQuizId || route.params?.quizId;

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [showResults, setShowResults] = useState(false);
  const [results, setResults] = useState<QuizResults | null>(null);

  const { data: quiz, isLoading } = useQuery({
    queryKey: ['quiz', quizId],
    queryFn: async () => {
      const response = await api.get<any>('${endpoint}/' + quizId);
      return response?.data || response;
    },
    enabled: !!quizId,
  });

  const submitMutation = useMutation({
    mutationFn: (answers: Record<string, string>) =>
      api.post(\`${endpoint}/\${quizId}/submit\`, { answers }),
    onSuccess: (data: any) => {
      const resultData = data?.data || data;
      setResults(resultData);
      setShowResults(true);
    },
    onError: () => showToast('error', 'Failed to submit quiz'),
  });

  const handleAnswer = useCallback((answer: string) => {
    if (!quiz?.questions) return;
    const question = quiz.questions[currentQuestion];
    setAnswers((prev) => ({ ...prev, [question.id]: answer }));
  }, [quiz, currentQuestion]);

  const handleNext = useCallback(() => {
    if (!quiz?.questions) return;
    if (currentQuestion < quiz.questions.length - 1) {
      setCurrentQuestion((prev) => prev + 1);
    } else {
      submitMutation.mutate(answers);
    }
  }, [quiz, currentQuestion, answers, submitMutation]);

  const handleRetry = useCallback(() => {
    setCurrentQuestion(0);
    setAnswers({});
    setShowResults(false);
    setResults(null);
  }, []);

  if (isLoading) {
    return (
      <View style={[styles.container, styles.centered, style]}>
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  if (!quiz || !quiz.questions || quiz.questions.length === 0) {
    return (
      <View style={[styles.container, styles.centered, style]}>
        <Ionicons name="help-circle-outline" size={48} color="#9CA3AF" />
        <Text style={styles.errorText}>Quiz not found</Text>
      </View>
    );
  }

  const questions: QuestionData[] = quiz.questions;
  const question = questions[currentQuestion];
  const passingScore = quiz.passing_score || 70;

  // Results Screen
  if (showResults && results) {
    const passed = results.score >= passingScore;

    return (
      <View style={[styles.container, style]}>
        <View style={styles.resultsContainer}>
          <View style={[
            styles.resultIconContainer,
            passed ? styles.resultIconPassed : styles.resultIconFailed,
          ]}>
            <Ionicons
              name={passed ? 'checkmark-circle' : 'close-circle'}
              size={48}
              color={passed ? '#10B981' : '#EF4444'}
            />
          </View>

          <Text style={styles.resultTitle}>
            {passed ? 'Congratulations!' : 'Keep Practicing'}
          </Text>

          <Text style={styles.resultScore}>
            You scored {results.score}%
          </Text>

          <Text style={styles.resultDetails}>
            ({results.correct}/{results.total} correct answers)
          </Text>

          <View style={styles.resultActions}>
            <TouchableOpacity
              style={styles.retryButton}
              onPress={handleRetry}
              activeOpacity={0.7}
            >
              <Ionicons name="refresh" size={18} color="#4B5563" />
              <Text style={styles.retryButtonText}>Retry Quiz</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.continueButton}
              onPress={() => navigation.goBack()}
              activeOpacity={0.7}
            >
              <Text style={styles.continueButtonText}>Continue</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }

  // Quiz Screen
  return (
    <View style={[styles.container, style]}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.quizTitle}>{quiz.title}</Text>
          <Text style={styles.questionCount}>
            Question {currentQuestion + 1} of {questions.length}
          </Text>
        </View>

        {/* Progress Bar */}
        <View style={styles.progressBarContainer}>
          <View style={styles.progressBarBackground}>
            <View
              style={[
                styles.progressBarFill,
                { width: \`\${((currentQuestion + 1) / questions.length) * 100}%\` },
              ]}
            />
          </View>
        </View>

        {/* Question */}
        <View style={styles.questionContainer}>
          <Text style={styles.questionText}>{question.text}</Text>

          <View style={styles.optionsContainer}>
            {question.options.map((option, index) => {
              const isSelected = answers[question.id] === option;
              const optionLetter = String.fromCharCode(65 + index);

              return (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.optionButton,
                    isSelected && styles.optionButtonSelected,
                  ]}
                  onPress={() => handleAnswer(option)}
                  activeOpacity={0.7}
                >
                  <View style={[
                    styles.optionLetter,
                    isSelected && styles.optionLetterSelected,
                  ]}>
                    <Text style={[
                      styles.optionLetterText,
                      isSelected && styles.optionLetterTextSelected,
                    ]}>
                      {optionLetter}
                    </Text>
                  </View>
                  <Text style={[
                    styles.optionText,
                    isSelected && styles.optionTextSelected,
                  ]}>
                    {option}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Next/Submit Button */}
        <TouchableOpacity
          style={[
            styles.nextButton,
            !answers[question.id] && styles.nextButtonDisabled,
          ]}
          onPress={handleNext}
          disabled={!answers[question.id] || submitMutation.isPending}
          activeOpacity={0.7}
        >
          {submitMutation.isPending ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : currentQuestion === questions.length - 1 ? (
            <Text style={styles.nextButtonText}>Submit Quiz</Text>
          ) : (
            <>
              <Text style={styles.nextButtonText}>Next</Text>
              <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
            </>
          )}
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    padding: 16,
    paddingTop: 24,
  },
  quizTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  questionCount: {
    fontSize: 14,
    color: '#6B7280',
  },
  progressBarContainer: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  progressBarBackground: {
    height: 6,
    backgroundColor: '#E5E7EB',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#3B82F6',
    borderRadius: 3,
  },
  questionContainer: {
    padding: 16,
  },
  questionText: {
    fontSize: 18,
    fontWeight: '500',
    color: '#111827',
    lineHeight: 26,
    marginBottom: 24,
  },
  optionsContainer: {
    gap: 12,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    gap: 12,
  },
  optionButtonSelected: {
    borderColor: '#3B82F6',
    backgroundColor: '#EFF6FF',
  },
  optionLetter: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  optionLetterSelected: {
    backgroundColor: '#3B82F6',
  },
  optionLetterText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4B5563',
  },
  optionLetterTextSelected: {
    color: '#FFFFFF',
  },
  optionText: {
    flex: 1,
    fontSize: 16,
    color: '#111827',
  },
  optionTextSelected: {
    color: '#3B82F6',
    fontWeight: '500',
  },
  nextButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#3B82F6',
    marginHorizontal: 16,
    marginVertical: 24,
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  nextButtonDisabled: {
    backgroundColor: '#9CA3AF',
  },
  nextButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  errorText: {
    fontSize: 16,
    color: '#6B7280',
    marginTop: 12,
  },
  // Results styles
  resultsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  resultIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  resultIconPassed: {
    backgroundColor: '#D1FAE5',
  },
  resultIconFailed: {
    backgroundColor: '#FEE2E2',
  },
  resultTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
  },
  resultScore: {
    fontSize: 18,
    color: '#4B5563',
    marginBottom: 4,
  },
  resultDetails: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 32,
  },
  resultActions: {
    flexDirection: 'row',
    gap: 12,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 10,
    gap: 8,
  },
  retryButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#4B5563',
  },
  continueButton: {
    backgroundColor: '#3B82F6',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 10,
  },
  continueButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

export default ${componentName};
`;
}
