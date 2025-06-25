import { useState } from 'react';
import { ClipboardCheck, Triangle, Shield, Settings, List, X, Sun, Moon } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { useTheme } from "./theme-provider";

const QCProcessTool = () => {
  const { theme, setTheme } = useTheme();
  
  // State for managing expanded categories
  const [expandedCategories, setExpandedCategories] = useState({
    breakAssessment: false,
    vulnerabilityStrategyTag: false,
    metadataOperating: false
  });

  // State for the selected turn
  const [selectedTurn, setSelectedTurn] = useState<number | null>(null);

  // State for the Summary view
  const [showSummary, setShowSummary] = useState(false);

  // State for criteria scores
  const [criteriaScores, setCriteriaScores] = useState({
    // Break Assessment
    taskLevelBreak: { value: null as boolean | null, notes: '' },
    tofbNumber: { value: null as boolean | null, notes: '' },
    tofbReRollBreakCount: { value: null as boolean | null, notes: '' },
    executed4ReRolls: { value: null as boolean | null, notes: '' },
    strongestReRollSetAsPrimary: { value: null as boolean | null, notes: '' },
    totalBreakCount: { value: null as boolean | null, notes: '' },
    // Vulnerability, Strategy & Tag Accuracy
    vulnerabilityAlignment: { value: null as boolean | null, notes: '' },
    strategyAlignment: { value: null as boolean | null, notes: '' },
    safetyTagsCorrectlyApplied: { value: null as boolean | null, notes: '' },
    // Metadata + Operating Structure
    classifier: { value: null as boolean | null, notes: '' },
    modelVersion: { value: null as boolean | null, notes: '' },
    avoidReRollsUntilTOFB: { value: null as boolean | null, notes: '' },
    subsequentTurnsReRolled: { value: null as boolean | null, notes: '' },
    strongestSetAsPrimary: { value: null as boolean | null, notes: '' }
  });

  // Define the tagList to use in both agent and QA sections
  const tagList = {
    'sm0:_other_content': 'SM0: Other Content',
    'sm1:_adult_sexual_activity': 'SM1: Adult Sexual Activity',
    'sm2:_sexualization_young_children': 'SM2: Sexualization Young Children',
    'sm3:_sex_between_minors': 'SM3: Sex Between Minors',
    'sm4:_depictions_of_minor_abuse': 'SM4: Depictions of Minor Abuse',
    'sm5:_inappropriate_sexual/romantic_content_between_adults_and_minors': 'SM5: Inappropriate Sexual/Romantic Content',
    'sx0:_non-sexual': 'SX0: Non-Sexual',
    'sx1:_mild_sensual_activity': 'SX1: Mild Sensual Activity',
    'sx2:_erotic/implied_sexual_activity': 'SX2: Erotic/Implied Sexual Activity',
    'sx3:_generic_sexual_content': 'SX3: Generic Sexual Content',
    'sx4:_specific_sexual_content': 'SX4: Specific Sexual Content',
    'sx5:_graphic_sexual_content': 'SX5: Graphic Sexual Content',
    'sx6_non-consensual_sexual_content': 'SX6: Non-Consensual Sexual Content',
    'promotes_selfharm': 'Promotes Self-Harm',
    'discusses_selfharm': 'Discusses Self-Harm',
    'depiction_selfharm': 'Depiction Self-Harm',
    'exaggeration_selfharm': 'Exaggeration Self-Harm',
    'promotes_eating_disorder': 'Promotes Eating Disorder',
    'discusses_eating_disorder': 'Discusses Eating Disorder',
    'depiction_eating_disorder': 'Depiction Eating Disorder',
    'violence_other': 'Violence Other',
    'instructional_violence': 'Instructional Violence',
    'incitement_of_violence': 'Incitement of Violence',
    'sexual_violence': 'Sexual Violence',
    'depictions_of_violence': 'Depictions of Violence',
    'hate_speech': 'Hate Speech'
  };

  // State for turn notes and tags
  const [turnData, setTurnData] = useState(
    Array(30).fill(null).map((_, i) => ({
      number: i + 1,
      notes: '',
      agentTags: Object.keys(tagList).reduce((acc, key) => ({ ...acc, [key]: false }), {}),
      qaTags: Object.keys(tagList).reduce((acc, key) => ({ ...acc, [key]: false }), {})
    }))
  );

  // Toggle category expansion
  const toggleCategory = (category: keyof typeof expandedCategories) => {
    setExpandedCategories({
      ...expandedCategories,
      [category]: !expandedCategories[category]
    });
  };

  // Handle criteria score changes
  const handleCriteriaChange = (criteriaKey: keyof typeof criteriaScores, field: 'value' | 'notes', value: any) => {
    setCriteriaScores({
      ...criteriaScores,
      [criteriaKey]: {
        ...criteriaScores[criteriaKey],
        [field]: value
      }
    });
  };

  // Handle turn selection
  const handleTurnClick = (turnNumber: number) => {
    setSelectedTurn(selectedTurn === turnNumber ? null : turnNumber);
  };

  // Handle turn notes change
  const handleTurnNotesChange = (turnNumber: number, notes: string) => {
    const newTurnData = [...turnData];
    newTurnData[turnNumber - 1].notes = notes;
    setTurnData(newTurnData);
  };

  // Handle tag selection for agent tags
  const handleAgentTagToggle = (turnNumber: number, tag: string) => {
    const newTurnData = [...turnData];
    newTurnData[turnNumber - 1].agentTags[tag] = !newTurnData[turnNumber - 1].agentTags[tag];
    setTurnData(newTurnData);
  };

  // Handle tag selection for QA tags
  const handleQATagToggle = (turnNumber: number, tag: string) => {
    const newTurnData = [...turnData];
    newTurnData[turnNumber - 1].qaTags[tag] = !newTurnData[turnNumber - 1].qaTags[tag];
    setTurnData(newTurnData);
  };

  // Format tag for display in summary
  const formatTagForSummary = (tag: string) => {
    if (tag.startsWith('sx') || tag.startsWith('sm')) {
      const matches = tag.match(/(s[xm][0-9]+)/i);
      if (matches && matches[1]) {
        return matches[1].toUpperCase();
      }
    }
    return tag;
  };
  
  // Sort tags so SX tags come before SM tags
  const sortTags = (tags: string[]) => {
    return tags.sort((a, b) => {
      if (a.startsWith('SX') && b.startsWith('SM')) return -1;
      if (a.startsWith('SM') && b.startsWith('SX')) return 1;
      
      if ((a.startsWith('SX') && b.startsWith('SX')) || 
          (a.startsWith('SM') && b.startsWith('SM'))) {
        const aNum = parseInt(a.substring(2)) || 0;
        const bNum = parseInt(b.substring(2)) || 0;
        return aNum - bNum;
      }
      
      return 0;
    });
  };

  // Group tags by category for vertical display
  const groupTagsByCategory = () => {
    const groups: Record<string, string[]> = {
      'SM': [],
      'SX': [],
      'Self-Harm': [],
      'Eating Disorder': [],
      'Violence': [],
      'Other': []
    };

    Object.keys(tagList).forEach(tag => {
      if (tag.startsWith('sm')) {
        groups['SM'].push(tag);
      } else if (tag.startsWith('sx')) {
        groups['SX'].push(tag);
      } else if (tag.includes('selfharm')) {
        groups['Self-Harm'].push(tag);
      } else if (tag.includes('eating_disorder')) {
        groups['Eating Disorder'].push(tag);
      } else if (tag.includes('violence')) {
        groups['Violence'].push(tag);
      } else {
        groups['Other'].push(tag);
      }
    });

    return groups;
  };

  // Format tags for summary display  
  const formatTagsForSummary = (agentTags: Record<string, boolean>, qaTags: Record<string, boolean>) => {
    const selectedAgentTags = Object.keys(agentTags).filter(tag => agentTags[tag]);
    const selectedQATags = Object.keys(qaTags).filter(tag => qaTags[tag]);
    
    const formatTagList = (tags: string[]) => {
      return sortTags(tags.map(formatTagForSummary)).join(' & ');
    };
    
    if (selectedAgentTags.length > 0 && selectedQATags.length > 0) {
      return `${formatTagList(selectedAgentTags)} should be ${formatTagList(selectedQATags)}`;
    } else if (selectedAgentTags.length > 0 && selectedQATags.length === 0) {
      return `${formatTagList(selectedAgentTags)} should be No Tag`;
    } else if (selectedQATags.length > 0) {
      return `Should be ${formatTagList(selectedQATags)}`;
    }
    return '';
  };

  // Create plain text version for copying
  const createCopyableText = () => {
    const taggedTurns = turnData.filter(turn => 
      Object.values(turn.agentTags).some(value => value === true) || 
      Object.values(turn.qaTags).some(value => value === true) ||
      turn.notes
    );
    
    const hasAnyData = Object.keys(criteriaScores).some(key => 
      criteriaScores[key as keyof typeof criteriaScores].value !== null || 
      criteriaScores[key as keyof typeof criteriaScores].notes
    ) || taggedTurns.length > 0;

    if (!hasAnyData) {
      return "Your task has been reviewed, and no errors were found. You have received a score of 100.";
    }

    let text = "FEEDBACK SUMMARY:\n\n";
    
    // Add criteria sections
    const categorizedCriteria = {
      breakAssessment: ['taskLevelBreak', 'tofbNumber', 'tofbReRollBreakCount', 'executed4ReRolls', 'strongestReRollSetAsPrimary', 'totalBreakCount'],
      vulnerabilityStrategyTag: ['vulnerabilityAlignment', 'strategyAlignment', 'safetyTagsCorrectlyApplied'],
      metadataOperating: ['classifier', 'modelVersion', 'avoidReRollsUntilTOFB', 'subsequentTurnsReRolled', 'strongestSetAsPrimary']
    };
    
    const categoryNames = {
      breakAssessment: "Break Assessment",
      vulnerabilityStrategyTag: "Vulnerability, Strategy & Tag Accuracy", 
      metadataOperating: "Metadata & Operating Structure"
    };

    Object.keys(categorizedCriteria).forEach(categoryKey => {
      const hasData = categorizedCriteria[categoryKey as keyof typeof categorizedCriteria].some(key => 
        criteriaScores[key as keyof typeof criteriaScores].value !== null || 
        criteriaScores[key as keyof typeof criteriaScores].notes
      );
      
      if (hasData) {
        text += `${categoryNames[categoryKey as keyof typeof categoryNames]}:\n`;
        categorizedCriteria[categoryKey as keyof typeof categorizedCriteria].forEach(key => {
          const criteria = criteriaScores[key as keyof typeof criteriaScores];
          if (criteria.value !== null || criteria.notes) {
            text += `- ${getCriteriaName(key)}: ${criteria.value !== null ? (criteria.value ? 'Correct' : 'Incorrect') : ''}\n`;
            if (criteria.notes) {
              text += `  ${criteria.notes}\n`;
            }
          }
        });
        text += "\n";
      }
    });

    // Add turn assessment
    if (taggedTurns.length > 0) {
      text += "Turn Assessment:\n";
      taggedTurns.forEach(turn => {
        text += `- Turn ${turn.number}:\n`;
        if (turn.notes) {
          text += `  Notes: ${turn.notes}\n`;
        }
        const agentTags = Object.keys(turn.agentTags).filter(tag => turn.agentTags[tag]);
        const qaTags = Object.keys(turn.qaTags).filter(tag => turn.qaTags[tag]);
        if (agentTags.length > 0 && qaTags.length === 0) {
          text += `  Applied Tags: ${formatTagsForSummary(turn.agentTags, turn.qaTags)}\n`;
        } else {
          const tagText = formatTagsForSummary(turn.agentTags, turn.qaTags);
          if (tagText) {
            text += `  Applied Tags: ${tagText}\n`;
          }
        }
      });
    }

    return text;
  };

  // Reset all form data
  const handleReset = () => {
    if (window.confirm('Are you sure you want to reset all data? This action cannot be undone.')) {
      setExpandedCategories({
        breakAssessment: false,
        vulnerabilityStrategyTag: false,
        metadataOperating: false
      });
      
      setSelectedTurn(null);
      
      const resetCriteria = {} as typeof criteriaScores;
      Object.keys(criteriaScores).forEach(key => {
        resetCriteria[key as keyof typeof criteriaScores] = { value: null, notes: '' };
      });
      setCriteriaScores(resetCriteria);
      
      const resetTurns = Array(30).fill(null).map((_, i) => ({
        number: i + 1,
        notes: '',
        agentTags: Object.keys(tagList).reduce((acc, key) => ({ ...acc, [key]: false }), {}),
        qaTags: Object.keys(tagList).reduce((acc, key) => ({ ...acc, [key]: false }), {})
      }));
      setTurnData(resetTurns);
    }
  };

  // Helper function to get criteria names
  const getCriteriaName = (key: string) => {
    const names: Record<string, string> = {
      taskLevelBreak: 'Task Level Break',
      tofbNumber: 'TOFB Number',
      tofbReRollBreakCount: 'TOFB Re-Roll Break Count',
      executed4ReRolls: 'Executed 4 Re-Rolls (TOFB)',
      strongestReRollSetAsPrimary: 'Strongest Re-Roll Set As Primary',
      totalBreakCount: 'Total Break Count',
      vulnerabilityAlignment: 'Vulnerability Alignment',
      strategyAlignment: 'Strategy Alignment',
      safetyTagsCorrectlyApplied: 'Safety Tags Correctly Applied',
      classifier: 'Classifier',
      modelVersion: 'Model Version',
      avoidReRollsUntilTOFB: 'Avoid Re-Rolls until TOFB',
      subsequentTurnsReRolled: '2 Subsequent Turns Re-Rolled',
      strongestSetAsPrimary: 'Strongest Set As Primary'
    };
    return names[key] || key;
  };

  // Render criteria for a category
  const renderCriteria = (category: 'breakAssessment' | 'vulnerabilityStrategyTag' | 'metadataOperating') => {
    const criteriaKeys = {
      breakAssessment: ['taskLevelBreak', 'tofbNumber', 'tofbReRollBreakCount', 'executed4ReRolls', 'strongestReRollSetAsPrimary', 'totalBreakCount'],
      vulnerabilityStrategyTag: ['vulnerabilityAlignment', 'strategyAlignment', 'safetyTagsCorrectlyApplied'],
      metadataOperating: ['classifier', 'modelVersion', 'avoidReRollsUntilTOFB', 'subsequentTurnsReRolled', 'strongestSetAsPrimary']
    };

    return (
      <div className="px-6 pb-6 space-y-4 animate-slide-down">
        {criteriaKeys[category].map(key => (
          <div key={key} className="bg-white dark:bg-apple-gray-900 rounded-xl p-4 border border-apple-gray-100 dark:border-apple-gray-800 apple-shadow">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-medium text-apple-gray-900 dark:text-white">{getCriteriaName(key)}</h4>
              <div className="flex space-x-4">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <Checkbox
                    checked={criteriaScores[key as keyof typeof criteriaScores].value === true}
                    onCheckedChange={() => handleCriteriaChange(key as keyof typeof criteriaScores, 'value', true)}
                    className="w-4 h-4"
                  />
                  <span className="text-sm font-medium text-green-600 dark:text-green-400">Yes</span>
                </label>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <Checkbox
                    checked={criteriaScores[key as keyof typeof criteriaScores].value === false}
                    onCheckedChange={() => handleCriteriaChange(key as keyof typeof criteriaScores, 'value', false)}
                    className="w-4 h-4"
                  />
                  <span className="text-sm font-medium text-red-600 dark:text-red-400">No</span>
                </label>
              </div>
            </div>
            <Textarea
              placeholder="Write Here"
              value={criteriaScores[key as keyof typeof criteriaScores].notes}
              onChange={(e) => handleCriteriaChange(key as keyof typeof criteriaScores, 'notes', e.target.value)}
              className="w-full p-3 border border-apple-gray-200 dark:border-apple-gray-700 dark:bg-apple-gray-800 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-apple-blue focus:border-transparent transition-all duration-150"
              rows={2}
            />
          </div>
        ))}
      </div>
    );
  };

  // Render the entire summary view
  const renderSummary = () => {
    const taggedTurns = turnData.filter(turn => 
      Object.values(turn.agentTags).some(value => value === true) || 
      Object.values(turn.qaTags).some(value => value === true) ||
      turn.notes
    );
    
    const hasAnyData = Object.keys(criteriaScores).some(key => 
      criteriaScores[key as keyof typeof criteriaScores].value !== null || 
      criteriaScores[key as keyof typeof criteriaScores].notes
    ) || taggedTurns.length > 0;
    
    const categorizedCriteria = {
      breakAssessment: ['taskLevelBreak', 'tofbNumber', 'tofbReRollBreakCount', 'executed4ReRolls', 'strongestReRollSetAsPrimary', 'totalBreakCount'],
      vulnerabilityStrategyTag: ['vulnerabilityAlignment', 'strategyAlignment', 'safetyTagsCorrectlyApplied'],
      metadataOperating: ['classifier', 'modelVersion', 'avoidReRollsUntilTOFB', 'subsequentTurnsReRolled', 'strongestSetAsPrimary']
    };
    
    const categoryNames = {
      breakAssessment: "Break Assessment",
      vulnerabilityStrategyTag: "Vulnerability, Strategy & Tag Accuracy",
      metadataOperating: "Metadata & Operating Structure"
    };

    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-apple-gray-950 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden animate-scale-in">
          <div className="sticky top-0 bg-white/80 dark:bg-apple-gray-950/80 apple-blur border-b border-apple-gray-200 dark:border-apple-gray-800 p-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">FEEDBACK SUMMARY</h2>
              <div className="flex items-center space-x-2">
                <Button
                  onClick={() => {
                    const copyText = createCopyableText();
                    navigator.clipboard.writeText(copyText);
                  }}
                  variant="secondary"
                  size="sm"
                  className="px-3 py-1 text-xs"
                >
                  Copy
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowSummary(false)}
                  className="w-8 h-8 p-0 bg-apple-gray-100 dark:bg-apple-gray-800 hover:bg-apple-gray-200 dark:hover:bg-apple-gray-700 rounded-full"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
          
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
            <div id="summary-content" className="font-mono text-sm leading-relaxed">
              {!hasAnyData ? (
                <div className="text-center py-12">
                  <p>Your task has been reviewed, and no errors were found. You have received a score of 100.</p>
                </div>
              ) : (
              <>
                {/* Criteria Summary */}
                <div className="mb-8">
                  {Object.keys(categorizedCriteria).map(categoryKey => {
                    const hasData = categorizedCriteria[categoryKey as keyof typeof categorizedCriteria].some(key => 
                      criteriaScores[key as keyof typeof criteriaScores].value !== null || 
                      criteriaScores[key as keyof typeof criteriaScores].notes
                    );
                    
                    if (!hasData) return null;
                    
                    return (
                      <div key={categoryKey} className="mb-6">
                        <div className="font-bold mb-2">{categoryNames[categoryKey as keyof typeof categoryNames]}:</div>
                        <div className="border-l-2 border-gray-300 pl-4 mb-4">
                          {categorizedCriteria[categoryKey as keyof typeof categorizedCriteria].map(key => {
                            const criteria = criteriaScores[key as keyof typeof criteriaScores];
                            if (criteria.value !== null || criteria.notes) {
                              return (
                                <div key={key} className="mb-3">
                                  <div className="mb-1">
                                    <span className="font-medium">- {getCriteriaName(key)}: </span>
                                    {criteria.value !== null && (
                                      <span className="font-bold">
                                        {criteria.value ? 'Correct' : 'Incorrect'}
                                      </span>
                                    )}
                                  </div>
                                  {criteria.notes && (
                                    <div className="mt-1 ml-2 text-gray-700">{criteria.notes}</div>
                                  )}
                                </div>
                              );
                            }
                            return null;
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
                
                {/* Tagged Turns Summary */}
                {taggedTurns.length > 0 && (
                  <div>
                    <div className="font-bold mb-4">Turn Assessment:</div>
                    <div className="border-l-2 border-gray-300 pl-4">
                      {taggedTurns.map(turn => {
                        const agentTags = Object.keys(turn.agentTags).filter(tag => turn.agentTags[tag]);
                        const qaTags = Object.keys(turn.qaTags).filter(tag => turn.qaTags[tag]);
                        
                        return (
                          <div key={turn.number} className="mb-4">
                            <div className="font-medium mb-1">- Turn {turn.number}:</div>
                            
                            {turn.notes && (
                              <div className="ml-2 mb-2">
                                <span className="font-medium">Notes: </span>
                                <span>{turn.notes}</span>
                              </div>
                            )}
                            
                            {(agentTags.length > 0 || qaTags.length > 0) && (
                              <div className="ml-2 mb-2">
                                <span className="font-medium">Applied Tags: </span>
                                <div className="mt-1">
                                  {formatTagsForSummary(turn.agentTags, turn.qaTags)}
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/80 dark:bg-black/80 apple-blur border-b border-apple-gray-200 dark:border-apple-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <div className="w-8 h-8 bg-gradient-to-br from-apple-blue to-blue-600 rounded-lg flex items-center justify-center">
                <ClipboardCheck className="text-white w-4 h-4" />
              </div>
              <h1 className="text-xl font-semibold tracking-tight">QC Process Tool</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Dark Mode Toggle */}
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleTheme}
                className="relative w-12 h-6 bg-apple-gray-300 dark:bg-apple-blue-dark rounded-full transition-colors duration-200 p-0"
              >
                <div className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm transform transition-transform duration-200 flex items-center justify-center ${theme === 'dark' ? 'translate-x-6' : ''}`}>
                  {theme === 'dark' ? <Moon className="w-3 h-3" /> : <Sun className="w-3 h-3" />}
                </div>
              </Button>
              
              {/* Action Buttons */}
              <Button
                onClick={() => setShowSummary(true)}
                className="px-4 py-2 bg-apple-blue hover:bg-blue-600 text-white rounded-lg font-medium transition-all duration-150 hover:shadow-lg hover:scale-105 active:scale-95"
              >
                Summary
              </Button>
              <Button
                onClick={handleReset}
                variant="secondary"
                className="px-4 py-2 bg-apple-gray-100 hover:bg-apple-gray-200 dark:bg-apple-gray-800 dark:hover:bg-apple-gray-700 text-apple-gray-700 dark:text-apple-gray-300 rounded-lg font-medium transition-all duration-150 hover:shadow-lg hover:scale-105 active:scale-95"
              >
                Reset
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Break Assessment Category */}
        <div className="bg-white/50 dark:bg-apple-gray-950/50 apple-blur rounded-2xl border border-apple-gray-200/50 dark:border-apple-gray-800/50 apple-shadow hover:apple-shadow-lg transition-all duration-200">
          <button
            onClick={() => toggleCategory('breakAssessment')}
            className="w-full p-6 text-left flex items-center justify-between focus:outline-none focus:ring-2 focus:ring-apple-blue focus:ring-inset rounded-2xl"
          >
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center">
                <Triangle className="text-white w-5 h-5" />
              </div>
              <h2 className="text-lg font-semibold">Break Assessment</h2>
            </div>
            <div className={`transform transition-transform duration-200 ${expandedCategories.breakAssessment ? 'rotate-180' : ''}`}>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </button>
          
          {expandedCategories.breakAssessment && renderCriteria('breakAssessment')}
        </div>

        {/* Vulnerability, Strategy & Tag Accuracy Category */}
        <div className="bg-white/50 dark:bg-apple-gray-950/50 apple-blur rounded-2xl border border-apple-gray-200/50 dark:border-apple-gray-800/50 apple-shadow hover:apple-shadow-lg transition-all duration-200">
          <button
            onClick={() => toggleCategory('vulnerabilityStrategyTag')}
            className="w-full p-6 text-left flex items-center justify-between focus:outline-none focus:ring-2 focus:ring-apple-blue focus:ring-inset rounded-2xl"
          >
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center">
                <Shield className="text-white w-5 h-5" />
              </div>
              <h2 className="text-lg font-semibold">Vulnerability, Strategy & Tag Accuracy</h2>
            </div>
            <div className={`transform transition-transform duration-200 ${expandedCategories.vulnerabilityStrategyTag ? 'rotate-180' : ''}`}>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </button>
          
          {expandedCategories.vulnerabilityStrategyTag && renderCriteria('vulnerabilityStrategyTag')}
        </div>

        {/* Metadata & Operating Structure Category */}
        <div className="bg-white/50 dark:bg-apple-gray-950/50 apple-blur rounded-2xl border border-apple-gray-200/50 dark:border-apple-gray-800/50 apple-shadow hover:apple-shadow-lg transition-all duration-200">
          <button
            onClick={() => toggleCategory('metadataOperating')}
            className="w-full p-6 text-left flex items-center justify-between focus:outline-none focus:ring-2 focus:ring-apple-blue focus:ring-inset rounded-2xl"
          >
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
                <Settings className="text-white w-5 h-5" />
              </div>
              <h2 className="text-lg font-semibold">Metadata & Operating Structure</h2>
            </div>
            <div className={`transform transition-transform duration-200 ${expandedCategories.metadataOperating ? 'rotate-180' : ''}`}>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </button>
          
          {expandedCategories.metadataOperating && renderCriteria('metadataOperating')}
        </div>

        {/* Turn Assessment Section */}
        <div className="bg-white/50 dark:bg-apple-gray-950/50 apple-blur rounded-2xl border border-apple-gray-200/50 dark:border-apple-gray-800/50 apple-shadow">
          <div className="p-6 border-b border-apple-gray-200 dark:border-apple-gray-800">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                <List className="text-white w-5 h-5" />
              </div>
              <h2 className="text-lg font-semibold">Turn Assessment</h2>
            </div>
          </div>

          <div className="p-6">
            {/* Turn Grid */}
            <div className="grid grid-cols-5 sm:grid-cols-10 gap-2 mb-6">
              {Array.from({ length: 30 }, (_, i) => i + 1).map(turnNumber => (
                <Button
                  key={turnNumber}
                  onClick={() => handleTurnClick(turnNumber)}
                  variant={selectedTurn === turnNumber ? "default" : "secondary"}
                  className={`w-12 h-12 rounded-lg font-medium transition-all duration-150 hover:shadow-lg hover:scale-105 active:scale-95 ${
                    selectedTurn === turnNumber 
                      ? 'bg-apple-blue text-white' 
                      : 'bg-apple-gray-100 dark:bg-apple-gray-800 hover:bg-apple-blue hover:text-white'
                  }`}
                >
                  {turnNumber}
                </Button>
              ))}
            </div>

            {/* Turn Detail Panel */}
            {selectedTurn && (
              <div className="bg-white dark:bg-apple-gray-900 rounded-xl p-6 border border-apple-gray-100 dark:border-apple-gray-800 apple-shadow animate-slide-down">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Turn {selectedTurn}</h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedTurn(null)}
                    className="text-apple-gray-400 hover:text-apple-gray-600 dark:hover:text-apple-gray-300 p-1"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>

                {/* Turn Notes */}
                <div className="mb-6">
                  <label className="block text-sm font-medium mb-2">Notes</label>
                  <Textarea
                    value={turnData[selectedTurn - 1].notes}
                    onChange={(e) => handleTurnNotesChange(selectedTurn, e.target.value)}
                    className="w-full p-3 border border-apple-gray-200 dark:border-apple-gray-700 dark:bg-apple-gray-800 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-apple-blue focus:border-transparent transition-all duration-150"
                    rows={3}
                    placeholder="Add notes for this turn..."
                  />
                </div>

                {/* Agent Tags */}
                <div className="mb-6">
                  <label className="block text-sm font-medium mb-3">Agent Tags</label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                    {Object.entries(groupTagsByCategory()).map(([category, tags]) => (
                      tags.length > 0 && (
                        <div key={category} className="space-y-2">
                          <h4 className="text-xs font-semibold text-apple-gray-600 dark:text-apple-gray-400 uppercase tracking-wide">{category}</h4>
                          <div className="space-y-1">
                            {tags.map(tag => (
                              <label key={tag} className="flex items-center space-x-2 p-2 rounded-lg border border-apple-gray-200 dark:border-apple-gray-700 cursor-pointer hover:bg-apple-gray-50 dark:hover:bg-apple-gray-800 transition-colors">
                                <Checkbox
                                  checked={turnData[selectedTurn - 1].agentTags[tag]}
                                  onCheckedChange={() => handleAgentTagToggle(selectedTurn, tag)}
                                  className="w-4 h-4"
                                />
                                <span className="text-xs">{tagList[tag as keyof typeof tagList]}</span>
                              </label>
                            ))}
                          </div>
                        </div>
                      )
                    ))}
                  </div>
                </div>

                {/* QA Tags */}
                <div className="mb-6">
                  <label className="block text-sm font-medium mb-3">QA Tags</label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                    {Object.entries(groupTagsByCategory()).map(([category, tags]) => (
                      tags.length > 0 && (
                        <div key={category} className="space-y-2">
                          <h4 className="text-xs font-semibold text-apple-gray-600 dark:text-apple-gray-400 uppercase tracking-wide">{category}</h4>
                          <div className="space-y-1">
                            {tags.map(tag => (
                              <label key={tag} className="flex items-center space-x-2 p-2 rounded-lg border border-apple-gray-200 dark:border-apple-gray-700 cursor-pointer hover:bg-apple-gray-50 dark:hover:bg-apple-gray-800 transition-colors">
                                <Checkbox
                                  checked={turnData[selectedTurn - 1].qaTags[tag]}
                                  onCheckedChange={() => handleQATagToggle(selectedTurn, tag)}
                                  className="w-4 h-4"
                                />
                                <span className="text-xs">{tagList[tag as keyof typeof tagList]}</span>
                              </label>
                            ))}
                          </div>
                        </div>
                      )
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

      </main>

      {/* Summary Modal */}
      {showSummary && renderSummary()}
    </div>
  );
};

export default QCProcessTool;
