import React, { useState, useEffect } from 'react';
import { Award, Star, Zap, Target, TrendingUp, BookOpen, Clock, Trophy, Medal, Crown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: 'progress' | 'streak' | 'score' | 'milestone' | 'skill';
  unlockedAt?: Date;
  progress: number; // 0-100
  requirements: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  points: number;
  skillLevel?: string;
  subject?: string;
}

interface SkillLevel {
  subject: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
  progress: number; // 0-100
  experience: number;
  nextLevel: number;
  badges: string[];
}

interface AchievementSystemProps {
  achievements: Achievement[];
  skillLevels: SkillLevel[];
  onAchievementUnlocked?: (achievement: Achievement) => void;
}

const rarityColors = {
  common: 'bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600',
  rare: 'bg-blue-50 dark:bg-blue-900/20 border-blue-300 dark:border-blue-600',
  epic: 'bg-purple-50 dark:bg-purple-900/20 border-purple-300 dark:border-purple-600',
  legendary: 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-300 dark:border-yellow-600'
};

const rarityIcons = {
  common: <Star className="w-4 h-4 text-gray-500" />,
  rare: <Star className="w-4 h-4 text-blue-500" />,
  epic: <Star className="w-4 h-4 text-purple-500" />,
  legendary: <Crown className="w-4 h-4 text-yellow-500" />
};

const skillLevelColors = {
  Beginner: 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-200',
  Intermediate: 'bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200',
  Advanced: 'bg-purple-100 dark:bg-purple-900/20 text-purple-800 dark:text-purple-200',
  Expert: 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-200'
};

export const AchievementSystem: React.FC<AchievementSystemProps> = ({
  achievements,
  skillLevels,
  onAchievementUnlocked
}) => {
  const [showCelebration, setShowCelebration] = useState(false);
  const [celebratingAchievement, setCelebratingAchievement] = useState<Achievement | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'progress' | 'streak' | 'score' | 'milestone' | 'skill'>('all');

  // Check for newly unlocked achievements
  useEffect(() => {
    const newlyUnlocked = achievements.filter(a => a.unlockedAt && 
      new Date(a.unlockedAt).getTime() > Date.now() - 5000); // Unlocked in last 5 seconds
    
    if (newlyUnlocked.length > 0) {
      setCelebratingAchievement(newlyUnlocked[0]);
      setShowCelebration(true);
      setTimeout(() => setShowCelebration(false), 3000);
    }
  }, [achievements]);

  const filteredAchievements = selectedCategory === 'all' 
    ? achievements 
    : achievements.filter(a => a.category === selectedCategory);

  const unlockedCount = achievements.filter(a => a.unlockedAt).length;
  const totalPoints = achievements.filter(a => a.unlockedAt).reduce((sum, a) => sum + a.points, 0);

  const categories = [
    { key: 'all', label: 'All', icon: <Award className="w-4 h-4" /> },
    { key: 'progress', label: 'Progress', icon: <TrendingUp className="w-4 h-4" /> },
    { key: 'streak', label: 'Streaks', icon: <Zap className="w-4 h-4" /> },
    { key: 'score', label: 'Scores', icon: <Target className="w-4 h-4" /> },
    { key: 'milestone', label: 'Milestones', icon: <Trophy className="w-4 h-4" /> },
    { key: 'skill', label: 'Skills', icon: <BookOpen className="w-4 h-4" /> }
  ];

  return (
    <div className="space-y-6">
      {/* Achievement Celebration Modal */}
      <AnimatePresence>
        {showCelebration && celebratingAchievement && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
            onClick={() => setShowCelebration(false)}
          >
            <motion.div
              initial={{ y: 50 }}
              animate={{ y: 0 }}
              exit={{ y: 50 }}
              className="bg-white dark:bg-gray-800 rounded-2xl p-8 max-w-md mx-4 text-center shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <motion.div
                animate={{ 
                  rotate: [0, 10, -10, 10, 0],
                  scale: [1, 1.1, 1]
                }}
                transition={{ duration: 0.5 }}
                className="text-6xl mb-4"
              >
                {celebratingAchievement.icon}
              </motion.div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Achievement Unlocked!
              </h3>
              <p className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">
                {celebratingAchievement.title}
              </p>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {celebratingAchievement.description}
              </p>
              <div className="flex items-center justify-center space-x-2">
                {rarityIcons[celebratingAchievement.rarity]}
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  +{celebratingAchievement.points} points
                </span>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Achievement Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-4 border border-blue-200 dark:border-blue-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-600 dark:text-blue-400 font-medium">Achievements</p>
              <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                {unlockedCount}/{achievements.length}
              </p>
            </div>
            <Award className="w-8 h-8 text-blue-600 dark:text-blue-400" />
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl p-4 border border-green-200 dark:border-green-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-600 dark:text-green-400 font-medium">Total Points</p>
              <p className="text-2xl font-bold text-green-900 dark:text-green-100">
                {totalPoints}
              </p>
            </div>
            <Star className="w-8 h-8 text-green-600 dark:text-green-400" />
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-900/20 dark:to-violet-900/20 rounded-xl p-4 border border-purple-200 dark:border-purple-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-purple-600 dark:text-purple-400 font-medium">Skill Levels</p>
              <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">
                {skillLevels.length}
              </p>
            </div>
            <BookOpen className="w-8 h-8 text-purple-600 dark:text-purple-400" />
          </div>
        </div>
      </div>

      {/* Skill Level Indicators */}
      <div className="card">
        <div className="card-header">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Skill Levels</h2>
        </div>
        <div className="card-body">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {skillLevels.map((skill) => (
              <motion.div
                key={skill.subject}
                whileHover={{ scale: 1.02 }}
                className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-gradient-to-r from-gray-50 to-slate-50 dark:from-gray-900 dark:via-gray-800/50 dark:to-slate-900/30"
              >
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-medium text-gray-900 dark:text-white">{skill.subject}</h3>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${skillLevelColors[skill.level]}`}>
                    {skill.level}
                  </span>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                    <span>Progress</span>
                    <span className="font-medium text-gray-900 dark:text-white">{skill.progress}%</span>
                  </div>
                  
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${skill.progress}%` }}
                      transition={{ duration: 1, delay: 0.2 }}
                      className={`h-2 rounded-full ${
                        skill.level === 'Beginner' ? 'bg-green-500' :
                        skill.level === 'Intermediate' ? 'bg-blue-500' :
                        skill.level === 'Advanced' ? 'bg-purple-500' : 'bg-yellow-500'
                      }`}
                    />
                  </div>
                  
                  <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                    <span>{skill.experience} XP</span>
                    <span>Next: {skill.nextLevel} XP</span>
                  </div>
                </div>
                
                {skill.badges.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-3">
                    {skill.badges.map((badge, index) => (
                      <span key={index} className="text-lg">{badge}</span>
                    ))}
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Achievement Categories */}
      <div className="card">
        <div className="card-header">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Achievements</h2>
        </div>
        <div className="card-body">
          {/* Category Filter */}
          <div className="flex flex-wrap gap-2 mb-6">
            {categories.map((category) => (
              <button
                key={category.key}
                onClick={() => setSelectedCategory(category.key as any)}
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedCategory === category.key
                    ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                {category.icon}
                <span>{category.label}</span>
              </button>
            ))}
          </div>

          {/* Achievements Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredAchievements.map((achievement) => (
              <motion.div
                key={achievement.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ scale: 1.02 }}
                className={`p-4 rounded-lg border transition-all duration-200 ${
                  achievement.unlockedAt 
                    ? 'bg-gradient-to-r from-green-50 to-emerald-50 dark:from-gray-900 dark:via-green-900/20 dark:to-emerald-900/10 border-green-200 dark:border-green-800/30 shadow-sm dark:shadow-green-900/20' 
                    : 'bg-gradient-to-r from-gray-50 to-slate-50 dark:from-gray-900 dark:via-gray-800/50 dark:to-slate-900/30 border-gray-200 dark:border-gray-700/50 shadow-sm dark:shadow-gray-900/20'
                }`}
              >
                <div className="flex items-start space-x-3">
                  <div className="text-3xl">{achievement.icon}</div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className={`font-medium ${
                        achievement.unlockedAt ? 'text-green-900 dark:text-green-100' : 'text-gray-700 dark:text-gray-300'
                      }`}>
                        {achievement.title}
                      </h3>
                      <div className="flex items-center space-x-1">
                        {rarityIcons[achievement.rarity]}
                        <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                          {achievement.points}
                        </span>
                      </div>
                    </div>
                    
                    <p className={`text-sm mb-2 ${
                      achievement.unlockedAt ? 'text-green-600 dark:text-green-300' : 'text-gray-500 dark:text-gray-400'
                    }`}>
                      {achievement.description}
                    </p>
                    
                    {!achievement.unlockedAt && (
                      <div className="space-y-2">
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${achievement.progress}%` }}
                            transition={{ duration: 0.8 }}
                            className="bg-blue-600 dark:bg-blue-500 h-2 rounded-full"
                          />
                        </div>
                        <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                          <span>{achievement.progress}% complete</span>
                          <span>{achievement.requirements}</span>
                        </div>
                      </div>
                    )}
                    
                    {achievement.unlockedAt && (
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-green-600 dark:text-green-400 font-medium">
                          Unlocked {achievement.unlockedAt.toLocaleDateString()}
                        </span>
                        <Award className="w-5 h-5 text-green-600 dark:text-green-400" />
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
