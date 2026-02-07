import { Search, Zap, TrendingUp, Crown, Users, Target, Award } from 'lucide-react';
import { LeaderboardTimeframe, LeaderboardScope } from '@/services/german-api';

interface LeaderboardFiltersProps {
  timeframe: LeaderboardTimeframe;
  scope: LeaderboardScope;
  selectedLevel: string;
  selectedModule: string;
  searchQuery: string;
  levels: string[];
  onTimeframeChange: (timeframe: LeaderboardTimeframe) => void;
  onScopeChange: (scope: LeaderboardScope) => void;
  onLevelChange: (level: string) => void;
  onModuleChange: (module: string) => void;
  onSearchChange: (search: string) => void;
}

const TIMEFRAME_OPTIONS: { value: LeaderboardTimeframe; label: string; icon: any }[] = [
  { value: 'weekly', label: 'This Week', icon: Zap },
  { value: 'monthly', label: 'This Month', icon: TrendingUp },
  { value: 'all-time', label: 'All Time', icon: Crown },
];

const SCOPE_OPTIONS: { value: LeaderboardScope; label: string; icon: any }[] = [
  { value: 'global', label: 'Global', icon: Users },
  { value: 'level', label: 'By Level', icon: Target },
  { value: 'module', label: 'By Module', icon: Award },
];

const MODULE_OPTIONS = [
  { value: 'vocabulary', label: 'Vocabulary' },
  { value: 'reading', label: 'Reading' },
  { value: 'listening', label: 'Listening' },
  { value: 'speaking', label: 'Speaking' },
  { value: 'writing', label: 'Writing' },
  { value: 'grammar', label: 'Grammar' },
];

export function LeaderboardFilters({
  timeframe,
  scope,
  selectedLevel,
  selectedModule,
  searchQuery,
  levels,
  onTimeframeChange,
  onScopeChange,
  onLevelChange,
  onModuleChange,
  onSearchChange,
}: LeaderboardFiltersProps) {
  return (
    <div className="bg-white rounded-xl p-4 md:p-6 mb-6 shadow-sm border border-gray-200">
      {/* Main Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        {/* Timeframe */}
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-2">Timeframe</label>
          <div className="grid grid-cols-3 gap-2">
            {TIMEFRAME_OPTIONS.map((option) => (
              <button
                key={option.value}
                onClick={() => onTimeframeChange(option.value)}
                className={`px-3 py-2 rounded-lg font-medium transition text-sm md:text-base ${
                  timeframe === option.value
                    ? 'bg-purple-500 text-white shadow-md'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <option.icon className="w-4 h-4 inline mr-1 md:mr-2" />
                <span className="hidden sm:inline">{option.label}</span>
                <span className="sm:hidden">
                  {option.value === 'weekly' ? 'Week' : option.value === 'monthly' ? 'Month' : 'All'}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Scope */}
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-2">Scope</label>
          <div className="grid grid-cols-3 gap-2">
            {SCOPE_OPTIONS.map((option) => (
              <button
                key={option.value}
                onClick={() => onScopeChange(option.value)}
                className={`px-3 py-2 rounded-lg font-medium transition text-sm md:text-base ${
                  scope === option.value
                    ? 'bg-blue-500 text-white shadow-md'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <option.icon className="w-4 h-4 inline mr-1 md:mr-2" />
                <span className="hidden sm:inline">{option.label}</span>
                <span className="sm:hidden">
                  {option.value === 'global' ? 'All' : option.value === 'level' ? 'Lvl' : 'Mod'}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Conditional Filters + Search */}
      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Level Filter */}
        {scope === 'level' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Select Level</label>
            <select
              value={selectedLevel}
              onChange={(e) => onLevelChange(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white"
            >
              <option value="">All Levels</option>
              {levels.map((level) => (
                <option key={level} value={level}>
                  {level}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Module Filter */}
        {scope === 'module' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Select Module</label>
            <select
              value={selectedModule}
              onChange={(e) => onModuleChange(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white"
            >
              <option value="">All Modules</option>
              {MODULE_OPTIONS.map((mod) => (
                <option key={mod.value} value={mod.value}>
                  {mod.label}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Search */}
        <div className={scope === 'global' ? 'md:col-span-2' : ''}>
          <label className="block text-sm font-medium text-gray-700 mb-2">Search User</label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search by username or name..."
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
