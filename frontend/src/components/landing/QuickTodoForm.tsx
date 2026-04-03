import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import Icon from '@mdi/react';
import { mdiPlus, mdiCalendar, mdiCheckCircle, mdiFlag } from '@mdi/js';

const QuickTodoForm: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [title, setTitle] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [placeholder, setPlaceholder] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Typing animation for placeholder
  const placeholderTexts = [
    'What do you want to do?',
    'Plan your day...',
    'Add a new task...',
    'Set your goals...'
  ];
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const currentText = placeholderTexts[placeholderIndex];

    const timeout = setTimeout(() => {
      if (!isDeleting && charIndex < currentText.length) {
        setPlaceholder(currentText.substring(0, charIndex + 1));
        setCharIndex(charIndex + 1);
      } else if (isDeleting && charIndex > 0) {
        setPlaceholder(currentText.substring(0, charIndex - 1));
        setCharIndex(charIndex - 1);
      } else if (!isDeleting && charIndex === currentText.length) {
        setTimeout(() => setIsDeleting(true), 2000);
      } else if (isDeleting && charIndex === 0) {
        setIsDeleting(false);
        setPlaceholderIndex((placeholderIndex + 1) % placeholderTexts.length);
      }
    }, isDeleting ? 50 : 100);

    return () => clearTimeout(timeout);
  }, [charIndex, isDeleting, placeholderIndex]);

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate a brief loading state for better UX
    setTimeout(() => {
      navigate('/login');
    }, 600);
  };

  const getPriorityColor = (priorityLevel: string) => {
    switch (priorityLevel) {
      case 'high':
        return 'text-red-500';
      case 'medium':
        return 'text-orange-500';
      case 'low':
        return 'text-blue-500';
      default:
        return 'text-orange-500';
    }
  };

  return (
    <Card className="shadow-lg border border-white/20 bg-white/10 backdrop-blur-xl h-full overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between pb-4 border-b border-white/20">
        <div>
          <CardTitle className="text-lg font-bold text-white">Quick Add Task</CardTitle>
          <p className="text-xs text-white/60 mt-0.5">Create a new task instantly</p>
        </div>
        <motion.button
          className="text-xs text-primary font-semibold flex items-center gap-1 px-3 py-1.5 rounded-full hover:bg-white/10 transition-colors cursor-pointer"
          onClick={() => {
            if (!isAuthenticated) {
              navigate('/login');
            } else {
              navigate('/todo');
            }
          }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          View All →
        </motion.button>
      </CardHeader>
      <CardContent className="p-6 space-y-5">
        {/* Task Creation Form */}
        <form onSubmit={handleCreateTask} className="space-y-5">
          {/* Title Field with Icon */}
          <motion.div
            className="relative group"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <label className="text-xs font-semibold text-white mb-2 block">
              Task Title
            </label>
            <div className="relative flex items-center">
              <motion.div
                className="absolute left-4 z-10 flex items-center justify-center"
                animate={{ rotate: title ? 360 : 0 }}
                transition={{ duration: 0.3 }}
              >
                <Icon path={mdiCheckCircle} size={0.85} className={title ? "text-orange-500" : "text-gray-400"} />
              </motion.div>
              <Input
                id="task-title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={placeholder + '|'}
                className="h-12 w-full pl-12 pr-4 text-sm border-0 bg-white/10 backdrop-blur-xl border border-white/20 text-white placeholder:text-white/60 rounded-xl transition-all duration-300 focus:ring-2 focus:ring-primary/20 focus:shadow-lg shadow-sm"
                required
              />
            </div>
          </motion.div>

          {/* Date and Priority Row */}
          <motion.div
            className="grid grid-cols-2 gap-4"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            {/* Due Date Field */}
            <div>
              <label className="text-xs font-semibold text-white mb-2 block">
                Due Date
              </label>
              <div className="relative flex items-center">
                <motion.div
                  className="absolute left-4 z-10 flex items-center justify-center pointer-events-none"
                  animate={{ scale: dueDate ? [1, 1.2, 1] : 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <Icon path={mdiCalendar} size={0.75} className={dueDate ? "text-orange-500" : "text-gray-400"} />
                </motion.div>
                <Input
                  id="task-date"
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="h-11 w-full pl-11 pr-3 text-sm border-0 bg-white/10 backdrop-blur-xl border border-white/20 text-white rounded-xl transition-all duration-300 focus:ring-2 focus:ring-primary/20 shadow-sm"
                  required
                />
              </div>
            </div>

            {/* Priority Selector */}
            <div>
              <label className="text-xs font-semibold text-white mb-2 block">
                Priority
              </label>
              <Select value={priority} onValueChange={(value: any) => setPriority(value)}>
                <SelectTrigger className="h-11 text-sm font-medium border-0 bg-white/10 backdrop-blur-xl border border-white/20 text-white rounded-xl transition-all duration-300 hover:bg-white/20 shadow-sm">
                  <div className="flex items-center gap-2">
                    <Icon path={mdiFlag} size={0.7} className={getPriorityColor(priority)} />
                    <SelectValue />
                  </div>
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value="low" className="rounded-lg">
                    <div className="flex items-center gap-2">
                      <Icon path={mdiFlag} size={0.65} className="text-blue-500" />
                      <span>Low</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="medium" className="rounded-lg">
                    <div className="flex items-center gap-2">
                      <Icon path={mdiFlag} size={0.65} className="text-orange-500" />
                      <span>Medium</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="high" className="rounded-lg">
                    <div className="flex items-center gap-2">
                      <Icon path={mdiFlag} size={0.65} className="text-red-500" />
                      <span>High</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </motion.div>

          {/* Add Task Button */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            <motion.div
              whileHover={{ scale: 1.01, y: -2 }}
              whileTap={{ scale: 0.99 }}
              animate={{
                y: [0, -8, 0],
                scale: [1, 1.02, 1]
              }}
              transition={{
                duration: 0.6,
                repeat: Infinity,
                repeatDelay: 3,
                delay: 3
              }}
            >
              <Button
                type="submit"
                disabled={isSubmitting || !title.trim()}
                className="w-full h-12 bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 font-semibold text-sm text-white rounded-xl shadow-lg shadow-teal-500/25 transition-all duration-300 relative overflow-hidden group disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <AnimatePresence mode="wait">
                  {isSubmitting ? (
                    <motion.div
                      key="loading"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="flex items-center gap-2"
                    >
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      >
                        <Icon path={mdiPlus} size={0.75} />
                      </motion.div>
                      <span>Creating task...</span>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="default"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="flex items-center gap-2"
                    >
                      <span>🚫</span>
                      <span>Add Task</span>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Shine effect on hover */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                  initial={{ x: "-100%" }}
                  whileHover={{ x: "100%" }}
                  transition={{ duration: 0.6 }}
                />
              </Button>
            </motion.div>
          </motion.div>
        </form>
      </CardContent>
    </Card>
  );
};

export default QuickTodoForm;
