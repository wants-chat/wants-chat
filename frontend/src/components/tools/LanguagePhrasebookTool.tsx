import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Globe, Volume2, Heart, Star, Copy, Check, BookOpen, MapPin, Utensils, AlertTriangle } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';

type Language = 'spanish' | 'french' | 'german' | 'italian' | 'japanese' | 'mandarin' | 'portuguese' | 'korean';
type Category = 'greetings' | 'directions' | 'food' | 'emergency';

interface Phrase {
  id: string;
  english: string;
  translation: string;
  pronunciation: string;
}

interface LanguageData {
  name: string;
  flag: string;
  phrases: Record<Category, Phrase[]>;
}

const categoryIcons: Record<Category, React.ReactNode> = {
  greetings: <BookOpen className="w-4 h-4" />,
  directions: <MapPin className="w-4 h-4" />,
  food: <Utensils className="w-4 h-4" />,
  emergency: <AlertTriangle className="w-4 h-4" />,
};

const categoryLabels: Record<Category, string> = {
  greetings: 'Greetings',
  directions: 'Directions',
  food: 'Food & Dining',
  emergency: 'Emergency',
};

interface LanguagePhrasebookToolProps {
  uiConfig?: UIConfig;
}

export const LanguagePhrasebookTool: React.FC<LanguagePhrasebookToolProps> = ({
  uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [isPrefilled, setIsPrefilled] = useState(false);

  const [language, setLanguage] = useState<Language>('spanish');
  const [category, setCategory] = useState<Category>('greetings');
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);

  // Handle prefill from uiConfig
  useEffect(() => {
    if (uiConfig?.prefillData && !isPrefilled) {
      const data = uiConfig.prefillData;
      if (data.language && ['spanish', 'french', 'german', 'italian', 'japanese', 'mandarin', 'portuguese', 'korean'].includes(data.language as string)) {
        setLanguage(data.language as Language);
      }
      if (data.category && ['greetings', 'directions', 'food', 'emergency'].includes(data.category as string)) {
        setCategory(data.category as Category);
      }
      setIsPrefilled(true);
    }
  }, [uiConfig, isPrefilled]);

  const languages: Record<Language, LanguageData> = {
    spanish: {
      name: 'Spanish',
      flag: 'ES',
      phrases: {
        greetings: [
          { id: 'es-g1', english: 'Hello', translation: 'Hola', pronunciation: 'OH-lah' },
          { id: 'es-g2', english: 'Good morning', translation: 'Buenos dias', pronunciation: 'BWEH-nohs DEE-ahs' },
          { id: 'es-g3', english: 'Good evening', translation: 'Buenas noches', pronunciation: 'BWEH-nahs NOH-chehs' },
          { id: 'es-g4', english: 'Goodbye', translation: 'Adios', pronunciation: 'ah-dee-OHS' },
          { id: 'es-g5', english: 'Thank you', translation: 'Gracias', pronunciation: 'GRAH-see-ahs' },
          { id: 'es-g6', english: 'Please', translation: 'Por favor', pronunciation: 'pohr fah-VOHR' },
          { id: 'es-g7', english: 'Excuse me', translation: 'Disculpe', pronunciation: 'dees-KOOL-peh' },
          { id: 'es-g8', english: 'How are you?', translation: 'Como estas?', pronunciation: 'KOH-moh ehs-TAHS' },
        ],
        directions: [
          { id: 'es-d1', english: 'Where is...?', translation: 'Donde esta...?', pronunciation: 'DOHN-deh ehs-TAH' },
          { id: 'es-d2', english: 'Left', translation: 'Izquierda', pronunciation: 'eez-kee-EHR-dah' },
          { id: 'es-d3', english: 'Right', translation: 'Derecha', pronunciation: 'deh-REH-chah' },
          { id: 'es-d4', english: 'Straight ahead', translation: 'Recto', pronunciation: 'REHK-toh' },
          { id: 'es-d5', english: 'Near', translation: 'Cerca', pronunciation: 'SEHR-kah' },
          { id: 'es-d6', english: 'Far', translation: 'Lejos', pronunciation: 'LEH-hohs' },
          { id: 'es-d7', english: 'Train station', translation: 'Estacion de tren', pronunciation: 'ehs-tah-see-OHN deh trehn' },
          { id: 'es-d8', english: 'Airport', translation: 'Aeropuerto', pronunciation: 'ah-eh-roh-PWEHR-toh' },
        ],
        food: [
          { id: 'es-f1', english: 'I would like...', translation: 'Quisiera...', pronunciation: 'kee-see-EH-rah' },
          { id: 'es-f2', english: 'The menu, please', translation: 'La carta, por favor', pronunciation: 'lah KAHR-tah pohr fah-VOHR' },
          { id: 'es-f3', english: 'Water', translation: 'Agua', pronunciation: 'AH-gwah' },
          { id: 'es-f4', english: 'The bill, please', translation: 'La cuenta, por favor', pronunciation: 'lah KWEHN-tah pohr fah-VOHR' },
          { id: 'es-f5', english: 'Delicious', translation: 'Delicioso', pronunciation: 'deh-lee-see-OH-soh' },
          { id: 'es-f6', english: 'Vegetarian', translation: 'Vegetariano', pronunciation: 'beh-heh-tah-ree-AH-noh' },
          { id: 'es-f7', english: 'No spicy', translation: 'Sin picante', pronunciation: 'seen pee-KAHN-teh' },
          { id: 'es-f8', english: 'Breakfast', translation: 'Desayuno', pronunciation: 'deh-sah-YOO-noh' },
        ],
        emergency: [
          { id: 'es-e1', english: 'Help!', translation: 'Ayuda!', pronunciation: 'ah-YOO-dah' },
          { id: 'es-e2', english: 'Call the police', translation: 'Llame a la policia', pronunciation: 'YAH-meh ah lah poh-lee-SEE-ah' },
          { id: 'es-e3', english: 'I need a doctor', translation: 'Necesito un medico', pronunciation: 'neh-seh-SEE-toh oon MEH-dee-koh' },
          { id: 'es-e4', english: 'Hospital', translation: 'Hospital', pronunciation: 'ohs-pee-TAHL' },
          { id: 'es-e5', english: 'I am lost', translation: 'Estoy perdido', pronunciation: 'ehs-TOY pehr-DEE-doh' },
          { id: 'es-e6', english: 'Emergency', translation: 'Emergencia', pronunciation: 'eh-mehr-HEHN-see-ah' },
          { id: 'es-e7', english: 'Fire!', translation: 'Fuego!', pronunciation: 'FWEH-goh' },
          { id: 'es-e8', english: 'I need help', translation: 'Necesito ayuda', pronunciation: 'neh-seh-SEE-toh ah-YOO-dah' },
        ],
      },
    },
    french: {
      name: 'French',
      flag: 'FR',
      phrases: {
        greetings: [
          { id: 'fr-g1', english: 'Hello', translation: 'Bonjour', pronunciation: 'bohn-ZHOOR' },
          { id: 'fr-g2', english: 'Good evening', translation: 'Bonsoir', pronunciation: 'bohn-SWAHR' },
          { id: 'fr-g3', english: 'Goodbye', translation: 'Au revoir', pronunciation: 'oh ruh-VWAHR' },
          { id: 'fr-g4', english: 'Thank you', translation: 'Merci', pronunciation: 'mehr-SEE' },
          { id: 'fr-g5', english: 'Please', translation: 'S\'il vous plait', pronunciation: 'seel voo PLEH' },
          { id: 'fr-g6', english: 'Excuse me', translation: 'Excusez-moi', pronunciation: 'ehk-skew-zay-MWAH' },
          { id: 'fr-g7', english: 'How are you?', translation: 'Comment allez-vous?', pronunciation: 'koh-mahn tah-lay VOO' },
          { id: 'fr-g8', english: 'Nice to meet you', translation: 'Enchante', pronunciation: 'ahn-shahn-TAY' },
        ],
        directions: [
          { id: 'fr-d1', english: 'Where is...?', translation: 'Ou est...?', pronunciation: 'oo EH' },
          { id: 'fr-d2', english: 'Left', translation: 'A gauche', pronunciation: 'ah GOHSH' },
          { id: 'fr-d3', english: 'Right', translation: 'A droite', pronunciation: 'ah DRWAHT' },
          { id: 'fr-d4', english: 'Straight ahead', translation: 'Tout droit', pronunciation: 'too DRWAH' },
          { id: 'fr-d5', english: 'Near', translation: 'Pres', pronunciation: 'PREH' },
          { id: 'fr-d6', english: 'Far', translation: 'Loin', pronunciation: 'LWAHN' },
          { id: 'fr-d7', english: 'Train station', translation: 'Gare', pronunciation: 'GAHR' },
          { id: 'fr-d8', english: 'Airport', translation: 'Aeroport', pronunciation: 'ah-eh-roh-POHR' },
        ],
        food: [
          { id: 'fr-f1', english: 'I would like...', translation: 'Je voudrais...', pronunciation: 'zhuh voo-DREH' },
          { id: 'fr-f2', english: 'The menu, please', translation: 'La carte, s\'il vous plait', pronunciation: 'lah KAHRT seel voo PLEH' },
          { id: 'fr-f3', english: 'Water', translation: 'Eau', pronunciation: 'OH' },
          { id: 'fr-f4', english: 'The bill, please', translation: 'L\'addition, s\'il vous plait', pronunciation: 'lah-dee-see-OHN seel voo PLEH' },
          { id: 'fr-f5', english: 'Delicious', translation: 'Delicieux', pronunciation: 'day-lee-see-UH' },
          { id: 'fr-f6', english: 'Vegetarian', translation: 'Vegetarien', pronunciation: 'vay-zhay-tah-RYAHN' },
          { id: 'fr-f7', english: 'No spicy', translation: 'Pas epice', pronunciation: 'pah ay-pee-SAY' },
          { id: 'fr-f8', english: 'Breakfast', translation: 'Petit dejeuner', pronunciation: 'puh-TEE day-zhuh-NAY' },
        ],
        emergency: [
          { id: 'fr-e1', english: 'Help!', translation: 'Au secours!', pronunciation: 'oh suh-KOOR' },
          { id: 'fr-e2', english: 'Call the police', translation: 'Appelez la police', pronunciation: 'ah-play lah poh-LEES' },
          { id: 'fr-e3', english: 'I need a doctor', translation: 'J\'ai besoin d\'un medecin', pronunciation: 'zhay buh-ZWAHN duhn mayd-SAHN' },
          { id: 'fr-e4', english: 'Hospital', translation: 'Hopital', pronunciation: 'oh-pee-TAHL' },
          { id: 'fr-e5', english: 'I am lost', translation: 'Je suis perdu', pronunciation: 'zhuh swee pehr-DEW' },
          { id: 'fr-e6', english: 'Emergency', translation: 'Urgence', pronunciation: 'oor-ZHAHNS' },
          { id: 'fr-e7', english: 'Fire!', translation: 'Au feu!', pronunciation: 'oh FUH' },
          { id: 'fr-e8', english: 'I need help', translation: 'J\'ai besoin d\'aide', pronunciation: 'zhay buh-ZWAHN DEHD' },
        ],
      },
    },
    german: {
      name: 'German',
      flag: 'DE',
      phrases: {
        greetings: [
          { id: 'de-g1', english: 'Hello', translation: 'Hallo', pronunciation: 'HAH-loh' },
          { id: 'de-g2', english: 'Good morning', translation: 'Guten Morgen', pronunciation: 'GOO-ten MOR-gen' },
          { id: 'de-g3', english: 'Good evening', translation: 'Guten Abend', pronunciation: 'GOO-ten AH-bent' },
          { id: 'de-g4', english: 'Goodbye', translation: 'Auf Wiedersehen', pronunciation: 'owf VEE-der-zay-en' },
          { id: 'de-g5', english: 'Thank you', translation: 'Danke', pronunciation: 'DAHN-keh' },
          { id: 'de-g6', english: 'Please', translation: 'Bitte', pronunciation: 'BIT-teh' },
          { id: 'de-g7', english: 'Excuse me', translation: 'Entschuldigung', pronunciation: 'ent-SHOOL-dee-goong' },
          { id: 'de-g8', english: 'How are you?', translation: 'Wie geht es Ihnen?', pronunciation: 'vee GAYT es EE-nen' },
        ],
        directions: [
          { id: 'de-d1', english: 'Where is...?', translation: 'Wo ist...?', pronunciation: 'voh IST' },
          { id: 'de-d2', english: 'Left', translation: 'Links', pronunciation: 'LINKS' },
          { id: 'de-d3', english: 'Right', translation: 'Rechts', pronunciation: 'REKHTS' },
          { id: 'de-d4', english: 'Straight ahead', translation: 'Geradeaus', pronunciation: 'geh-RAH-deh-ows' },
          { id: 'de-d5', english: 'Near', translation: 'Nah', pronunciation: 'NAH' },
          { id: 'de-d6', english: 'Far', translation: 'Weit', pronunciation: 'VITE' },
          { id: 'de-d7', english: 'Train station', translation: 'Bahnhof', pronunciation: 'BAHN-hohf' },
          { id: 'de-d8', english: 'Airport', translation: 'Flughafen', pronunciation: 'FLOOK-hah-fen' },
        ],
        food: [
          { id: 'de-f1', english: 'I would like...', translation: 'Ich mochte...', pronunciation: 'ikh MURKH-teh' },
          { id: 'de-f2', english: 'The menu, please', translation: 'Die Speisekarte, bitte', pronunciation: 'dee SHPY-zeh-kar-teh BIT-teh' },
          { id: 'de-f3', english: 'Water', translation: 'Wasser', pronunciation: 'VAH-ser' },
          { id: 'de-f4', english: 'The bill, please', translation: 'Die Rechnung, bitte', pronunciation: 'dee REKH-noong BIT-teh' },
          { id: 'de-f5', english: 'Delicious', translation: 'Lecker', pronunciation: 'LEK-er' },
          { id: 'de-f6', english: 'Vegetarian', translation: 'Vegetarisch', pronunciation: 'veh-geh-TAH-rish' },
          { id: 'de-f7', english: 'No spicy', translation: 'Nicht scharf', pronunciation: 'nikht SHAHRF' },
          { id: 'de-f8', english: 'Breakfast', translation: 'Fruhstuck', pronunciation: 'FREW-shtewk' },
        ],
        emergency: [
          { id: 'de-e1', english: 'Help!', translation: 'Hilfe!', pronunciation: 'HIL-feh' },
          { id: 'de-e2', english: 'Call the police', translation: 'Rufen Sie die Polizei', pronunciation: 'ROO-fen zee dee poh-lee-TSAI' },
          { id: 'de-e3', english: 'I need a doctor', translation: 'Ich brauche einen Arzt', pronunciation: 'ikh BROW-kheh I-nen ARTST' },
          { id: 'de-e4', english: 'Hospital', translation: 'Krankenhaus', pronunciation: 'KRAHN-ken-hows' },
          { id: 'de-e5', english: 'I am lost', translation: 'Ich habe mich verlaufen', pronunciation: 'ikh HAH-beh mikh fer-LOW-fen' },
          { id: 'de-e6', english: 'Emergency', translation: 'Notfall', pronunciation: 'NOHT-fahl' },
          { id: 'de-e7', english: 'Fire!', translation: 'Feuer!', pronunciation: 'FOY-er' },
          { id: 'de-e8', english: 'I need help', translation: 'Ich brauche Hilfe', pronunciation: 'ikh BROW-kheh HIL-feh' },
        ],
      },
    },
    italian: {
      name: 'Italian',
      flag: 'IT',
      phrases: {
        greetings: [
          { id: 'it-g1', english: 'Hello', translation: 'Ciao', pronunciation: 'CHOW' },
          { id: 'it-g2', english: 'Good morning', translation: 'Buongiorno', pronunciation: 'bwohn-JOHR-noh' },
          { id: 'it-g3', english: 'Good evening', translation: 'Buonasera', pronunciation: 'bwoh-nah-SEH-rah' },
          { id: 'it-g4', english: 'Goodbye', translation: 'Arrivederci', pronunciation: 'ah-ree-veh-DEHR-chee' },
          { id: 'it-g5', english: 'Thank you', translation: 'Grazie', pronunciation: 'GRAH-tsee-eh' },
          { id: 'it-g6', english: 'Please', translation: 'Per favore', pronunciation: 'pehr fah-VOH-reh' },
          { id: 'it-g7', english: 'Excuse me', translation: 'Scusi', pronunciation: 'SKOO-zee' },
          { id: 'it-g8', english: 'How are you?', translation: 'Come sta?', pronunciation: 'KOH-meh STAH' },
        ],
        directions: [
          { id: 'it-d1', english: 'Where is...?', translation: 'Dov\'e...?', pronunciation: 'doh-VEH' },
          { id: 'it-d2', english: 'Left', translation: 'Sinistra', pronunciation: 'see-NEE-strah' },
          { id: 'it-d3', english: 'Right', translation: 'Destra', pronunciation: 'DEH-strah' },
          { id: 'it-d4', english: 'Straight ahead', translation: 'Dritto', pronunciation: 'DREET-toh' },
          { id: 'it-d5', english: 'Near', translation: 'Vicino', pronunciation: 'vee-CHEE-noh' },
          { id: 'it-d6', english: 'Far', translation: 'Lontano', pronunciation: 'lohn-TAH-noh' },
          { id: 'it-d7', english: 'Train station', translation: 'Stazione', pronunciation: 'stah-tsee-OH-neh' },
          { id: 'it-d8', english: 'Airport', translation: 'Aeroporto', pronunciation: 'ah-eh-roh-POHR-toh' },
        ],
        food: [
          { id: 'it-f1', english: 'I would like...', translation: 'Vorrei...', pronunciation: 'vohr-RAY' },
          { id: 'it-f2', english: 'The menu, please', translation: 'Il menu, per favore', pronunciation: 'eel meh-NOO pehr fah-VOH-reh' },
          { id: 'it-f3', english: 'Water', translation: 'Acqua', pronunciation: 'AH-kwah' },
          { id: 'it-f4', english: 'The bill, please', translation: 'Il conto, per favore', pronunciation: 'eel KOHN-toh pehr fah-VOH-reh' },
          { id: 'it-f5', english: 'Delicious', translation: 'Delizioso', pronunciation: 'deh-lee-tsee-OH-zoh' },
          { id: 'it-f6', english: 'Vegetarian', translation: 'Vegetariano', pronunciation: 'veh-jeh-tah-ree-AH-noh' },
          { id: 'it-f7', english: 'No spicy', translation: 'Non piccante', pronunciation: 'nohn peek-KAHN-teh' },
          { id: 'it-f8', english: 'Breakfast', translation: 'Colazione', pronunciation: 'koh-lah-tsee-OH-neh' },
        ],
        emergency: [
          { id: 'it-e1', english: 'Help!', translation: 'Aiuto!', pronunciation: 'ah-YOO-toh' },
          { id: 'it-e2', english: 'Call the police', translation: 'Chiami la polizia', pronunciation: 'kee-AH-mee lah poh-lee-TSEE-ah' },
          { id: 'it-e3', english: 'I need a doctor', translation: 'Ho bisogno di un medico', pronunciation: 'oh bee-ZOH-nyoh dee oon MEH-dee-koh' },
          { id: 'it-e4', english: 'Hospital', translation: 'Ospedale', pronunciation: 'oh-speh-DAH-leh' },
          { id: 'it-e5', english: 'I am lost', translation: 'Mi sono perso', pronunciation: 'mee SOH-noh PEHR-soh' },
          { id: 'it-e6', english: 'Emergency', translation: 'Emergenza', pronunciation: 'eh-mehr-JEHN-tsah' },
          { id: 'it-e7', english: 'Fire!', translation: 'Fuoco!', pronunciation: 'FWOH-koh' },
          { id: 'it-e8', english: 'I need help', translation: 'Ho bisogno di aiuto', pronunciation: 'oh bee-ZOH-nyoh dee ah-YOO-toh' },
        ],
      },
    },
    japanese: {
      name: 'Japanese',
      flag: 'JP',
      phrases: {
        greetings: [
          { id: 'jp-g1', english: 'Hello', translation: 'Konnichiwa', pronunciation: 'kohn-nee-chee-WAH' },
          { id: 'jp-g2', english: 'Good morning', translation: 'Ohayo gozaimasu', pronunciation: 'oh-HAH-yoh goh-zah-ee-MAHS' },
          { id: 'jp-g3', english: 'Good evening', translation: 'Konbanwa', pronunciation: 'kohn-bahn-WAH' },
          { id: 'jp-g4', english: 'Goodbye', translation: 'Sayonara', pronunciation: 'sah-yoh-NAH-rah' },
          { id: 'jp-g5', english: 'Thank you', translation: 'Arigato gozaimasu', pronunciation: 'ah-ree-GAH-toh goh-zah-ee-MAHS' },
          { id: 'jp-g6', english: 'Please', translation: 'Onegaishimasu', pronunciation: 'oh-neh-gah-ee-shee-MAHS' },
          { id: 'jp-g7', english: 'Excuse me', translation: 'Sumimasen', pronunciation: 'soo-mee-mah-SEHN' },
          { id: 'jp-g8', english: 'How are you?', translation: 'O-genki desu ka?', pronunciation: 'oh-GEHN-kee dehs KAH' },
        ],
        directions: [
          { id: 'jp-d1', english: 'Where is...?', translation: '...wa doko desu ka?', pronunciation: 'wah DOH-koh dehs KAH' },
          { id: 'jp-d2', english: 'Left', translation: 'Hidari', pronunciation: 'hee-DAH-ree' },
          { id: 'jp-d3', english: 'Right', translation: 'Migi', pronunciation: 'MEE-gee' },
          { id: 'jp-d4', english: 'Straight ahead', translation: 'Massugu', pronunciation: 'mahs-SOO-goo' },
          { id: 'jp-d5', english: 'Near', translation: 'Chikai', pronunciation: 'chee-KAH-ee' },
          { id: 'jp-d6', english: 'Far', translation: 'Tooi', pronunciation: 'TOH-ee' },
          { id: 'jp-d7', english: 'Train station', translation: 'Eki', pronunciation: 'EH-kee' },
          { id: 'jp-d8', english: 'Airport', translation: 'Kuko', pronunciation: 'KOO-koh' },
        ],
        food: [
          { id: 'jp-f1', english: 'I would like...', translation: '...o kudasai', pronunciation: 'oh koo-dah-SAH-ee' },
          { id: 'jp-f2', english: 'The menu, please', translation: 'Menyu o kudasai', pronunciation: 'MEHN-yoo oh koo-dah-SAH-ee' },
          { id: 'jp-f3', english: 'Water', translation: 'Mizu', pronunciation: 'MEE-zoo' },
          { id: 'jp-f4', english: 'The bill, please', translation: 'Okaikei o kudasai', pronunciation: 'oh-kah-ee-KEH oh koo-dah-SAH-ee' },
          { id: 'jp-f5', english: 'Delicious', translation: 'Oishii', pronunciation: 'oh-ee-SHEE' },
          { id: 'jp-f6', english: 'Vegetarian', translation: 'Bejitarian', pronunciation: 'beh-jee-TAH-ree-ahn' },
          { id: 'jp-f7', english: 'No spicy', translation: 'Karakunai', pronunciation: 'kah-rah-koo-NAH-ee' },
          { id: 'jp-f8', english: 'Breakfast', translation: 'Asagohan', pronunciation: 'ah-sah-GOH-hahn' },
        ],
        emergency: [
          { id: 'jp-e1', english: 'Help!', translation: 'Tasukete!', pronunciation: 'tah-soo-KEH-teh' },
          { id: 'jp-e2', english: 'Call the police', translation: 'Keisatsu o yonde', pronunciation: 'keh-ee-SAHT-soo oh YOHN-deh' },
          { id: 'jp-e3', english: 'I need a doctor', translation: 'Isha ga hitsuyou desu', pronunciation: 'ee-SHAH gah hee-tsoo-YOH dehs' },
          { id: 'jp-e4', english: 'Hospital', translation: 'Byoin', pronunciation: 'byoh-EEN' },
          { id: 'jp-e5', english: 'I am lost', translation: 'Michi ni mayoimashita', pronunciation: 'MEE-chee nee mah-yoh-ee-MAHSH-tah' },
          { id: 'jp-e6', english: 'Emergency', translation: 'Kinkyu', pronunciation: 'keen-KYOO' },
          { id: 'jp-e7', english: 'Fire!', translation: 'Kaji!', pronunciation: 'KAH-jee' },
          { id: 'jp-e8', english: 'I need help', translation: 'Tasuke ga hitsuyou desu', pronunciation: 'tah-soo-KEH gah hee-tsoo-YOH dehs' },
        ],
      },
    },
    mandarin: {
      name: 'Mandarin',
      flag: 'CN',
      phrases: {
        greetings: [
          { id: 'cn-g1', english: 'Hello', translation: 'Ni hao', pronunciation: 'nee HOW' },
          { id: 'cn-g2', english: 'Good morning', translation: 'Zao shang hao', pronunciation: 'DZOW shahng HOW' },
          { id: 'cn-g3', english: 'Good evening', translation: 'Wan shang hao', pronunciation: 'WAHN shahng HOW' },
          { id: 'cn-g4', english: 'Goodbye', translation: 'Zai jian', pronunciation: 'dzai jee-EHN' },
          { id: 'cn-g5', english: 'Thank you', translation: 'Xie xie', pronunciation: 'shyeh shyeh' },
          { id: 'cn-g6', english: 'Please', translation: 'Qing', pronunciation: 'CHEENG' },
          { id: 'cn-g7', english: 'Excuse me', translation: 'Dui bu qi', pronunciation: 'dway boo CHEE' },
          { id: 'cn-g8', english: 'How are you?', translation: 'Ni hao ma?', pronunciation: 'nee HOW mah' },
        ],
        directions: [
          { id: 'cn-d1', english: 'Where is...?', translation: '...zai nali?', pronunciation: 'dzai NAH-lee' },
          { id: 'cn-d2', english: 'Left', translation: 'Zuo', pronunciation: 'DZWOH' },
          { id: 'cn-d3', english: 'Right', translation: 'You', pronunciation: 'YOH' },
          { id: 'cn-d4', english: 'Straight ahead', translation: 'Zhi zou', pronunciation: 'JEE dzoh' },
          { id: 'cn-d5', english: 'Near', translation: 'Jin', pronunciation: 'JEEN' },
          { id: 'cn-d6', english: 'Far', translation: 'Yuan', pronunciation: 'yoo-EHN' },
          { id: 'cn-d7', english: 'Train station', translation: 'Huo che zhan', pronunciation: 'hwoh chuh JAHN' },
          { id: 'cn-d8', english: 'Airport', translation: 'Ji chang', pronunciation: 'jee CHAHNG' },
        ],
        food: [
          { id: 'cn-f1', english: 'I would like...', translation: 'Wo xiang yao...', pronunciation: 'woh shyahng YOW' },
          { id: 'cn-f2', english: 'The menu, please', translation: 'Qing gei wo caidan', pronunciation: 'cheeng gay woh TSAI-dahn' },
          { id: 'cn-f3', english: 'Water', translation: 'Shui', pronunciation: 'SHWAY' },
          { id: 'cn-f4', english: 'The bill, please', translation: 'Qing jie zhang', pronunciation: 'cheeng jee-EH JAHNG' },
          { id: 'cn-f5', english: 'Delicious', translation: 'Hao chi', pronunciation: 'HOW chee' },
          { id: 'cn-f6', english: 'Vegetarian', translation: 'Su shi', pronunciation: 'SOO shee' },
          { id: 'cn-f7', english: 'No spicy', translation: 'Bu yao la', pronunciation: 'boo YOW LAH' },
          { id: 'cn-f8', english: 'Breakfast', translation: 'Zao can', pronunciation: 'DZOW tsahn' },
        ],
        emergency: [
          { id: 'cn-e1', english: 'Help!', translation: 'Jiu ming!', pronunciation: 'jee-OH MEENG' },
          { id: 'cn-e2', english: 'Call the police', translation: 'Jiao jingcha', pronunciation: 'jee-OW jeeng-CHAH' },
          { id: 'cn-e3', english: 'I need a doctor', translation: 'Wo xu yao yi sheng', pronunciation: 'woh shoo YOW ee SHUHNG' },
          { id: 'cn-e4', english: 'Hospital', translation: 'Yi yuan', pronunciation: 'ee yoo-EHN' },
          { id: 'cn-e5', english: 'I am lost', translation: 'Wo mi lu le', pronunciation: 'woh mee LOO luh' },
          { id: 'cn-e6', english: 'Emergency', translation: 'Jin ji', pronunciation: 'jeen JEE' },
          { id: 'cn-e7', english: 'Fire!', translation: 'Zhao huo le!', pronunciation: 'JAOW hwoh LUH' },
          { id: 'cn-e8', english: 'I need help', translation: 'Wo xu yao bang zhu', pronunciation: 'woh shoo YOW bahng JOO' },
        ],
      },
    },
    portuguese: {
      name: 'Portuguese',
      flag: 'PT',
      phrases: {
        greetings: [
          { id: 'pt-g1', english: 'Hello', translation: 'Ola', pronunciation: 'oh-LAH' },
          { id: 'pt-g2', english: 'Good morning', translation: 'Bom dia', pronunciation: 'bohm JEE-ah' },
          { id: 'pt-g3', english: 'Good evening', translation: 'Boa noite', pronunciation: 'BOH-ah NOY-chee' },
          { id: 'pt-g4', english: 'Goodbye', translation: 'Adeus', pronunciation: 'ah-DAY-oosh' },
          { id: 'pt-g5', english: 'Thank you', translation: 'Obrigado', pronunciation: 'oh-bree-GAH-doo' },
          { id: 'pt-g6', english: 'Please', translation: 'Por favor', pronunciation: 'pohr fah-VOHR' },
          { id: 'pt-g7', english: 'Excuse me', translation: 'Com licenca', pronunciation: 'kohm lee-SEHN-sah' },
          { id: 'pt-g8', english: 'How are you?', translation: 'Como esta?', pronunciation: 'KOH-moo esh-TAH' },
        ],
        directions: [
          { id: 'pt-d1', english: 'Where is...?', translation: 'Onde fica...?', pronunciation: 'OHN-jee FEE-kah' },
          { id: 'pt-d2', english: 'Left', translation: 'Esquerda', pronunciation: 'esh-KEHR-dah' },
          { id: 'pt-d3', english: 'Right', translation: 'Direita', pronunciation: 'jee-RAY-tah' },
          { id: 'pt-d4', english: 'Straight ahead', translation: 'Em frente', pronunciation: 'ehm FREHN-chee' },
          { id: 'pt-d5', english: 'Near', translation: 'Perto', pronunciation: 'PEHR-too' },
          { id: 'pt-d6', english: 'Far', translation: 'Longe', pronunciation: 'LOHN-zhee' },
          { id: 'pt-d7', english: 'Train station', translation: 'Estacao de trem', pronunciation: 'esh-tah-SOW jee TREHN' },
          { id: 'pt-d8', english: 'Airport', translation: 'Aeroporto', pronunciation: 'ah-eh-roh-POHR-too' },
        ],
        food: [
          { id: 'pt-f1', english: 'I would like...', translation: 'Eu gostaria...', pronunciation: 'eh-oo goh-stah-REE-ah' },
          { id: 'pt-f2', english: 'The menu, please', translation: 'O cardapio, por favor', pronunciation: 'oo kahr-DAH-pyoo pohr fah-VOHR' },
          { id: 'pt-f3', english: 'Water', translation: 'Agua', pronunciation: 'AH-gwah' },
          { id: 'pt-f4', english: 'The bill, please', translation: 'A conta, por favor', pronunciation: 'ah KOHN-tah pohr fah-VOHR' },
          { id: 'pt-f5', english: 'Delicious', translation: 'Delicioso', pronunciation: 'deh-lee-see-OH-zoo' },
          { id: 'pt-f6', english: 'Vegetarian', translation: 'Vegetariano', pronunciation: 'veh-zheh-tah-ree-AH-noo' },
          { id: 'pt-f7', english: 'No spicy', translation: 'Sem pimenta', pronunciation: 'sehm pee-MEHN-tah' },
          { id: 'pt-f8', english: 'Breakfast', translation: 'Cafe da manha', pronunciation: 'kah-FEH dah mah-NYAH' },
        ],
        emergency: [
          { id: 'pt-e1', english: 'Help!', translation: 'Socorro!', pronunciation: 'soh-KOH-hoo' },
          { id: 'pt-e2', english: 'Call the police', translation: 'Chame a policia', pronunciation: 'SHAH-mee ah poh-LEE-see-ah' },
          { id: 'pt-e3', english: 'I need a doctor', translation: 'Preciso de um medico', pronunciation: 'preh-SEE-zoo jee oom MEH-jee-koo' },
          { id: 'pt-e4', english: 'Hospital', translation: 'Hospital', pronunciation: 'oh-spee-TAHL' },
          { id: 'pt-e5', english: 'I am lost', translation: 'Estou perdido', pronunciation: 'esh-TOH pehr-JEE-doo' },
          { id: 'pt-e6', english: 'Emergency', translation: 'Emergencia', pronunciation: 'eh-mehr-ZHEHN-see-ah' },
          { id: 'pt-e7', english: 'Fire!', translation: 'Fogo!', pronunciation: 'FOH-goo' },
          { id: 'pt-e8', english: 'I need help', translation: 'Preciso de ajuda', pronunciation: 'preh-SEE-zoo jee ah-ZHOO-dah' },
        ],
      },
    },
    korean: {
      name: 'Korean',
      flag: 'KR',
      phrases: {
        greetings: [
          { id: 'kr-g1', english: 'Hello', translation: 'Annyeonghaseyo', pronunciation: 'ahn-nyuhng-hah-SEH-yoh' },
          { id: 'kr-g2', english: 'Good morning', translation: 'Joeun achim', pronunciation: 'joh-EUN ah-CHEEM' },
          { id: 'kr-g3', english: 'Good evening', translation: 'Joeun jeonyeok', pronunciation: 'joh-EUN juhn-YUHK' },
          { id: 'kr-g4', english: 'Goodbye', translation: 'Annyeonghi gaseyo', pronunciation: 'ahn-nyuhng-hee gah-SEH-yoh' },
          { id: 'kr-g5', english: 'Thank you', translation: 'Gamsahamnida', pronunciation: 'gahm-sah-HAHM-nee-dah' },
          { id: 'kr-g6', english: 'Please', translation: 'Juseyo', pronunciation: 'joo-SEH-yoh' },
          { id: 'kr-g7', english: 'Excuse me', translation: 'Sillyehamnida', pronunciation: 'sheel-lyeh-HAHM-nee-dah' },
          { id: 'kr-g8', english: 'How are you?', translation: 'Eotteoseyo?', pronunciation: 'uh-TTUH-seh-yoh' },
        ],
        directions: [
          { id: 'kr-d1', english: 'Where is...?', translation: '...eodi isseoyo?', pronunciation: 'UH-dee ee-SUH-yoh' },
          { id: 'kr-d2', english: 'Left', translation: 'Oenjjok', pronunciation: 'wehn-JJOHK' },
          { id: 'kr-d3', english: 'Right', translation: 'Oreunjjok', pronunciation: 'oh-REUN-jjohk' },
          { id: 'kr-d4', english: 'Straight ahead', translation: 'Jikjin', pronunciation: 'JEEK-jeen' },
          { id: 'kr-d5', english: 'Near', translation: 'Gakkaun', pronunciation: 'gah-KKAH-oon' },
          { id: 'kr-d6', english: 'Far', translation: 'Meon', pronunciation: 'MUH-uhn' },
          { id: 'kr-d7', english: 'Train station', translation: 'Gicha yeok', pronunciation: 'GEE-chah YUHK' },
          { id: 'kr-d8', english: 'Airport', translation: 'Gonghang', pronunciation: 'GOHNG-hahng' },
        ],
        food: [
          { id: 'kr-f1', english: 'I would like...', translation: '...juseyo', pronunciation: 'joo-SEH-yoh' },
          { id: 'kr-f2', english: 'The menu, please', translation: 'Menyu juseyo', pronunciation: 'MEH-nyoo joo-SEH-yoh' },
          { id: 'kr-f3', english: 'Water', translation: 'Mul', pronunciation: 'MOOL' },
          { id: 'kr-f4', english: 'The bill, please', translation: 'Gyesanseo juseyo', pronunciation: 'gyeh-SAHN-suh joo-SEH-yoh' },
          { id: 'kr-f5', english: 'Delicious', translation: 'Mashisseoyo', pronunciation: 'mah-shee-SUH-yoh' },
          { id: 'kr-f6', english: 'Vegetarian', translation: 'Chaeshikjuuija', pronunciation: 'chae-SHEEK-joo-ee-jah' },
          { id: 'kr-f7', english: 'No spicy', translation: 'An maepge', pronunciation: 'ahn MAEP-geh' },
          { id: 'kr-f8', english: 'Breakfast', translation: 'Achim siksa', pronunciation: 'ah-CHEEM SHEEK-sah' },
        ],
        emergency: [
          { id: 'kr-e1', english: 'Help!', translation: 'Dowajuseyo!', pronunciation: 'doh-WAH-joo-seh-yoh' },
          { id: 'kr-e2', english: 'Call the police', translation: 'Gyeongchal bulleojuseyo', pronunciation: 'gyuhng-CHAHL bool-luh-joo-SEH-yoh' },
          { id: 'kr-e3', english: 'I need a doctor', translation: 'Uisa pilyohaeyo', pronunciation: 'ee-SAH peel-yoh-HAE-yoh' },
          { id: 'kr-e4', english: 'Hospital', translation: 'Byeongwon', pronunciation: 'byuhng-WOHN' },
          { id: 'kr-e5', english: 'I am lost', translation: 'Gireul ilheosseoyo', pronunciation: 'gee-REUL eel-huh-SUH-yoh' },
          { id: 'kr-e6', english: 'Emergency', translation: 'Eunggeup', pronunciation: 'EUNG-geup' },
          { id: 'kr-e7', english: 'Fire!', translation: 'Buliya!', pronunciation: 'bool-ee-YAH' },
          { id: 'kr-e8', english: 'I need help', translation: 'Dowa pilyohaeyo', pronunciation: 'doh-WAH peel-yoh-HAE-yoh' },
        ],
      },
    },
  };

  const currentLanguage = languages[language];

  const displayedPhrases = useMemo(() => {
    const phrases = currentLanguage.phrases[category];
    if (showFavoritesOnly) {
      return phrases.filter((phrase) => favorites.has(phrase.id));
    }
    return phrases;
  }, [currentLanguage, category, favorites, showFavoritesOnly]);

  const toggleFavorite = (id: string) => {
    setFavorites((prev) => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(id)) {
        newFavorites.delete(id);
      } else {
        newFavorites.add(id);
      }
      return newFavorites;
    });
  };

  const copyToClipboard = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const speakPhrase = (text: string, lang: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      const langMap: Record<Language, string> = {
        spanish: 'es-ES',
        french: 'fr-FR',
        german: 'de-DE',
        italian: 'it-IT',
        japanese: 'ja-JP',
        mandarin: 'zh-CN',
        portuguese: 'pt-PT',
        korean: 'ko-KR',
      };
      utterance.lang = langMap[lang as Language] || 'en-US';
      speechSynthesis.speak(utterance);
    }
  };

  return (
    <div className={`${isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-sm border overflow-hidden`}>
      <div className={`${isDark ? 'bg-gradient-to-r from-gray-800 to-indigo-900/20' : 'bg-gradient-to-r from-white to-indigo-50'} px-6 py-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-500/10 rounded-lg"><Globe className="w-5 h-5 text-indigo-500" /></div>
          <div>
            <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.languagePhrasebook.travelPhrasebook', 'Travel Phrasebook')}</h3>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.languagePhrasebook.essentialPhrasesForYourTravels', 'Essential phrases for your travels')}</p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Language Selection */}
        <div className="space-y-2">
          <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
            {t('tools.languagePhrasebook.selectLanguage', 'Select Language')}
          </label>
          <div className="grid grid-cols-4 gap-2">
            {(Object.keys(languages) as Language[]).map((lang) => (
              <button
                key={lang}
                onClick={() => setLanguage(lang)}
                className={`py-2 px-3 rounded-lg text-sm flex flex-col items-center gap-1 ${
                  language === lang
                    ? 'bg-indigo-500 text-white'
                    : isDark
                    ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <span className="text-lg">{languages[lang].flag}</span>
                <span className="text-xs">{languages[lang].name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Category Selection */}
        <div className="space-y-2">
          <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
            {t('tools.languagePhrasebook.category', 'Category')}
          </label>
          <div className="grid grid-cols-2 gap-2">
            {(Object.keys(categoryLabels) as Category[]).map((cat) => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`py-3 px-4 rounded-lg text-sm flex items-center gap-2 ${
                  category === cat
                    ? 'bg-indigo-500 text-white'
                    : isDark
                    ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {categoryIcons[cat]}
                {categoryLabels[cat]}
              </button>
            ))}
          </div>
        </div>

        {/* Favorites Filter */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm ${
              showFavoritesOnly
                ? 'bg-pink-500 text-white'
                : isDark
                ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <Heart className={`w-4 h-4 ${showFavoritesOnly ? 'fill-current' : ''}`} />
            Favorites Only ({favorites.size})
          </button>
        </div>

        {/* Phrases List */}
        <div className="space-y-3">
          {displayedPhrases.length === 0 ? (
            <div className={`text-center py-8 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              {showFavoritesOnly
                ? t('tools.languagePhrasebook.noFavoritesInThisCategory', 'No favorites in this category yet. Tap the heart icon to add phrases.') : t('tools.languagePhrasebook.noPhrasesAvailable', 'No phrases available.')}
            </div>
          ) : (
            displayedPhrases.map((phrase) => (
              <div
                key={phrase.id}
                className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'} space-y-2`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                      {phrase.english}
                    </p>
                    <p className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {phrase.translation}
                    </p>
                    <p className={`text-sm ${isDark ? 'text-indigo-400' : 'text-indigo-600'}`}>
                      <Volume2 className="w-3 h-3 inline mr-1" />
                      {phrase.pronunciation}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => speakPhrase(phrase.translation, language)}
                      className={`p-2 rounded-lg ${isDark ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-200 text-gray-600'}`}
                      title={t('tools.languagePhrasebook.listenToPronunciation', 'Listen to pronunciation')}
                    >
                      <Volume2 className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => copyToClipboard(phrase.translation, phrase.id)}
                      className={`p-2 rounded-lg ${isDark ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-200 text-gray-600'}`}
                      title={t('tools.languagePhrasebook.copyToClipboard', 'Copy to clipboard')}
                    >
                      {copiedId === phrase.id ? (
                        <Check className="w-5 h-5 text-green-500" />
                      ) : (
                        <Copy className="w-5 h-5" />
                      )}
                    </button>
                    <button
                      onClick={() => toggleFavorite(phrase.id)}
                      className={`p-2 rounded-lg ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-200'}`}
                      title={favorites.has(phrase.id) ? t('tools.languagePhrasebook.removeFromFavorites', 'Remove from favorites') : t('tools.languagePhrasebook.addToFavorites', 'Add to favorites')}
                    >
                      <Heart
                        className={`w-5 h-5 ${
                          favorites.has(phrase.id)
                            ? 'text-pink-500 fill-current'
                            : isDark
                            ? 'text-gray-400'
                            : 'text-gray-600'
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Quick Stats */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
          <div className="flex items-center justify-between text-sm">
            <div className={isDark ? 'text-gray-400' : 'text-gray-600'}>
              <Star className="w-4 h-4 inline mr-1 text-yellow-500" />
              {displayedPhrases.length} phrases in {categoryLabels[category]}
            </div>
            <div className={isDark ? 'text-gray-400' : 'text-gray-600'}>
              <Heart className="w-4 h-4 inline mr-1 text-pink-500" />
              {favorites.size} total favorites
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LanguagePhrasebookTool;
