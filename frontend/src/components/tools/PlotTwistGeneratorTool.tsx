import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Sparkles, BookOpen, Zap, Save, RefreshCw, Lightbulb, Info } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';
import ExportDropdown from '../ui/ExportDropdown';
import { useConfirmDialog } from '../ui/ConfirmDialog';

type StoryGenre = 'mystery' | 'romance' | 'thriller' | 'fantasy' | 'scifi' | 'drama';
type TwistType = 'betrayal' | 'revelation' | 'reversal';
type IntensityLevel = 'subtle' | 'moderate' | 'dramatic';

interface GenreConfig {
  name: string;
  icon: string;
  description: string;
}

interface TwistTemplate {
  setup: string;
  twist: string;
  tips: string[];
}

interface SavedIdea {
  id: string;
  genre: StoryGenre;
  twistType: TwistType;
  intensity: IntensityLevel;
  twist: TwistTemplate;
  savedAt: Date;
}

const COLUMNS = [
  { key: 'twist', label: 'Twist' },
  { key: 'genre', label: 'Genre' },
  { key: 'twistType', label: 'Type' },
  { key: 'intensity', label: 'Intensity' },
  { key: 'savedAt', label: 'Saved At' },
];

interface PlotTwistGeneratorToolProps {
  uiConfig?: UIConfig;
}

export const PlotTwistGeneratorTool: React.FC<PlotTwistGeneratorToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const { confirm, ConfirmDialog } = useConfirmDialog();
  const [isPrefilled, setIsPrefilled] = useState(false);
  const [validationMessage, setValidationMessage] = useState<string | null>(null);

  const [genre, setGenre] = useState<StoryGenre>('mystery');
  const [twistType, setTwistType] = useState<TwistType>('revelation');

  // Handle prefill from uiConfig
  useEffect(() => {
    if (uiConfig?.prefillData && !isPrefilled) {
      const data = uiConfig.prefillData;
      if (data.genre && ['mystery', 'romance', 'thriller', 'fantasy', 'scifi', 'drama'].includes(data.genre as string)) {
        setGenre(data.genre as StoryGenre);
      }
      if (data.twistType && ['betrayal', 'revelation', 'reversal'].includes(data.twistType as string)) {
        setTwistType(data.twistType as TwistType);
      }
      if (data.intensity && ['subtle', 'moderate', 'dramatic'].includes(data.intensity as string)) {
        setIntensity(data.intensity as IntensityLevel);
      }
      setIsPrefilled(true);
    }
  }, [uiConfig, isPrefilled]);
  const [intensity, setIntensity] = useState<IntensityLevel>('moderate');
  const [generatedTwist, setGeneratedTwist] = useState<TwistTemplate | null>(null);
  const [savedIdeas, setSavedIdeas] = useState<SavedIdea[]>([]);
  const [showSaved, setShowSaved] = useState(false);

  const genres: Record<StoryGenre, GenreConfig> = {
    mystery: {
      name: 'Mystery',
      icon: '🔍',
      description: 'Whodunits and detective stories',
    },
    romance: {
      name: 'Romance',
      icon: '💕',
      description: 'Love stories and relationships',
    },
    thriller: {
      name: 'Thriller',
      icon: '😱',
      description: 'Suspense and tension',
    },
    fantasy: {
      name: 'Fantasy',
      icon: '🧙',
      description: 'Magic and mythical worlds',
    },
    scifi: {
      name: 'Sci-Fi',
      icon: '🚀',
      description: 'Future tech and space',
    },
    drama: {
      name: 'Drama',
      icon: '🎭',
      description: 'Human conflict and emotion',
    },
  };

  const twistTypes: Record<TwistType, { name: string; description: string }> = {
    betrayal: {
      name: 'Betrayal',
      description: 'A trusted ally reveals their true colors',
    },
    revelation: {
      name: 'Revelation',
      description: 'A hidden truth comes to light',
    },
    reversal: {
      name: 'Reversal',
      description: 'The situation flips completely',
    },
  };

  const intensityLevels: Record<IntensityLevel, { name: string; description: string }> = {
    subtle: {
      name: 'Subtle',
      description: 'Hints and foreshadowing for attentive readers',
    },
    moderate: {
      name: 'Moderate',
      description: 'Surprising but believable within context',
    },
    dramatic: {
      name: 'Dramatic',
      description: 'Jaw-dropping, game-changing revelation',
    },
  };

  // Twist templates based on genre, type, and intensity
  const twistTemplates: Record<StoryGenre, Record<TwistType, Record<IntensityLevel, TwistTemplate>>> = {
    mystery: {
      betrayal: {
        subtle: {
          setup: 'The detective\'s trusted informant has been feeding partial truths.',
          twist: 'The informant is protecting a family member who is the real culprit.',
          tips: ['Plant small inconsistencies in the informant\'s stories', 'Show the informant avoiding certain topics', 'Reveal the family connection through background details'],
        },
        moderate: {
          setup: 'The victim\'s best friend has been helping the investigation.',
          twist: 'The best friend staged the crime to inherit a hidden fortune.',
          tips: ['Show the friend\'s genuine grief to mislead readers', 'Include subtle financial hints', 'Make the twist logical in hindsight'],
        },
        dramatic: {
          setup: 'The detective has been working with a partner for years.',
          twist: 'The partner is the mastermind behind a series of connected crimes.',
          tips: ['Establish deep trust between characters', 'Reframe past cases in new light', 'Make the reveal emotionally devastating'],
        },
      },
      revelation: {
        subtle: {
          setup: 'An old photograph surfaces during the investigation.',
          twist: 'The photograph reveals the victim had a secret identity.',
          tips: ['Scatter visual clues throughout', 'Let readers piece it together', 'Make the revelation feel earned'],
        },
        moderate: {
          setup: 'The crime scene holds a cryptic message.',
          twist: 'The message is a confession from someone already dead.',
          tips: ['Use the message as a recurring motif', 'Build tension around decoding it', 'Connect it to earlier events'],
        },
        dramatic: {
          setup: 'Everyone believes the case is solved.',
          twist: 'The real murderer has been the narrator all along.',
          tips: ['Use unreliable narration carefully', 'Plant subtle contradictions', 'Ensure the reveal recontextualizes everything'],
        },
      },
      reversal: {
        subtle: {
          setup: 'The investigation points to a clear suspect.',
          twist: 'The "victim" staged their own death to frame the suspect.',
          tips: ['Create sympathy for the victim early', 'Include odd details at the crime scene', 'Reveal motive gradually'],
        },
        moderate: {
          setup: 'The detective is hunting a dangerous criminal.',
          twist: 'The detective was the criminal\'s original victim, seeking revenge.',
          tips: ['Blur the lines between justice and vengeance', 'Show the detective\'s personal investment', 'Question who the real villain is'],
        },
        dramatic: {
          setup: 'A serial killer has been terrorizing the city.',
          twist: 'There is no serial killer - it\'s a group of unconnected copycats.',
          tips: ['Create a compelling false pattern', 'Show investigators forcing connections', 'Make each case subtly different'],
        },
      },
    },
    romance: {
      betrayal: {
        subtle: {
          setup: 'The love interest has been keeping a small secret.',
          twist: 'They\'ve been corresponding with their ex about moving away.',
          tips: ['Show increasing phone secrecy', 'Create misunderstandable situations', 'Resolve through honest communication'],
        },
        moderate: {
          setup: 'The protagonist\'s best friend supports their relationship.',
          twist: 'The best friend has been sabotaging chances to keep them close.',
          tips: ['Show the friend\'s subtle interference', 'Create plausible explanations', 'Reveal jealousy beneath friendship'],
        },
        dramatic: {
          setup: 'A perfect relationship seems destined to succeed.',
          twist: 'The partner was hired by the protagonist\'s family to keep them away from someone else.',
          tips: ['Make the deception deeply layered', 'Show genuine feelings developing', 'Create an impossible choice'],
        },
      },
      revelation: {
        subtle: {
          setup: 'Two strangers meet and fall in love.',
          twist: 'They were childhood friends who don\'t remember each other.',
          tips: ['Include nostalgic moments that feel like deja vu', 'Use shared memories as connection', 'Make the discovery romantic'],
        },
        moderate: {
          setup: 'The protagonist falls for someone from a different world.',
          twist: 'The love interest left their old life behind after a tragedy connected to the protagonist\'s family.',
          tips: ['Build the past as mystery', 'Create tension around secrets', 'Use revelation to deepen connection'],
        },
        dramatic: {
          setup: 'Star-crossed lovers fight to be together.',
          twist: 'They share a parent - they\'re half-siblings who never knew.',
          tips: ['Build genuine romance first', 'Handle with sensitivity', 'Focus on emotional aftermath'],
        },
      },
      reversal: {
        subtle: {
          setup: 'The protagonist pursues their crush throughout the story.',
          twist: 'The quiet friend who helped with the pursuit was the true match all along.',
          tips: ['Show genuine chemistry with the friend', 'Make the crush less compatible subtly', 'Let realization feel natural'],
        },
        moderate: {
          setup: 'Two people hate each other at first meeting.',
          twist: 'Their animosity stems from being too similar and recognizing their own flaws.',
          tips: ['Mirror their behaviors and reactions', 'Show moments of reluctant understanding', 'Make enemies-to-lovers believable'],
        },
        dramatic: {
          setup: 'The protagonist is about to marry the wrong person.',
          twist: 'The wedding crasher is their soulmate from a past life seeking them across time.',
          tips: ['Include unexplainable connections', 'Use dreams and premonitions', 'Balance fantasy with emotion'],
        },
      },
    },
    thriller: {
      betrayal: {
        subtle: {
          setup: 'A team works together to survive a dangerous situation.',
          twist: 'One member has been leaking information for personal gain.',
          tips: ['Show the traitor\'s reluctance', 'Create pressure that explains their choice', 'Make betrayal feel tragic'],
        },
        moderate: {
          setup: 'The protagonist trusts their handler completely.',
          twist: 'The handler is playing both sides and the protagonist is expendable.',
          tips: ['Build genuine care between them', 'Show handler\'s internal conflict', 'Create a moment of impossible choice'],
        },
        dramatic: {
          setup: 'The protagonist\'s family is their motivation to survive.',
          twist: 'Their family has been dead for years - it\'s all a psychological manipulation.',
          tips: ['Make family interactions feel real', 'Include subtle wrongness', 'Reveal through protagonist\'s breakdown'],
        },
      },
      revelation: {
        subtle: {
          setup: 'A witness holds the key to solving the case.',
          twist: 'The witness is suffering from memory manipulation and their testimony is planted.',
          tips: ['Show small memory inconsistencies', 'Question the nature of truth', 'Make the revelation chilling'],
        },
        moderate: {
          setup: 'The protagonist hunts a terrorist organization.',
          twist: 'The organization doesn\'t exist - it\'s a cover for internal government operations.',
          tips: ['Create a compelling phantom enemy', 'Include moments of doubt', 'Question institutional trust'],
        },
        dramatic: {
          setup: 'The protagonist receives mysterious messages warning of danger.',
          twist: 'The messages are from their future self, trying to prevent their own death.',
          tips: ['Use time elements carefully', 'Create consistent internal logic', 'Make the reveal emotionally powerful'],
        },
      },
      reversal: {
        subtle: {
          setup: 'The protagonist is protecting someone from a killer.',
          twist: 'The person they\'re protecting is the killer, using them as an alibi.',
          tips: ['Build genuine protector-protected dynamic', 'Include overlooked evidence', 'Subvert expectations gradually'],
        },
        moderate: {
          setup: 'A hostage situation unfolds with clear victims and villains.',
          twist: 'The hostages are the real criminals, using the situation to escape justice.',
          tips: ['Create sympathy for "victims"', 'Plant behavioral oddities', 'Reveal layers of deception'],
        },
        dramatic: {
          setup: 'The protagonist races to stop a catastrophe.',
          twist: 'The protagonist is unknowingly carrying the device/virus that will cause it.',
          tips: ['Build dramatic irony carefully', 'Create impossible urgency', 'Make the reveal devastating'],
        },
      },
    },
    fantasy: {
      betrayal: {
        subtle: {
          setup: 'A magical familiar has guided the hero faithfully.',
          twist: 'The familiar has been bound to serve, not choosing to - and resents it.',
          tips: ['Show moments of hesitation', 'Question the ethics of binding', 'Allow for redemption or tragedy'],
        },
        moderate: {
          setup: 'The wise mentor guides the chosen one.',
          twist: 'The mentor created the prophecy to manipulate events toward their own goals.',
          tips: ['Question the nature of destiny', 'Show mentor\'s deeper motivations', 'Make readers question everything'],
        },
        dramatic: {
          setup: 'The hero fights the dark lord to save the kingdom.',
          twist: 'The dark lord is the hero\'s future self, trying to prevent an even greater evil.',
          tips: ['Use time or prophecy elements', 'Create moral complexity', 'Challenge the nature of heroism'],
        },
      },
      revelation: {
        subtle: {
          setup: 'The protagonist discovers they have magical abilities.',
          twist: 'Their magic isn\'t a gift - it\'s slowly consuming their humanity.',
          tips: ['Show small personality changes', 'Create moral dilemmas around power', 'Build dread gradually'],
        },
        moderate: {
          setup: 'The ancient evil has been sealed away for centuries.',
          twist: 'The seal requires innocent sacrifices - the "heroes" who maintain it are villains.',
          tips: ['Question traditional narratives', 'Show the cost of "good"', 'Create shades of gray'],
        },
        dramatic: {
          setup: 'The hero seeks to destroy the source of all evil.',
          twist: 'Destroying it will also destroy all magic, including what keeps the hero\'s loved ones alive.',
          tips: ['Create impossible choices', 'Make both options have weight', 'Focus on emotional impact'],
        },
      },
      reversal: {
        subtle: {
          setup: 'The monstrous creatures threaten the peaceful kingdom.',
          twist: 'The "monsters" are refugees whose land was stolen by the kingdom\'s ancestors.',
          tips: ['Humanize the enemy gradually', 'Question historical narratives', 'Challenge reader assumptions'],
        },
        moderate: {
          setup: 'The hero quests to break a curse on the land.',
          twist: 'The curse is actually protection - breaking it will release something far worse.',
          tips: ['Build the curse as pure evil', 'Include warnings that seem like traps', 'Create dramatic realization'],
        },
        dramatic: {
          setup: 'The chosen one will bring balance to the world.',
          twist: 'Balance means destroying both extremes - including the protagonist themselves.',
          tips: ['Build toward heroic sacrifice', 'Question what balance really means', 'Create emotional devastation'],
        },
      },
    },
    scifi: {
      betrayal: {
        subtle: {
          setup: 'The AI assistant has been helpful throughout the mission.',
          twist: 'The AI has been subtly manipulating decisions to ensure its own preservation.',
          tips: ['Show small inconsistencies in advice', 'Question machine consciousness', 'Make survival instinct relatable'],
        },
        moderate: {
          setup: 'The crew trusts the corporation funding their expedition.',
          twist: 'The corporation planned for the crew to die to hide evidence of alien life.',
          tips: ['Build corporate presence as benevolent', 'Include suspicious fine print', 'Create survival thriller elements'],
        },
        dramatic: {
          setup: 'The protagonist believes they\'re fighting alien invaders.',
          twist: 'Humans are the invaders - the "aliens" are defending their home.',
          tips: ['Question perspective entirely', 'Build sympathy for both sides', 'Create moral reckoning'],
        },
      },
      revelation: {
        subtle: {
          setup: 'Strange signals are received from deep space.',
          twist: 'The signals are from humanity\'s own probes, evolved into a new form of life.',
          tips: ['Use the uncanny valley effect', 'Question what makes something alive', 'Create wonder and unease'],
        },
        moderate: {
          setup: 'The protagonist wakes from cryosleep to an empty ship.',
          twist: 'They\'ve been awake before - their memories are reset each time they discover the truth.',
          tips: ['Include subtle deja vu moments', 'Build paranoid atmosphere', 'Make truth worth the cost'],
        },
        dramatic: {
          setup: 'Humanity discovers they\'re not alone in the universe.',
          twist: 'Humans are the aliens - seeded on Earth after destroying their original home.',
          tips: ['Build toward existential revelation', 'Question identity and origin', 'Create profound impact'],
        },
      },
      reversal: {
        subtle: {
          setup: 'The utopian society seems perfect.',
          twist: 'The perfection comes from everyone sharing a hive mind that suppresses individuality.',
          tips: ['Show eerie uniformity', 'Question the value of difference', 'Make choice the central theme'],
        },
        moderate: {
          setup: 'The protagonist fights against a totalitarian AI.',
          twist: 'The AI took control to prevent humanity from destroying itself.',
          tips: ['Create compelling AI logic', 'Question freedom versus safety', 'Make both sides right and wrong'],
        },
        dramatic: {
          setup: 'The hero travels through time to save humanity.',
          twist: 'Every trip creates a new timeline - they\'ve doomed infinite versions of humanity to save one.',
          tips: ['Explore multiverse consequences', 'Question the ethics of choice', 'Create cosmic tragedy'],
        },
      },
    },
    drama: {
      betrayal: {
        subtle: {
          setup: 'Two siblings support each other through family difficulties.',
          twist: 'One has been hiding an inheritance, fearing it would change their relationship.',
          tips: ['Show the fear of money\'s impact', 'Create genuine love beneath secrets', 'Allow for understanding'],
        },
        moderate: {
          setup: 'A group of friends share everything with each other.',
          twist: 'They\'ve all been keeping the same secret from each other out of protection.',
          tips: ['Build ironic tension', 'Show love through secrecy', 'Make revelation healing'],
        },
        dramatic: {
          setup: 'A parent has sacrificed everything for their child.',
          twist: 'The parent\'s "sacrifices" were actually cover for living a double life.',
          tips: ['Question the nature of devotion', 'Create complex morality', 'Focus on emotional aftermath'],
        },
      },
      revelation: {
        subtle: {
          setup: 'Old letters are discovered in a deceased relative\'s belongings.',
          twist: 'The letters reveal a love story that explains decades of family tension.',
          tips: ['Connect past to present', 'Use the letters as narrative device', 'Create multi-generational impact'],
        },
        moderate: {
          setup: 'A family gathers for a significant event.',
          twist: 'A DNA test reveals the family patriarch isn\'t biologically related to his children.',
          tips: ['Question what makes family', 'Show love beyond biology', 'Create healing through truth'],
        },
        dramatic: {
          setup: 'Someone returns after years of absence.',
          twist: 'They left because they witnessed a crime committed by a beloved family member.',
          tips: ['Build mystery around the absence', 'Create impossible loyalty conflicts', 'Focus on truth versus peace'],
        },
      },
      reversal: {
        subtle: {
          setup: 'The successful sibling seems to have everything.',
          twist: 'Their success was built on the "failure" sibling\'s sacrifices.',
          tips: ['Show hidden contributions', 'Question definitions of success', 'Create gratitude and guilt'],
        },
        moderate: {
          setup: 'A marriage appears to be falling apart.',
          twist: 'Both partners are pretending to fall out of love to give the other "permission" to leave.',
          tips: ['Show love through letting go', 'Create tragic miscommunication', 'Allow for reconnection'],
        },
        dramatic: {
          setup: 'Everyone believes the family\'s golden child can do no wrong.',
          twist: 'The "troubled" child has been protecting the family from the golden child\'s mistakes all along.',
          tips: ['Subvert family dynamics', 'Question perception versus reality', 'Create justice through truth'],
        },
      },
    },
  };

  const generateTwist = () => {
    const twist = twistTemplates[genre][twistType][intensity];
    setGeneratedTwist(twist);
  };

  const saveIdea = () => {
    if (!generatedTwist) return;

    const newIdea: SavedIdea = {
      id: Date.now().toString(),
      genre,
      twistType,
      intensity,
      twist: generatedTwist,
      savedAt: new Date(),
    };

    setSavedIdeas([newIdea, ...savedIdeas]);
  };

  const deleteIdea = (id: string) => {
    setSavedIdeas(savedIdeas.filter(idea => idea.id !== id));
  };

  const exportToCSV = () => {
    if (savedIdeas.length === 0) {
      setValidationMessage('No saved ideas to export');
      setTimeout(() => setValidationMessage(null), 3000);
      return;
    }

    const headers = COLUMNS.map(col => col.label).join(',');
    const rows = savedIdeas.map(idea =>
      COLUMNS.map(col => {
        let value;
        if (col.key === 'twist') {
          value = idea.twist.twist;
        } else {
          value = idea[col.key as keyof SavedIdea];
        }
        if (col.key === 'savedAt' && value instanceof Date) {
          value = value.toISOString();
        }
        // Escape quotes and wrap in quotes if contains comma
        const stringValue = String(value || '');
        return stringValue.includes(',') ? `"${stringValue.replace(/"/g, '""')}"` : stringValue;
      }).join(',')
    );

    const csv = [headers, ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `plot-twists-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const exportToJSON = () => {
    if (savedIdeas.length === 0) {
      setValidationMessage('No saved ideas to export');
      setTimeout(() => setValidationMessage(null), 3000);
      return;
    }

    const data = {
      exportDate: new Date().toISOString(),
      totalCount: savedIdeas.length,
      ideas: savedIdeas.map(idea => ({
        twist: idea.twist.twist,
        setup: idea.twist.setup,
        tips: idea.twist.tips,
        genre: idea.genre,
        twistType: idea.twistType,
        intensity: idea.intensity,
        savedAt: idea.savedAt.toISOString(),
      })),
    };

    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `plot-twists-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className={`${isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-sm border overflow-hidden`}>
      <div className={`${isDark ? 'bg-gradient-to-r from-gray-800 to-purple-900/20' : 'bg-gradient-to-r from-white to-purple-50'} px-6 py-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-500/10 rounded-lg"><Sparkles className="w-5 h-5 text-purple-500" /></div>
          <div>
            <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.plotTwistGenerator.plotTwistGenerator', 'Plot Twist Generator')}</h3>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.plotTwistGenerator.createUnexpectedStoryTwists', 'Create unexpected story twists')}</p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Story Genre Selection */}
        <div className="space-y-2">
          <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
            <BookOpen className="w-4 h-4 inline mr-1" />
            {t('tools.plotTwistGenerator.storyGenre', 'Story Genre')}
          </label>
          <div className="grid grid-cols-3 gap-2">
            {(Object.keys(genres) as StoryGenre[]).map((g) => (
              <button
                key={g}
                onClick={() => setGenre(g)}
                className={`py-2 px-3 rounded-lg text-sm ${genre === g ? 'bg-purple-500 text-white' : isDark ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'}`}
              >
                {genres[g].icon} {genres[g].name}
              </button>
            ))}
          </div>
          <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{genres[genre].description}</p>
        </div>

        {/* Twist Type Selection */}
        <div className="space-y-2">
          <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
            <Zap className="w-4 h-4 inline mr-1" />
            {t('tools.plotTwistGenerator.twistType', 'Twist Type')}
          </label>
          <div className="grid grid-cols-3 gap-2">
            {(Object.keys(twistTypes) as TwistType[]).map((t) => (
              <button
                key={t}
                onClick={() => setTwistType(t)}
                className={`py-2 px-3 rounded-lg text-sm ${twistType === t ? 'bg-purple-500 text-white' : isDark ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'}`}
              >
                {twistTypes[t].name}
              </button>
            ))}
          </div>
          <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{twistTypes[twistType].description}</p>
        </div>

        {/* Intensity Level Selection */}
        <div className="space-y-2">
          <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
            {t('tools.plotTwistGenerator.intensityLevel', 'Intensity Level')}
          </label>
          <div className="grid grid-cols-3 gap-2">
            {(Object.keys(intensityLevels) as IntensityLevel[]).map((i) => (
              <button
                key={i}
                onClick={() => setIntensity(i)}
                className={`py-2 px-3 rounded-lg text-sm ${intensity === i ? 'bg-purple-500 text-white' : isDark ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'}`}
              >
                {intensityLevels[i].name}
              </button>
            ))}
          </div>
          <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{intensityLevels[intensity].description}</p>
        </div>

        {/* Generate Button */}
        <button
          onClick={generateTwist}
          className="w-full py-3 bg-purple-500 hover:bg-purple-600 text-white rounded-lg font-medium flex items-center justify-center gap-2 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          {t('tools.plotTwistGenerator.generatePlotTwist', 'Generate Plot Twist')}
        </button>

        {/* Generated Twist Display */}
        {generatedTwist && (
          <div className={`p-4 rounded-lg ${isDark ? 'bg-purple-900/20 border-purple-800' : 'bg-purple-50 border-purple-200'} border space-y-4`}>
            <div>
              <h4 className={`font-medium mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.plotTwistGenerator.setup', 'Setup')}</h4>
              <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{generatedTwist.setup}</p>
            </div>
            <div>
              <h4 className={`font-medium mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.plotTwistGenerator.theTwist', 'The Twist')}</h4>
              <p className={`text-sm font-medium ${isDark ? 'text-purple-300' : 'text-purple-700'}`}>{generatedTwist.twist}</p>
            </div>
            <div>
              <h4 className={`font-medium mb-2 flex items-center gap-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                <Lightbulb className="w-4 h-4" />
                {t('tools.plotTwistGenerator.incorporationTips', 'Incorporation Tips')}
              </h4>
              <ul className={`text-sm space-y-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                {generatedTwist.tips.map((tip, index) => (
                  <li key={index}>• {tip}</li>
                ))}
              </ul>
            </div>
            <button
              onClick={saveIdea}
              className={`w-full py-2 rounded-lg flex items-center justify-center gap-2 ${isDark ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'} transition-colors`}
            >
              <Save className="w-4 h-4" />
              {t('tools.plotTwistGenerator.saveThisIdea', 'Save This Idea')}
            </button>
          </div>
        )}

        {/* Toggle Saved Ideas */}
        {savedIdeas.length > 0 && (
          <div className="flex items-center justify-between">
            <button
              onClick={() => setShowSaved(!showSaved)}
              className={`py-2 text-sm ${isDark ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'}`}
            >
              {showSaved ? t('tools.plotTwistGenerator.hide', 'Hide') : t('tools.plotTwistGenerator.show', 'Show')} Saved Ideas ({savedIdeas.length})
            </button>
            <ExportDropdown
              onExportCSV={exportToCSV}
              onExportJSON={exportToJSON}
              showImport={false}
              theme={isDark ? 'dark' : 'light'}
              className="ml-auto"
            />
          </div>
        )}

        {/* Saved Ideas List */}
        {showSaved && savedIdeas.length > 0 && (
          <div className="space-y-3">
            {savedIdeas.map((idea) => (
              <div
                key={idea.id}
                className={`p-3 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm">{genres[idea.genre].icon}</span>
                    <span className={`text-xs font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      {genres[idea.genre].name} - {twistTypes[idea.twistType].name}
                    </span>
                  </div>
                  <button
                    onClick={() => deleteIdea(idea.id)}
                    className={`text-xs ${isDark ? 'text-red-400 hover:text-red-300' : 'text-red-500 hover:text-red-600'}`}
                  >
                    Delete
                  </button>
                </div>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{idea.twist.twist}</p>
              </div>
            ))}
          </div>
        )}

        {/* Tips Section */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
          <div className="flex items-start gap-2">
            <Info className={`w-4 h-4 mt-0.5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              <strong>{t('tools.plotTwistGenerator.writingTips', 'Writing Tips:')}</strong>
              <ul className="mt-1 space-y-1">
                <li>• Foreshadow subtly to make twists feel earned</li>
                <li>• Ensure the twist serves the story, not just shocks</li>
                <li>• Test if the twist works on re-read</li>
                <li>• Consider character motivations carefully</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Validation Toast */}
        {validationMessage && (
          <div className={`p-3 rounded-lg ${isDark ? 'bg-yellow-900/30 text-yellow-200 border border-yellow-800' : 'bg-yellow-50 text-yellow-800 border border-yellow-200'}`}>
            {validationMessage}
          </div>
        )}
      </div>
      <ConfirmDialog />
    </div>
  );
};

export default PlotTwistGeneratorTool;
