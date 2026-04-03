import React, { useState, useMemo, useEffect } from 'react';
import { Camera, PartyPopper, GraduationCap, Heart, Scissors, Printer, Users, Lightbulb, Info, Package } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';

type EventType = 'wedding' | 'birthday' | 'graduation' | 'babyshower' | 'corporate' | 'holiday';

interface PropCategory {
  name: string;
  icon: React.ReactNode;
  props: string[];
  templates: string[];
  diyIdeas: string[];
}

interface EventConfig {
  name: string;
  icon: React.ReactNode;
  color: string;
  categories: PropCategory[];
  propsPerGuest: number;
  description: string;
}

interface PhotoBoothPropsToolProps {
  uiConfig?: UIConfig;
}

export const PhotoBoothPropsTool: React.FC<PhotoBoothPropsToolProps> = ({
  uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [isPrefilled, setIsPrefilled] = useState(false);

  const [eventType, setEventType] = useState<EventType>('wedding');
  const [guestCount, setGuestCount] = useState('50');
  const [selectedCategory, setSelectedCategory] = useState<number>(0);
  const [activeTab, setActiveTab] = useState<'props' | 'templates' | 'diy'>('props');

  // Handle prefill from uiConfig
  useEffect(() => {
    if (uiConfig?.prefillData && !isPrefilled) {
      const data = uiConfig.prefillData;
      if (data.eventType && ['wedding', 'birthday', 'graduation', 'babyshower', 'corporate', 'holiday'].includes(data.eventType as string)) {
        setEventType(data.eventType as EventType);
      }
      if (data.guestCount) {
        setGuestCount(String(data.guestCount));
      }
      setIsPrefilled(true);
    }
  }, [uiConfig, isPrefilled]);

  const events: Record<EventType, EventConfig> = {
    wedding: {
      name: 'Wedding',
      icon: <Heart className="w-4 h-4" />,
      color: 'rose',
      propsPerGuest: 1.5,
      description: 'Elegant and romantic props for your special day',
      categories: [
        {
          name: 'Romantic',
          icon: <Heart className="w-4 h-4" />,
          props: ['Mr & Mrs Signs', 'Heart Glasses', 'Kiss Lips', 'Ring Props', 'Love Speech Bubbles', 'Champagne Glasses'],
          templates: ['Just Married Banner', 'Wedding Date Sign', 'Hashtag Frame', 'Kiss the Bride Sign'],
          diyIdeas: ['Glitter heart wands', 'Lace masks', 'Paper flower crowns', 'Ribbon streamers'],
        },
        {
          name: 'Fun Signs',
          icon: <PartyPopper className="w-4 h-4" />,
          props: ['Team Bride', 'Team Groom', 'Cheers Signs', 'Dance Floor King/Queen', 'Open Bar Arrow'],
          templates: ['Speech Bubble Templates', 'Arrow Signs', 'Emoji Props'],
          diyIdeas: ['Chalkboard signs', 'Gold foil letters', 'Confetti poppers'],
        },
        {
          name: 'Accessories',
          icon: <Camera className="w-4 h-4" />,
          props: ['Bow Ties', 'Tiaras', 'Veils', 'Mustaches', 'Top Hats', 'Pearl Necklaces'],
          templates: ['Printable Bow Ties', 'Paper Crowns', 'Mask Templates'],
          diyIdeas: ['Felt bow ties', 'Tulle veils', 'Sequin headbands'],
        },
      ],
    },
    birthday: {
      name: 'Birthday',
      icon: <PartyPopper className="w-4 h-4" />,
      color: 'purple',
      propsPerGuest: 2,
      description: 'Colorful and fun props for birthday celebrations',
      categories: [
        {
          name: 'Party Essentials',
          icon: <PartyPopper className="w-4 h-4" />,
          props: ['Birthday Hats', 'Number Signs', 'Cake Props', 'Balloon Props', 'Confetti Sticks', 'Party Horns'],
          templates: ['Age Number Signs', 'Happy Birthday Banner', 'Cake Topper Props'],
          diyIdeas: ['Paper party hats', 'Tissue paper pom poms', 'Cardboard cake slices'],
        },
        {
          name: 'Fun Faces',
          icon: <Camera className="w-4 h-4" />,
          props: ['Oversized Glasses', 'Funny Lips', 'Animal Ears', 'Superhero Masks', 'Crown Props'],
          templates: ['Emoji Face Templates', 'Character Masks', 'Sunglasses Templates'],
          diyIdeas: ['Felt animal ears', 'Glitter crowns', 'Paper superhero capes'],
        },
        {
          name: 'Speech Bubbles',
          icon: <Lightbulb className="w-4 h-4" />,
          props: ['Make a Wish', 'Party Animal', 'Birthday Queen/King', 'Lets Party', 'Best Day Ever'],
          templates: ['Blank Speech Bubbles', 'Quote Templates', 'Hashtag Signs'],
          diyIdeas: ['Chalkboard bubbles', 'Whiteboard props', 'Customizable signs'],
        },
      ],
    },
    graduation: {
      name: 'Graduation',
      icon: <GraduationCap className="w-4 h-4" />,
      color: 'blue',
      propsPerGuest: 1.5,
      description: 'Academic-themed props to celebrate achievements',
      categories: [
        {
          name: 'Academic',
          icon: <GraduationCap className="w-4 h-4" />,
          props: ['Graduation Caps', 'Diploma Scrolls', 'Class Year Signs', 'Honor Cords', 'Tassel Props'],
          templates: ['Diploma Templates', 'Class of 20XX Signs', 'School Logo Props'],
          diyIdeas: ['Paper graduation caps', 'Rolled diploma props', 'Felt honor stoles'],
        },
        {
          name: 'Celebration',
          icon: <PartyPopper className="w-4 h-4" />,
          props: ['Future Career Signs', 'Dream Job Props', 'Success Quotes', 'Champagne Props'],
          templates: ['Degree Signs', 'Future Plans Bubbles', 'Achievement Badges'],
          diyIdeas: ['Glitter mortarboards', 'Confetti launchers', 'Gold medal props'],
        },
        {
          name: 'Fun Messages',
          icon: <Lightbulb className="w-4 h-4" />,
          props: ['Done with School', 'Free at Last', 'Thanks Mom & Dad', 'Hired Signs', 'Student Loans Ahead'],
          templates: ['Funny Quote Templates', 'Major Signs', 'GPA Props'],
          diyIdeas: ['Debt counter props', 'Future billionaire signs', 'Alarm clock smash props'],
        },
      ],
    },
    babyshower: {
      name: 'Baby Shower',
      icon: <Heart className="w-4 h-4" />,
      color: 'pink',
      propsPerGuest: 1.5,
      description: 'Adorable props to welcome the little one',
      categories: [
        {
          name: 'Baby Themed',
          icon: <Heart className="w-4 h-4" />,
          props: ['Baby Bottles', 'Pacifier Props', 'Onesie Cutouts', 'Stork Props', 'Rattle Props'],
          templates: ['Baby Name Signs', 'Due Date Props', 'Gender Reveal Cards'],
          diyIdeas: ['Felt baby booties', 'Paper diaper props', 'Yarn pom pom wands'],
        },
        {
          name: 'Parents-to-Be',
          icon: <Users className="w-4 h-4" />,
          props: ['Mom to Be Sash', 'Dad to Be Signs', 'Grandparent Props', 'Aunt/Uncle Signs'],
          templates: ['Family Role Signs', 'Advice Cards', 'Prediction Cards'],
          diyIdeas: ['Ribbon sashes', 'Button badges', 'Photo frame props'],
        },
        {
          name: 'Fun Predictions',
          icon: <Lightbulb className="w-4 h-4" />,
          props: ['Boy or Girl Signs', 'Name Suggestions', 'Future Career Props', 'Birth Weight Guesses'],
          templates: ['Prediction Templates', 'Voting Cards', 'Wish Cards'],
          diyIdeas: ['Chalkboard predictions', 'Scratch-off cards', 'Time capsule cards'],
        },
      ],
    },
    corporate: {
      name: 'Corporate Event',
      icon: <Users className="w-4 h-4" />,
      color: 'emerald',
      propsPerGuest: 1,
      description: 'Professional yet fun props for company events',
      categories: [
        {
          name: 'Company Branding',
          icon: <Package className="w-4 h-4" />,
          props: ['Logo Props', 'Mission Statement Signs', 'Team Name Props', 'Department Signs'],
          templates: ['Logo Frame Templates', 'Slogan Signs', 'Hashtag Props'],
          diyIdeas: ['Branded foam fingers', 'Logo cutouts', 'Color-themed accessories'],
        },
        {
          name: 'Team Building',
          icon: <Users className="w-4 h-4" />,
          props: ['Employee of Month', 'Team Player Signs', 'MVP Props', 'Years of Service'],
          templates: ['Award Templates', 'Recognition Signs', 'Achievement Props'],
          diyIdeas: ['Paper medals', 'Trophy cutouts', 'Star wands'],
        },
        {
          name: 'Fun Professional',
          icon: <Lightbulb className="w-4 h-4" />,
          props: ['Coffee Addict', 'Meeting Survivor', 'Excel Wizard', 'Zoom Expert', 'Casual Friday'],
          templates: ['Office Humor Signs', 'Job Title Props', 'Email Quotes'],
          diyIdeas: ['Laptop cutouts', 'Coffee cup props', 'Keyboard keys'],
        },
      ],
    },
    holiday: {
      name: 'Holiday Party',
      icon: <PartyPopper className="w-4 h-4" />,
      color: 'red',
      propsPerGuest: 2,
      description: 'Festive props for seasonal celebrations',
      categories: [
        {
          name: 'Winter Holidays',
          icon: <PartyPopper className="w-4 h-4" />,
          props: ['Santa Hats', 'Reindeer Antlers', 'Elf Ears', 'Snowflake Props', 'Candy Canes', 'Gift Box Props'],
          templates: ['Merry Christmas Signs', 'Happy Holidays Banners', 'New Year Props'],
          diyIdeas: ['Paper snowflakes', 'Felt antlers', 'Glitter ornaments'],
        },
        {
          name: 'Halloween',
          icon: <Camera className="w-4 h-4" />,
          props: ['Witch Hats', 'Vampire Fangs', 'Pumpkin Props', 'Ghost Cutouts', 'Spider Webs'],
          templates: ['Spooky Signs', 'Costume Labels', 'Monster Props'],
          diyIdeas: ['Paper bats', 'Cardboard tombstones', 'Glow stick wands'],
        },
        {
          name: 'Other Holidays',
          icon: <Heart className="w-4 h-4" />,
          props: ['Bunny Ears', 'Shamrock Props', 'Heart Glasses', 'Flag Props', 'Firework Wands'],
          templates: ['Holiday Greeting Signs', 'Seasonal Banners', 'Celebration Props'],
          diyIdeas: ['Paper eggs', 'Felt shamrocks', 'Patriotic ribbons'],
        },
      ],
    },
  };

  const config = events[eventType];
  const category = config.categories[selectedCategory];

  const calculations = useMemo(() => {
    const guests = parseInt(guestCount) || 0;
    const totalProps = Math.ceil(guests * config.propsPerGuest);
    const propsPerCategory = Math.ceil(totalProps / config.categories.length);
    const signProps = Math.ceil(totalProps * 0.3);
    const accessoryProps = Math.ceil(totalProps * 0.4);
    const funProps = Math.ceil(totalProps * 0.3);
    const extraBuffer = Math.ceil(totalProps * 0.15);

    return {
      totalProps,
      propsPerCategory,
      signProps,
      accessoryProps,
      funProps,
      extraBuffer,
      recommended: totalProps + extraBuffer,
    };
  }, [guestCount, config]);

  const getColorClasses = (color: string) => {
    const colors: Record<string, { bg: string; text: string; border: string; light: string }> = {
      rose: { bg: 'bg-rose-500', text: 'text-rose-500', border: 'border-rose-500', light: 'bg-rose-500/10' },
      purple: { bg: 'bg-purple-500', text: 'text-purple-500', border: 'border-purple-500', light: 'bg-purple-500/10' },
      blue: { bg: 'bg-blue-500', text: 'text-blue-500', border: 'border-blue-500', light: 'bg-blue-500/10' },
      pink: { bg: 'bg-pink-500', text: 'text-pink-500', border: 'border-pink-500', light: 'bg-pink-500/10' },
      emerald: { bg: 'bg-emerald-500', text: 'text-emerald-500', border: 'border-emerald-500', light: 'bg-emerald-500/10' },
      red: { bg: 'bg-red-500', text: 'text-red-500', border: 'border-red-500', light: 'bg-red-500/10' },
    };
    return colors[color] || colors.purple;
  };

  const colorClasses = getColorClasses(config.color);

  return (
    <div className={`${isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-sm border overflow-hidden`}>
      <div className={`${isDark ? 'bg-gradient-to-r from-gray-800 to-purple-900/20' : 'bg-gradient-to-r from-white to-purple-50'} px-6 py-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
        <div className="flex items-center gap-3">
          <div className={`p-2 ${colorClasses.light} rounded-lg`}>
            <Camera className={`w-5 h-5 ${colorClasses.text}`} />
          </div>
          <div>
            <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.photoBoothProps.photoBoothPropsPlanner', 'Photo Booth Props Planner')}</h3>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.photoBoothProps.planPerfectPropsForYour', 'Plan perfect props for your event')}</p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Event Type Selection */}
        <div className="grid grid-cols-3 gap-2">
          {(Object.keys(events) as EventType[]).map((e) => (
            <button
              key={e}
              onClick={() => {
                setEventType(e);
                setSelectedCategory(0);
              }}
              className={`py-2 px-3 rounded-lg text-sm flex items-center justify-center gap-1 ${
                eventType === e
                  ? `${getColorClasses(events[e].color).bg} text-white`
                  : isDark
                  ? 'bg-gray-800 text-gray-300'
                  : 'bg-gray-100 text-gray-700'
              }`}
            >
              {events[e].icon}
              <span className="hidden sm:inline">{events[e].name}</span>
            </button>
          ))}
        </div>

        {/* Event Info */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800/50' : 'bg-gray-50'} border ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
          <div className="flex items-center justify-between mb-2">
            <h4 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{config.name}</h4>
            <span className={`${colorClasses.text} font-bold text-sm`}>
              {config.propsPerGuest} props/guest
            </span>
          </div>
          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{config.description}</p>
        </div>

        {/* Guest Count */}
        <div className="space-y-2">
          <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
            <Users className="w-4 h-4 inline mr-1" />
            {t('tools.photoBoothProps.numberOfGuests', 'Number of Guests')}
          </label>
          <div className="flex gap-2">
            {[25, 50, 100, 150, 200].map((n) => (
              <button
                key={n}
                onClick={() => setGuestCount(n.toString())}
                className={`flex-1 py-2 rounded-lg text-sm ${
                  parseInt(guestCount) === n
                    ? `${colorClasses.bg} text-white`
                    : isDark
                    ? 'bg-gray-800 text-gray-300'
                    : 'bg-gray-100 text-gray-700'
                }`}
              >
                {n}
              </button>
            ))}
          </div>
          <input
            type="number"
            value={guestCount}
            onChange={(e) => setGuestCount(e.target.value)}
            placeholder={t('tools.photoBoothProps.customGuestCount', 'Custom guest count')}
            className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
          />
        </div>

        {/* Quantity Calculator Results */}
        <div className="grid grid-cols-2 gap-4">
          <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
            <div className="flex items-center gap-2 mb-2">
              <Package className={`w-4 h-4 ${colorClasses.text}`} />
              <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.photoBoothProps.totalProps', 'Total Props')}</span>
            </div>
            <div className={`text-3xl font-bold ${colorClasses.text}`}>{calculations.recommended}</div>
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              {calculations.totalProps} base + {calculations.extraBuffer} buffer
            </div>
          </div>
          <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
            <div className="flex items-center gap-2 mb-2">
              <Scissors className={`w-4 h-4 ${colorClasses.text}`} />
              <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.photoBoothProps.perCategory', 'Per Category')}</span>
            </div>
            <div className={`text-3xl font-bold ${colorClasses.text}`}>{calculations.propsPerCategory}</div>
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              across {config.categories.length} categories
            </div>
          </div>
        </div>

        {/* Prop Breakdown */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
          <h4 className={`font-medium mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.photoBoothProps.recommendedDistribution', 'Recommended Distribution')}</h4>
          <div className="grid grid-cols-3 gap-3 text-center">
            <div>
              <div className={`text-xl font-bold ${colorClasses.text}`}>{calculations.signProps}</div>
              <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.photoBoothProps.signProps', 'Sign Props')}</div>
            </div>
            <div>
              <div className={`text-xl font-bold ${colorClasses.text}`}>{calculations.accessoryProps}</div>
              <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.photoBoothProps.accessories', 'Accessories')}</div>
            </div>
            <div>
              <div className={`text-xl font-bold ${colorClasses.text}`}>{calculations.funProps}</div>
              <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.photoBoothProps.funProps', 'Fun Props')}</div>
            </div>
          </div>
        </div>

        {/* Prop Categories */}
        <div className="space-y-2">
          <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
            {t('tools.photoBoothProps.propCategories', 'Prop Categories')}
          </label>
          <div className="flex gap-2">
            {config.categories.map((cat, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedCategory(idx)}
                className={`flex-1 py-2 px-3 rounded-lg text-sm flex items-center justify-center gap-1 ${
                  selectedCategory === idx
                    ? `${colorClasses.bg} text-white`
                    : isDark
                    ? 'bg-gray-800 text-gray-300'
                    : 'bg-gray-100 text-gray-700'
                }`}
              >
                {cat.icon}
                <span className="hidden sm:inline">{cat.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Content Tabs */}
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('props')}
            className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-1 ${
              activeTab === 'props'
                ? `${colorClasses.bg} text-white`
                : isDark
                ? 'bg-gray-800 text-gray-300'
                : 'bg-gray-100 text-gray-700'
            }`}
          >
            <Camera className="w-4 h-4" />
            {t('tools.photoBoothProps.props', 'Props')}
          </button>
          <button
            onClick={() => setActiveTab('templates')}
            className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-1 ${
              activeTab === 'templates'
                ? `${colorClasses.bg} text-white`
                : isDark
                ? 'bg-gray-800 text-gray-300'
                : 'bg-gray-100 text-gray-700'
            }`}
          >
            <Printer className="w-4 h-4" />
            {t('tools.photoBoothProps.templates', 'Templates')}
          </button>
          <button
            onClick={() => setActiveTab('diy')}
            className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-1 ${
              activeTab === 'diy'
                ? `${colorClasses.bg} text-white`
                : isDark
                ? 'bg-gray-800 text-gray-300'
                : 'bg-gray-100 text-gray-700'
            }`}
          >
            <Scissors className="w-4 h-4" />
            {t('tools.photoBoothProps.diyIdeas', 'DIY Ideas')}
          </button>
        </div>

        {/* Tab Content */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
          {activeTab === 'props' && (
            <div>
              <h4 className={`font-medium mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {category.name} Props
              </h4>
              <div className="flex flex-wrap gap-2">
                {category.props.map((prop, idx) => (
                  <span
                    key={idx}
                    className={`px-3 py-1.5 rounded-full text-sm ${colorClasses.light} ${colorClasses.text}`}
                  >
                    {prop}
                  </span>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'templates' && (
            <div>
              <h4 className={`font-medium mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                <Printer className="w-4 h-4 inline mr-1" />
                {t('tools.photoBoothProps.printableTemplates', 'Printable Templates')}
              </h4>
              <ul className="space-y-2">
                {category.templates.map((template, idx) => (
                  <li
                    key={idx}
                    className={`flex items-center gap-2 text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}
                  >
                    <span className={`w-2 h-2 rounded-full ${colorClasses.bg}`}></span>
                    {template}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {activeTab === 'diy' && (
            <div>
              <h4 className={`font-medium mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                <Lightbulb className="w-4 h-4 inline mr-1" />
                {t('tools.photoBoothProps.diyIdeas2', 'DIY Ideas')}
              </h4>
              <ul className="space-y-2">
                {category.diyIdeas.map((idea, idx) => (
                  <li
                    key={idx}
                    className={`flex items-center gap-2 text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}
                  >
                    <Scissors className={`w-3 h-3 ${colorClasses.text}`} />
                    {idea}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Tips */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
          <div className="flex items-start gap-2">
            <Info className={`w-4 h-4 mt-0.5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              <strong>{t('tools.photoBoothProps.proTips', 'Pro Tips:')}</strong>
              <ul className="mt-1 space-y-1">
                <li>- Add 15% extra props for damage and variety</li>
                <li>- Include props in different sizes for variety</li>
                <li>- Use sturdy materials for reusable props</li>
                <li>- Print templates on cardstock for durability</li>
                <li>- Set up a prop station near the photo booth</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PhotoBoothPropsTool;
