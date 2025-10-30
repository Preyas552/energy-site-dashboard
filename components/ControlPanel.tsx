'use client';

interface ControlPanelProps {
  cellCount: number;
  siteCount: number;
  isAnalyzing: boolean;
  analysisProgress?: string;
  comparisonMode: boolean;
  onAnalyze: () => void;
  onClear: () => void;
  onToggleComparison: (enabled: boolean) => void;
}

export default function ControlPanel({
  cellCount,
  siteCount,
  isAnalyzing,
  analysisProgress,
  comparisonMode,
  onAnalyze,
  onClear,
  onToggleComparison,
}: ControlPanelProps) {
  return (
    <div className="absolute top-4 left-4 bg-white rounded-lg shadow-lg p-4 z-10 min-w-64">
      <h2 className="text-lg font-semibold mb-3 text-gray-800">Site Selection</h2>
      
      <div className="space-y-2 mb-4">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Cells Selected:</span>
          <span className="font-semibold text-gray-800">{cellCount}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Sites (merged):</span>
          <span className="font-semibold text-gray-800">{siteCount}</span>
        </div>
      </div>

      {analysisProgress && (
        <div className="mb-3 p-2 bg-blue-50 border border-blue-200 rounded text-sm text-blue-700">
          {analysisProgress}
        </div>
      )}

      <div className="mb-4 p-3 bg-gray-50 rounded-lg">
        <label className="flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={comparisonMode}
            onChange={(e) => onToggleComparison(e.target.checked)}
            className="mr-2 h-4 w-4"
          />
          <span className="text-sm font-medium text-gray-700">
            Compare Fuzzy vs Crisp TOPSIS
          </span>
        </label>
        {comparisonMode && (
          <p className="text-xs text-gray-500 mt-1">
            Shows side-by-side comparison of uncertainty-aware (fuzzy) vs traditional (crisp) analysis
          </p>
        )}
      </div>

      <div className="space-y-2">
        <button
          onClick={onAnalyze}
          disabled={cellCount === 0 || isAnalyzing}
          className={`w-full py-2 px-4 rounded-md font-medium transition-colors ${
            cellCount === 0 || isAnalyzing
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
        >
          {isAnalyzing ? 'Analyzing...' : 'Analyze Sites'}
        </button>
        
        <button
          onClick={onClear}
          disabled={cellCount === 0 || isAnalyzing}
          className={`w-full py-2 px-4 rounded-md font-medium transition-colors ${
            cellCount === 0 || isAnalyzing
              ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Clear Selection
        </button>
      </div>
    </div>
  );
}
