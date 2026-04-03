import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { User, Sparkles, Globe, BookOpen, RefreshCw, Copy, Check, Info } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';

type Genre = 'fantasy' | 'scifi' | 'modern' | 'historical' | 'mythological';
type Gender = 'male' | 'female' | 'neutral';
type Origin = 'western' | 'eastern' | 'nordic' | 'african' | 'latin' | 'arabic' | 'mixed';

interface NameData {
  firstName: string;
  surname: string;
  nickname: string;
  meaning: string;
  origin: string;
}

interface NameDatabase {
  firstNames: Record<Gender, string[]>;
  surnames: string[];
  nicknamePrefixes: string[];
  nicknameSuffixes: string[];
  meanings: string[];
}

const nameDatabase: Record<Genre, Record<Origin, NameDatabase>> = {
  fantasy: {
    western: {
      firstNames: {
        male: ['Aldric', 'Theron', 'Cedric', 'Gideon', 'Magnus', 'Rowan', 'Gareth', 'Lysander', 'Percival', 'Alaric'],
        female: ['Elara', 'Seraphina', 'Isolde', 'Rowena', 'Celestia', 'Morgana', 'Lyanna', 'Elowen', 'Avalon', 'Nimue'],
        neutral: ['Rowan', 'Sage', 'Phoenix', 'River', 'Ash', 'Quinn', 'Wren', 'Ember', 'Storm', 'Lark'],
      },
      surnames: ['Shadowmere', 'Brightblade', 'Ironforge', 'Stormwind', 'Ravencrest', 'Thornwood', 'Silverhand', 'Blackthorn'],
      nicknamePrefixes: ['Shadow', 'Storm', 'Fire', 'Ice', 'Moon', 'Star', 'Dragon', 'Wolf'],
      nicknameSuffixes: ['walker', 'seeker', 'bane', 'heart', 'singer', 'weaver', 'caller', 'sworn'],
      meanings: ['keeper of ancient wisdom', 'born under starlight', 'destined for greatness', 'bearer of sacred flame', 'guardian of the realm'],
    },
    eastern: {
      firstNames: {
        male: ['Ryuji', 'Kenji', 'Takeshi', 'Hiroshi', 'Akira', 'Kazuki', 'Daichi', 'Haruki', 'Yuki', 'Ren'],
        female: ['Sakura', 'Yuki', 'Akemi', 'Hana', 'Rei', 'Miko', 'Sora', 'Aya', 'Kaede', 'Mizuki'],
        neutral: ['Akira', 'Hikaru', 'Sora', 'Yuki', 'Ren', 'Haru', 'Nao', 'Rio', 'Shin', 'Kai'],
      },
      surnames: ['Dragonfire', 'Moonblade', 'Stormwatcher', 'Shadowdancer', 'Sunweaver', 'Starborn', 'Windwalker', 'Flameheart'],
      nicknamePrefixes: ['Dragon', 'Phoenix', 'Tiger', 'Jade', 'Moon', 'Sun', 'Wind', 'Thunder'],
      nicknameSuffixes: ['fist', 'blade', 'spirit', 'eye', 'heart', 'wind', 'flame', 'shadow'],
      meanings: ['child of the eastern wind', 'blessed by celestial dragons', 'born during the eclipse', 'keeper of ancient scrolls', 'master of hidden arts'],
    },
    nordic: {
      firstNames: {
        male: ['Bjorn', 'Ragnar', 'Leif', 'Erik', 'Thorin', 'Sigurd', 'Odin', 'Fenrir', 'Kael', 'Vidar'],
        female: ['Freya', 'Astrid', 'Sigrid', 'Ingrid', 'Helga', 'Brunhilde', 'Thyra', 'Eira', 'Solveig', 'Runa'],
        neutral: ['Rune', 'Storm', 'Frost', 'Skye', 'Aspen', 'Winter', 'North', 'Vale', 'Birch', 'Snow'],
      },
      surnames: ['Ironside', 'Bloodaxe', 'Frostborn', 'Stormcaller', 'Thunderson', 'Wolfbane', 'Iceheart', 'Dragonslayer'],
      nicknamePrefixes: ['Iron', 'Frost', 'Blood', 'Storm', 'Thunder', 'Wolf', 'Bear', 'Raven'],
      nicknameSuffixes: ['born', 'slayer', 'hammer', 'shield', 'breaker', 'keeper', 'rider', 'walker'],
      meanings: ['favored by the gods', 'born of winter storms', 'blood of ancient kings', 'touched by Odin', 'champion of Valhalla'],
    },
    african: {
      firstNames: {
        male: ['Kofi', 'Kwame', 'Zuberi', 'Jabari', 'Amari', 'Tau', 'Zaire', 'Khari', 'Sekou', 'Mosi'],
        female: ['Amara', 'Zara', 'Nia', 'Kaya', 'Imani', 'Zola', 'Sade', 'Asha', 'Makena', 'Ayana'],
        neutral: ['Amari', 'Kaya', 'Zola', 'Nile', 'Ayo', 'Chidi', 'Dara', 'Femi', 'Jahi', 'Kito'],
      },
      surnames: ['Sunkeeper', 'Lionheart', 'Stormchaser', 'Earthshaker', 'Spiritwalker', 'Skydancer', 'Flameguard', 'Soulweaver'],
      nicknamePrefixes: ['Lion', 'Eagle', 'Thunder', 'Sun', 'Earth', 'Spirit', 'Sky', 'Flame'],
      nicknameSuffixes: ['keeper', 'walker', 'dancer', 'singer', 'caller', 'watcher', 'hunter', 'guardian'],
      meanings: ['child of the savanna', 'blessed by ancestors', 'born during great storms', 'keeper of tribal wisdom', 'voice of the spirits'],
    },
    latin: {
      firstNames: {
        male: ['Aurelio', 'Maximus', 'Lucius', 'Cassius', 'Dante', 'Rafael', 'Santiago', 'Emilio', 'Marco', 'Felix'],
        female: ['Aurora', 'Luna', 'Valentina', 'Isabella', 'Serena', 'Lucia', 'Stella', 'Aria', 'Camila', 'Elena'],
        neutral: ['Rio', 'Cruz', 'Sol', 'Mar', 'Paz', 'Angel', 'Eden', 'Reese', 'Jules', 'Alex'],
      },
      surnames: ['Goldenveil', 'Starcrest', 'Moonwhisper', 'Sunforge', 'Silverbane', 'Flamecrown', 'Stormsong', 'Nightbloom'],
      nicknamePrefixes: ['Golden', 'Silver', 'Star', 'Moon', 'Sun', 'Flame', 'Storm', 'Night'],
      nicknameSuffixes: ['born', 'touched', 'blessed', 'crowned', 'sworn', 'bound', 'marked', 'chosen'],
      meanings: ['heir to ancient power', 'blessed by celestial light', 'born under twin moons', 'keeper of sacred flames', 'voice of the ancients'],
    },
    arabic: {
      firstNames: {
        male: ['Khalid', 'Omar', 'Zain', 'Rashid', 'Malik', 'Jamal', 'Tariq', 'Samir', 'Karim', 'Farid'],
        female: ['Layla', 'Zara', 'Amira', 'Nadia', 'Fatima', 'Jasmine', 'Samira', 'Leila', 'Yasmin', 'Aaliyah'],
        neutral: ['Noor', 'Shams', 'Qamar', 'Rayan', 'Safi', 'Hayat', 'Bahr', 'Sama', 'Amal', 'Ihsan'],
      },
      surnames: ['Desertwind', 'Sandseer', 'Oasiskeeper', 'Stargazer', 'Dunewalker', 'Miragecaller', 'Sunshadow', 'Moonveil'],
      nicknamePrefixes: ['Desert', 'Sand', 'Oasis', 'Star', 'Dune', 'Mirage', 'Sun', 'Moon'],
      nicknameSuffixes: ['walker', 'seeker', 'keeper', 'gazer', 'caller', 'shadow', 'veil', 'wind'],
      meanings: ['child of the endless sands', 'blessed by desert spirits', 'born under the crescent moon', 'keeper of oasis secrets', 'voice of the wind'],
    },
    mixed: {
      firstNames: {
        male: ['Kael', 'Zephyr', 'Orion', 'Atlas', 'Caspian', 'Phoenix', 'Sterling', 'Jasper', 'Onyx', 'Cipher'],
        female: ['Nova', 'Luna', 'Aurora', 'Willow', 'Ivy', 'Raven', 'Scarlet', 'Jade', 'Crystal', 'Ember'],
        neutral: ['Phoenix', 'River', 'Sage', 'Quinn', 'Blake', 'Morgan', 'Jordan', 'Avery', 'Taylor', 'Casey'],
      },
      surnames: ['Worldwalker', 'Voidtouched', 'Starweaver', 'Fatebound', 'Realmsinger', 'Eternalheart', 'Shadowsong', 'Lightbringer'],
      nicknamePrefixes: ['Void', 'Star', 'Fate', 'Realm', 'Eternal', 'Shadow', 'Light', 'Chaos'],
      nicknameSuffixes: ['walker', 'touched', 'weaver', 'bound', 'singer', 'heart', 'song', 'bringer'],
      meanings: ['wanderer between worlds', 'touched by fate itself', 'born at the crossroads of destiny', 'keeper of universal secrets', 'bridge between realms'],
    },
  },
  scifi: {
    western: {
      firstNames: {
        male: ['Zane', 'Axel', 'Jace', 'Revan', 'Cole', 'Dash', 'Flynn', 'Rex', 'Slate', 'Blaze'],
        female: ['Nova', 'Zara', 'Echo', 'Vega', 'Lyra', 'Astra', 'Nyx', 'Cleo', 'Jade', 'Raven'],
        neutral: ['Cipher', 'Vector', 'Pixel', 'Quantum', 'Hex', 'Binary', 'Nexus', 'Zero', 'Pulse', 'Flux'],
      },
      surnames: ['Starforge', 'Voidwalker', 'Nebulae', 'Photon', 'Quantum', 'Darkmatter', 'Lightspeed', 'Stardust'],
      nicknamePrefixes: ['Star', 'Void', 'Cyber', 'Neo', 'Tech', 'Nova', 'Astro', 'Laser'],
      nicknameSuffixes: ['runner', 'jack', 'punk', 'hacker', 'pilot', 'hunter', 'ghost', 'blade'],
      meanings: ['born among the stars', 'enhanced with cybernetics', 'survivor of the void wars', 'pilot of the outer rim', 'keeper of forbidden tech'],
    },
    eastern: {
      firstNames: {
        male: ['Ryzen', 'Kaito', 'Akio', 'Hiro', 'Shin', 'Kira', 'Takumi', 'Yusei', 'Zero', 'Neo'],
        female: ['Aiko', 'Mika', 'Yuki', 'Rin', 'Mei', 'Suki', 'Kira', 'Hana', 'Luna', 'Rei'],
        neutral: ['Kai', 'Ryo', 'Sen', 'Zen', 'Yuu', 'Sora', 'Aki', 'Ren', 'Jin', 'Tao'],
      },
      surnames: ['Neonblade', 'Cybersong', 'Hologram', 'Datastream', 'Circuitborn', 'Quantumlink', 'Synthwave', 'Chromeweave'],
      nicknamePrefixes: ['Neon', 'Cyber', 'Holo', 'Data', 'Circuit', 'Quantum', 'Synth', 'Chrome'],
      nicknameSuffixes: ['blade', 'song', 'link', 'weave', 'stream', 'born', 'wave', 'jack'],
      meanings: ['child of the megacity', 'enhanced with neural link', 'born in the data streams', 'master of synthetic arts', 'ghost in the machine'],
    },
    nordic: {
      firstNames: {
        male: ['Axel', 'Erik', 'Lars', 'Bjorn', 'Sven', 'Odin', 'Thor', 'Magnus', 'Leif', 'Ragnar'],
        female: ['Freya', 'Astrid', 'Ingrid', 'Sigrid', 'Helga', 'Eira', 'Saga', 'Thyra', 'Liv', 'Solveig'],
        neutral: ['Storm', 'Frost', 'Sky', 'North', 'Vale', 'Rune', 'Ash', 'Echo', 'Snow', 'Gale'],
      },
      surnames: ['Frostbyte', 'Ironcore', 'Steelheart', 'Thunderstrike', 'Coldforge', 'Icechip', 'Titanweld', 'Plasmaborn'],
      nicknamePrefixes: ['Frost', 'Iron', 'Steel', 'Thunder', 'Cold', 'Ice', 'Titan', 'Plasma'],
      nicknameSuffixes: ['byte', 'core', 'heart', 'strike', 'forge', 'chip', 'weld', 'born'],
      meanings: ['forged in orbital stations', 'survivor of ice world colonies', 'enhanced with cryo-tech', 'pilot of arctic cruisers', 'keeper of old earth traditions'],
    },
    african: {
      firstNames: {
        male: ['Zuberi', 'Kofi', 'Jabari', 'Tau', 'Amari', 'Zaire', 'Khari', 'Sekou', 'Mosi', 'Dayo'],
        female: ['Amara', 'Zara', 'Nia', 'Kaya', 'Imani', 'Zola', 'Sade', 'Asha', 'Makena', 'Ayana'],
        neutral: ['Amari', 'Kaya', 'Nile', 'Ayo', 'Sol', 'Zion', 'Rio', 'Sky', 'Sage', 'Phoenix'],
      },
      surnames: ['Suncore', 'Solarflare', 'Sandstorm', 'Dustwind', 'Savannah', 'Prideborn', 'Earthlink', 'Starlight'],
      nicknamePrefixes: ['Sun', 'Solar', 'Sand', 'Dust', 'Pride', 'Earth', 'Star', 'Sky'],
      nicknameSuffixes: ['core', 'flare', 'storm', 'wind', 'born', 'link', 'light', 'runner'],
      meanings: ['child of the solar colonies', 'enhanced with bio-tech', 'born on terraformed worlds', 'keeper of ancestral data', 'voice of the star tribes'],
    },
    latin: {
      firstNames: {
        male: ['Dante', 'Marco', 'Rafael', 'Felix', 'Aurelio', 'Santiago', 'Emilio', 'Lucio', 'Maxim', 'Victor'],
        female: ['Luna', 'Aurora', 'Stella', 'Nova', 'Serena', 'Valentina', 'Isabella', 'Lucia', 'Camila', 'Aria'],
        neutral: ['Sol', 'Rio', 'Cruz', 'Angel', 'Alex', 'Eden', 'Phoenix', 'Jules', 'Reese', 'Morgan'],
      },
      surnames: ['Starcrest', 'Moonbase', 'Solaris', 'Novastorm', 'Cosmicborn', 'Galaxia', 'Nebulon', 'Celestine'],
      nicknamePrefixes: ['Star', 'Moon', 'Solar', 'Nova', 'Cosmic', 'Galaxy', 'Nebula', 'Celest'],
      nicknameSuffixes: ['crest', 'base', 'born', 'storm', 'light', 'core', 'wave', 'drift'],
      meanings: ['heir to galactic fortune', 'born on luxury starliners', 'enhanced with golden tech', 'keeper of corporate secrets', 'voice of the colonies'],
    },
    arabic: {
      firstNames: {
        male: ['Zain', 'Khalid', 'Omar', 'Rashid', 'Tariq', 'Malik', 'Karim', 'Samir', 'Jamal', 'Farid'],
        female: ['Layla', 'Zara', 'Amira', 'Nadia', 'Samira', 'Leila', 'Yasmin', 'Aaliyah', 'Jasmine', 'Fatima'],
        neutral: ['Noor', 'Shams', 'Qamar', 'Rayan', 'Sama', 'Amal', 'Hayat', 'Safi', 'Bahr', 'Ihsan'],
      },
      surnames: ['Sandtech', 'Dunewalker', 'Oasisnet', 'Desertcore', 'Miragecode', 'Sunlink', 'Starport', 'Voidgate'],
      nicknamePrefixes: ['Sand', 'Dune', 'Oasis', 'Desert', 'Mirage', 'Sun', 'Star', 'Void'],
      nicknameSuffixes: ['tech', 'walker', 'net', 'core', 'code', 'link', 'port', 'gate'],
      meanings: ['child of desert planets', 'enhanced with sand-tech', 'born in orbital bazaars', 'keeper of trade routes', 'navigator of the void'],
    },
    mixed: {
      firstNames: {
        male: ['Orion', 'Phoenix', 'Atlas', 'Zephyr', 'Caspian', 'Sterling', 'Jasper', 'Onyx', 'Cipher', 'Vector'],
        female: ['Nova', 'Luna', 'Aurora', 'Vega', 'Lyra', 'Astra', 'Nyx', 'Echo', 'Jade', 'Raven'],
        neutral: ['Phoenix', 'River', 'Sage', 'Quinn', 'Blake', 'Morgan', 'Cipher', 'Zero', 'Pulse', 'Flux'],
      },
      surnames: ['Crossworlds', 'Multiverse', 'Dimensional', 'Timeshift', 'Warpgate', 'Hyperspace', 'Voidborn', 'Starscape'],
      nicknamePrefixes: ['Cross', 'Multi', 'Dimension', 'Time', 'Warp', 'Hyper', 'Void', 'Star'],
      nicknameSuffixes: ['worlds', 'verse', 'shift', 'gate', 'space', 'born', 'scape', 'drift'],
      meanings: ['traveler between dimensions', 'born in hyperspace', 'keeper of time anomalies', 'navigator of the multiverse', 'child of the void'],
    },
  },
  modern: {
    western: {
      firstNames: {
        male: ['James', 'Michael', 'William', 'David', 'Alexander', 'Benjamin', 'Lucas', 'Oliver', 'Ethan', 'Mason'],
        female: ['Emma', 'Olivia', 'Sophia', 'Isabella', 'Charlotte', 'Amelia', 'Harper', 'Evelyn', 'Abigail', 'Mia'],
        neutral: ['Jordan', 'Taylor', 'Morgan', 'Casey', 'Riley', 'Quinn', 'Avery', 'Blake', 'Cameron', 'Alex'],
      },
      surnames: ['Anderson', 'Mitchell', 'Campbell', 'Roberts', 'Thompson', 'Martinez', 'Garcia', 'Wilson'],
      nicknamePrefixes: ['Big', 'Little', 'Fast', 'Slim', 'Red', 'Blue', 'Lucky', 'Ace'],
      nicknameSuffixes: ['man', 'dog', 'cat', 'kid', 'boss', 'chief', 'star', 'king'],
      meanings: ['born leader', 'gifted with charm', 'natural athlete', 'quick thinker', 'loyal friend'],
    },
    eastern: {
      firstNames: {
        male: ['Hiroshi', 'Kenji', 'Takeshi', 'Yuki', 'Ryu', 'Kazuki', 'Daichi', 'Haruki', 'Ren', 'Sota'],
        female: ['Sakura', 'Yuki', 'Hana', 'Mei', 'Rin', 'Aoi', 'Mika', 'Saki', 'Aya', 'Nana'],
        neutral: ['Hikaru', 'Sora', 'Akira', 'Haru', 'Nao', 'Rio', 'Shin', 'Kai', 'Yuu', 'Ren'],
      },
      surnames: ['Tanaka', 'Yamamoto', 'Suzuki', 'Watanabe', 'Sato', 'Kim', 'Park', 'Chen'],
      nicknamePrefixes: ['Little', 'Big', 'Young', 'Old', 'Fast', 'Smart', 'Lucky', 'Cool'],
      nicknameSuffixes: ['kun', 'san', 'chan', 'sama', 'sensei', 'senpai', 'star', 'ace'],
      meanings: ['born with grace', 'gifted student', 'natural leader', 'kind heart', 'determined spirit'],
    },
    nordic: {
      firstNames: {
        male: ['Erik', 'Lars', 'Magnus', 'Sven', 'Oscar', 'Axel', 'Emil', 'Henrik', 'Jonas', 'Mikael'],
        female: ['Astrid', 'Ingrid', 'Freya', 'Liv', 'Saga', 'Eira', 'Maja', 'Elsa', 'Sigrid', 'Freja'],
        neutral: ['Storm', 'Robin', 'Kim', 'Noa', 'Love', 'Elliot', 'Charlie', 'Sam', 'Jamie', 'Frankie'],
      },
      surnames: ['Lindgren', 'Johansson', 'Eriksson', 'Larsson', 'Nilsson', 'Andersson', 'Olsson', 'Persson'],
      nicknamePrefixes: ['Ice', 'Snow', 'North', 'Cold', 'Frost', 'Winter', 'Storm', 'Stone'],
      nicknameSuffixes: ['man', 'woman', 'heart', 'soul', 'star', 'wolf', 'bear', 'eagle'],
      meanings: ['born with strength', 'keeper of traditions', 'natural explorer', 'resilient spirit', 'wise beyond years'],
    },
    african: {
      firstNames: {
        male: ['Kofi', 'Kwame', 'Jabari', 'Amari', 'Zaire', 'Khari', 'Sekou', 'Mosi', 'Dayo', 'Ade'],
        female: ['Amara', 'Zara', 'Nia', 'Kaya', 'Imani', 'Zola', 'Sade', 'Asha', 'Makena', 'Ayana'],
        neutral: ['Amari', 'Kaya', 'Ayo', 'Chidi', 'Dara', 'Femi', 'Jahi', 'Kito', 'Oba', 'Zola'],
      },
      surnames: ['Okonkwo', 'Mensah', 'Diallo', 'Osei', 'Afolabi', 'Kamara', 'Toure', 'Njoku'],
      nicknamePrefixes: ['Big', 'Little', 'Young', 'Old', 'Fast', 'Strong', 'Wise', 'Kind'],
      nicknameSuffixes: ['man', 'woman', 'star', 'king', 'queen', 'chief', 'lion', 'eagle'],
      meanings: ['born with purpose', 'blessed by ancestors', 'natural leader', 'strong spirit', 'keeper of wisdom'],
    },
    latin: {
      firstNames: {
        male: ['Carlos', 'Diego', 'Miguel', 'Alejandro', 'Rafael', 'Santiago', 'Emilio', 'Marco', 'Felix', 'Lucas'],
        female: ['Sofia', 'Isabella', 'Valentina', 'Camila', 'Luna', 'Elena', 'Lucia', 'Maria', 'Ana', 'Carmen'],
        neutral: ['Alex', 'Angel', 'Cruz', 'Rio', 'Sol', 'Mar', 'Eden', 'Jules', 'Reese', 'Morgan'],
      },
      surnames: ['Garcia', 'Rodriguez', 'Martinez', 'Lopez', 'Hernandez', 'Gonzalez', 'Sanchez', 'Ramirez'],
      nicknamePrefixes: ['El', 'La', 'Little', 'Big', 'Young', 'Old', 'Lucky', 'Golden'],
      nicknameSuffixes: ['ito', 'ita', 'star', 'king', 'queen', 'boss', 'ace', 'chief'],
      meanings: ['born with passion', 'gifted with charm', 'natural dancer', 'warm heart', 'loyal friend'],
    },
    arabic: {
      firstNames: {
        male: ['Mohammed', 'Ahmed', 'Ali', 'Omar', 'Yusuf', 'Khalid', 'Hassan', 'Ibrahim', 'Zain', 'Tariq'],
        female: ['Fatima', 'Aisha', 'Maryam', 'Zahra', 'Layla', 'Nadia', 'Sara', 'Amira', 'Yasmin', 'Leila'],
        neutral: ['Noor', 'Shams', 'Qamar', 'Rayan', 'Safi', 'Hayat', 'Sama', 'Amal', 'Ihsan', 'Farah'],
      },
      surnames: ['Al-Rashid', 'Hassan', 'Ibrahim', 'Mahmoud', 'Abdullah', 'Salem', 'Nasser', 'Khalil'],
      nicknamePrefixes: ['Abu', 'Ibn', 'Little', 'Big', 'Young', 'Old', 'Wise', 'Kind'],
      nicknameSuffixes: ['star', 'light', 'moon', 'sun', 'heart', 'soul', 'chief', 'king'],
      meanings: ['born with faith', 'blessed with wisdom', 'natural scholar', 'generous heart', 'keeper of traditions'],
    },
    mixed: {
      firstNames: {
        male: ['Jayden', 'Ethan', 'Noah', 'Liam', 'Mason', 'Lucas', 'Oliver', 'Aiden', 'Elijah', 'Logan'],
        female: ['Emma', 'Olivia', 'Ava', 'Sophia', 'Mia', 'Isabella', 'Charlotte', 'Amelia', 'Harper', 'Luna'],
        neutral: ['Jordan', 'Taylor', 'Morgan', 'Casey', 'Riley', 'Quinn', 'Avery', 'Blake', 'Cameron', 'Alex'],
      },
      surnames: ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Davis', 'Miller', 'Wilson'],
      nicknamePrefixes: ['Big', 'Little', 'Fast', 'Smart', 'Lucky', 'Cool', 'Wild', 'Smooth'],
      nicknameSuffixes: ['man', 'kid', 'star', 'boss', 'chief', 'ace', 'king', 'queen'],
      meanings: ['born to succeed', 'gifted with talent', 'natural leader', 'creative mind', 'kind soul'],
    },
  },
  historical: {
    western: {
      firstNames: {
        male: ['William', 'Henry', 'Richard', 'Edward', 'Charles', 'George', 'Arthur', 'Thomas', 'Frederick', 'Albert'],
        female: ['Elizabeth', 'Victoria', 'Catherine', 'Margaret', 'Eleanor', 'Beatrice', 'Adelaide', 'Henrietta', 'Josephine', 'Charlotte'],
        neutral: ['Francis', 'Cecil', 'Robin', 'Ashley', 'Beverly', 'Lindsay', 'Morgan', 'Sidney', 'Evelyn', 'Leslie'],
      },
      surnames: ['Blackwood', 'Fairfax', 'Ashworth', 'Pemberton', 'Whitmore', 'Rothschild', 'Montgomery', 'Sinclair'],
      nicknamePrefixes: ['Old', 'Young', 'Lord', 'Lady', 'Sir', 'Duke', 'Baron', 'Count'],
      nicknameSuffixes: ['heart', 'soul', 'sword', 'shield', 'crown', 'rose', 'lion', 'hawk'],
      meanings: ['born of noble blood', 'heir to ancient titles', 'keeper of family honor', 'defender of the realm', 'guardian of traditions'],
    },
    eastern: {
      firstNames: {
        male: ['Nobunaga', 'Ieyasu', 'Hideyoshi', 'Musashi', 'Kenshin', 'Shingen', 'Masamune', 'Yukimura', 'Hanzo', 'Goemon'],
        female: ['Tomoe', 'Hatsune', 'Okuni', 'Nene', 'Chacha', 'Oichi', 'Gracia', 'Chiyo', 'Kasuga', 'Ginchiyo'],
        neutral: ['Kotaro', 'Sasuke', 'Ranmaru', 'Tenzo', 'Rikyu', 'Basho', 'Sesshu', 'Hokusai', 'Hiroshige', 'Utamaro'],
      },
      surnames: ['Takeda', 'Uesugi', 'Tokugawa', 'Oda', 'Toyotomi', 'Date', 'Sanada', 'Shimazu'],
      nicknamePrefixes: ['Lord', 'Lady', 'Master', 'Sage', 'Shadow', 'Dragon', 'Tiger', 'Crane'],
      nicknameSuffixes: ['sama', 'dono', 'blade', 'fist', 'eye', 'wind', 'mountain', 'river'],
      meanings: ['born to rule', 'master of strategy', 'keeper of the way', 'defender of honor', 'guardian of the shogunate'],
    },
    nordic: {
      firstNames: {
        male: ['Ragnar', 'Bjorn', 'Ivar', 'Sigurd', 'Harald', 'Erik', 'Leif', 'Olaf', 'Rollo', 'Gunnar'],
        female: ['Lagertha', 'Aslaug', 'Siggy', 'Helga', 'Porunn', 'Judith', 'Gisla', 'Kwenthrith', 'Torvi', 'Freydis'],
        neutral: ['Floki', 'Athelstan', 'Rorik', 'Halfdan', 'Ubba', 'Hvitserk', 'Torstein', 'Erlendur', 'Kalf', 'Erlend'],
      },
      surnames: ['Lothbrok', 'Ironside', 'Boneless', 'Snake-in-the-Eye', 'Bloodaxe', 'Fairhair', 'Bluetooth', 'Forkbeard'],
      nicknamePrefixes: ['The', 'Iron', 'Blood', 'Storm', 'Sea', 'Frost', 'Wolf', 'Raven'],
      nicknameSuffixes: ['slayer', 'breaker', 'bane', 'born', 'sworn', 'walker', 'rider', 'singer'],
      meanings: ['favored by Odin', 'blessed by Thor', 'chosen of the gods', 'terror of the seas', 'conqueror of lands'],
    },
    african: {
      firstNames: {
        male: ['Shaka', 'Mansa', 'Sundiata', 'Askia', 'Cetshwayo', 'Moshoeshoe', 'Menelik', 'Haile', 'Tewodros', 'Mutesa'],
        female: ['Nzinga', 'Yaa', 'Amina', 'Nefertiti', 'Cleopatra', 'Makeda', 'Hatshepsut', 'Candace', 'Taytu', 'Moremi'],
        neutral: ['Imhotep', 'Khnum', 'Ptah', 'Thoth', 'Anubis', 'Horus', 'Osiris', 'Ra', 'Sekhmet', 'Bastet'],
      },
      surnames: ['Zulu', 'Keita', 'Toure', 'Askia', 'Solomonic', 'Meroitic', 'Kushite', 'Nubian'],
      nicknamePrefixes: ['Great', 'Mighty', 'Wise', 'Lion', 'Eagle', 'Sun', 'Moon', 'Star'],
      nicknameSuffixes: ['king', 'queen', 'chief', 'warrior', 'hunter', 'seer', 'keeper', 'builder'],
      meanings: ['born to unite', 'blessed by ancestors', 'keeper of kingdoms', 'defender of the people', 'builder of empires'],
    },
    latin: {
      firstNames: {
        male: ['Julius', 'Augustus', 'Marcus', 'Tiberius', 'Nero', 'Hadrian', 'Trajan', 'Constantine', 'Maximus', 'Lucius'],
        female: ['Livia', 'Agrippina', 'Julia', 'Octavia', 'Cornelia', 'Lucretia', 'Aurelia', 'Faustina', 'Helena', 'Theodora'],
        neutral: ['Cicero', 'Seneca', 'Virgil', 'Ovid', 'Horace', 'Pliny', 'Tacitus', 'Suetonius', 'Livy', 'Plutarch'],
      },
      surnames: ['Caesar', 'Aurelius', 'Brutus', 'Crassus', 'Pompey', 'Antonius', 'Scipio', 'Cato'],
      nicknamePrefixes: ['The', 'Great', 'Divine', 'Noble', 'Wise', 'Just', 'Brave', 'Pious'],
      nicknameSuffixes: ['Maximus', 'Magnus', 'Augustus', 'Felix', 'Victor', 'Pius', 'Invictus', 'Triumphator'],
      meanings: ['born to rule', 'favored by the gods', 'conqueror of nations', 'defender of Rome', 'builder of empires'],
    },
    arabic: {
      firstNames: {
        male: ['Saladin', 'Harun', 'Mamun', 'Rashid', 'Walid', 'Muawiya', 'Umar', 'Othman', 'Ali', 'Abbas'],
        female: ['Scheherazade', 'Fatima', 'Aisha', 'Khadija', 'Zainab', 'Maryam', 'Asma', 'Hafsa', 'Sawda', 'Safiyya'],
        neutral: ['Avicenna', 'Averroes', 'Al-Khwarizmi', 'Al-Razi', 'Ibn Sina', 'Ibn Rushd', 'Al-Farabi', 'Ibn Khaldun', 'Al-Biruni', 'Al-Jazari'],
      },
      surnames: ['Al-Rashid', 'Al-Mansur', 'Al-Mahdi', 'Al-Mutawakkil', 'Al-Nasir', 'Al-Zahir', 'Al-Mustansir', 'Al-Hakim'],
      nicknamePrefixes: ['The', 'Great', 'Wise', 'Just', 'Victorious', 'Defender', 'Guardian', 'Champion'],
      nicknameSuffixes: ['al-Din', 'al-Islam', 'al-Dawla', 'al-Mulk', 'al-Ummah', 'al-Haqq', 'al-Nur', 'al-Karim'],
      meanings: ['defender of the faith', 'champion of justice', 'keeper of wisdom', 'protector of the people', 'builder of civilizations'],
    },
    mixed: {
      firstNames: {
        male: ['Alexander', 'Genghis', 'Attila', 'Hannibal', 'Cyrus', 'Darius', 'Xerxes', 'Tamerlane', 'Charlemagne', 'Napoleon'],
        female: ['Cleopatra', 'Boudicca', 'Joan', 'Catherine', 'Elizabeth', 'Maria', 'Isabella', 'Victoria', 'Theodora', 'Wu'],
        neutral: ['Constantine', 'Justinian', 'Suleiman', 'Akbar', 'Kangxi', 'Meiji', 'Peter', 'Frederick', 'Louis', 'Philip'],
      },
      surnames: ['the Great', 'the Conqueror', 'the Terrible', 'the Wise', 'the Just', 'the Magnificent', 'the Bold', 'the Brave'],
      nicknamePrefixes: ['The', 'Great', 'Mighty', 'Terrible', 'Wise', 'Just', 'Bold', 'Brave'],
      nicknameSuffixes: ['Conqueror', 'Builder', 'Unifier', 'Reformer', 'Liberator', 'Defender', 'Champion', 'Master'],
      meanings: ['born to conquer', 'destined for greatness', 'shaper of history', 'founder of dynasties', 'legend among mortals'],
    },
  },
  mythological: {
    western: {
      firstNames: {
        male: ['Zeus', 'Apollo', 'Ares', 'Hermes', 'Hades', 'Poseidon', 'Dionysus', 'Hephaestus', 'Perseus', 'Hercules'],
        female: ['Athena', 'Artemis', 'Aphrodite', 'Hera', 'Demeter', 'Persephone', 'Hestia', 'Nike', 'Iris', 'Selene'],
        neutral: ['Phoenix', 'Griffin', 'Sphinx', 'Chimera', 'Pegasus', 'Hydra', 'Cerberus', 'Medusa', 'Oracle', 'Fate'],
      },
      surnames: ['Olympian', 'Titanborn', 'Godkissed', 'Divineblood', 'Heroborn', 'Mythweaver', 'Fatebound', 'Starborn'],
      nicknamePrefixes: ['Divine', 'Sacred', 'Eternal', 'Immortal', 'Blessed', 'Chosen', 'Golden', 'Silver'],
      nicknameSuffixes: ['born', 'touched', 'blessed', 'chosen', 'sworn', 'bound', 'marked', 'kissed'],
      meanings: ['child of the gods', 'blessed by Olympus', 'touched by divine light', 'heir to immortal power', 'keeper of sacred rites'],
    },
    eastern: {
      firstNames: {
        male: ['Raijin', 'Fujin', 'Susanoo', 'Tsukuyomi', 'Ryujin', 'Inari', 'Bishamon', 'Ebisu', 'Daikoku', 'Hotei'],
        female: ['Amaterasu', 'Izanami', 'Benzaiten', 'Kannon', 'Inari', 'Konohana', 'Uzume', 'Tamamo', 'Kaguya', 'Otohime'],
        neutral: ['Kirin', 'Tengu', 'Kitsune', 'Tanuki', 'Oni', 'Yokai', 'Kami', 'Shinigami', 'Naga', 'Garuda'],
      },
      surnames: ['Celestial', 'Divine', 'Sacred', 'Eternal', 'Heavenly', 'Immortal', 'Spiritborn', 'Godtouched'],
      nicknamePrefixes: ['Divine', 'Sacred', 'Eternal', 'Heavenly', 'Celestial', 'Spirit', 'Soul', 'Light'],
      nicknameSuffixes: ['born', 'touched', 'blessed', 'chosen', 'keeper', 'walker', 'dancer', 'singer'],
      meanings: ['child of heaven', 'blessed by the kami', 'touched by celestial light', 'keeper of divine secrets', 'bridge between worlds'],
    },
    nordic: {
      firstNames: {
        male: ['Odin', 'Thor', 'Loki', 'Freyr', 'Tyr', 'Baldur', 'Heimdall', 'Vidar', 'Vali', 'Bragi'],
        female: ['Frigg', 'Freya', 'Sif', 'Idun', 'Skadi', 'Hel', 'Sigyn', 'Nanna', 'Eir', 'Var'],
        neutral: ['Fenrir', 'Jormungandr', 'Sleipnir', 'Huginn', 'Muninn', 'Ratatoskr', 'Nidhogg', 'Garm', 'Fafnir', 'Surtr'],
      },
      surnames: ['Allfather', 'Thunderer', 'Trickster', 'Worldserpent', 'Doomwolf', 'Valkyrieborn', 'Asgardian', 'Vanir'],
      nicknamePrefixes: ['All', 'Thunder', 'Frost', 'Fire', 'World', 'Doom', 'Fate', 'Rune'],
      nicknameSuffixes: ['father', 'mother', 'born', 'touched', 'sworn', 'bound', 'walker', 'weaver'],
      meanings: ['favored by Odin', 'blessed by the Aesir', 'chosen of Valhalla', 'keeper of the runes', 'rider of Yggdrasil'],
    },
    african: {
      firstNames: {
        male: ['Anansi', 'Shango', 'Ogun', 'Obatala', 'Eshu', 'Orunmila', 'Osanyin', 'Aganju', 'Babalu', 'Oko'],
        female: ['Oshun', 'Yemoja', 'Oya', 'Nana', 'Yewa', 'Mami', 'Aje', 'Olokun', 'Ayao', 'Oba'],
        neutral: ['Elegua', 'Ibeji', 'Erinle', 'Oshumare', 'Ori', 'Egbe', 'Aje', 'Ashe', 'Odu', 'Ifa'],
      },
      surnames: ['Stormborn', 'Riverchild', 'Sunkeeper', 'Moonwalker', 'Spiritdancer', 'Ancestorblessed', 'Wisdomkeeper', 'Soulweaver'],
      nicknamePrefixes: ['Storm', 'River', 'Sun', 'Moon', 'Spirit', 'Ancestor', 'Wisdom', 'Soul'],
      nicknameSuffixes: ['born', 'child', 'keeper', 'walker', 'dancer', 'blessed', 'weaver', 'caller'],
      meanings: ['child of the orishas', 'blessed by ancestors', 'keeper of sacred wisdom', 'dancer with spirits', 'voice of the divine'],
    },
    latin: {
      firstNames: {
        male: ['Jupiter', 'Mars', 'Mercury', 'Neptune', 'Pluto', 'Apollo', 'Vulcan', 'Bacchus', 'Saturn', 'Janus'],
        female: ['Juno', 'Venus', 'Minerva', 'Diana', 'Ceres', 'Vesta', 'Aurora', 'Luna', 'Flora', 'Fortuna'],
        neutral: ['Cupid', 'Faunus', 'Silvanus', 'Terminus', 'Genius', 'Lares', 'Penates', 'Manes', 'Lemures', 'Larvae'],
      },
      surnames: ['Olympian', 'Celestial', 'Divine', 'Eternal', 'Sacred', 'Immortal', 'Godborn', 'Fatebound'],
      nicknamePrefixes: ['Divine', 'Sacred', 'Eternal', 'Immortal', 'Blessed', 'Chosen', 'Golden', 'Silver'],
      nicknameSuffixes: ['born', 'touched', 'blessed', 'chosen', 'sworn', 'bound', 'marked', 'favored'],
      meanings: ['child of the gods', 'blessed by Jupiter', 'favored by the fates', 'keeper of sacred flames', 'voice of the oracle'],
    },
    arabic: {
      firstNames: {
        male: ['Iblis', 'Jinn', 'Ifrit', 'Marid', 'Shaitan', 'Ghul', 'Qareen', 'Hinn', 'Nasnas', 'Sila'],
        female: ['Peri', 'Houri', 'Ghula', 'Qarinah', 'Silat', 'Umm', 'Aisha', 'Jinniya', 'Maridah', 'Ifritah'],
        neutral: ['Djinn', 'Spirit', 'Genie', 'Elemental', 'Guardian', 'Watcher', 'Seeker', 'Wanderer', 'Dreamer', 'Seer'],
      },
      surnames: ['Fireborn', 'Smokeless', 'Wishgranter', 'Lampbound', 'Desertspirit', 'Sandwalker', 'Stargazer', 'Moonchild'],
      nicknamePrefixes: ['Fire', 'Smoke', 'Wish', 'Lamp', 'Desert', 'Sand', 'Star', 'Moon'],
      nicknameSuffixes: ['born', 'bound', 'granter', 'walker', 'gazer', 'child', 'spirit', 'keeper'],
      meanings: ['born of smokeless fire', 'granter of wishes', 'keeper of ancient secrets', 'walker between worlds', 'guardian of hidden treasures'],
    },
    mixed: {
      firstNames: {
        male: ['Prometheus', 'Atlas', 'Kronos', 'Typhon', 'Hyperion', 'Helios', 'Morpheus', 'Thanatos', 'Eros', 'Pan'],
        female: ['Gaia', 'Rhea', 'Tethys', 'Theia', 'Mnemosyne', 'Themis', 'Phoebe', 'Dione', 'Hecate', 'Nemesis'],
        neutral: ['Chaos', 'Nyx', 'Erebus', 'Aether', 'Hemera', 'Tartarus', 'Pontus', 'Uranus', 'Eros', 'Phanes'],
      },
      surnames: ['Titanborn', 'Primordial', 'Cosmicchild', 'Voidwalker', 'Chaosborn', 'Eternalheart', 'Worldshaper', 'Fateweaver'],
      nicknamePrefixes: ['Titan', 'Primordial', 'Cosmic', 'Void', 'Chaos', 'Eternal', 'World', 'Fate'],
      nicknameSuffixes: ['born', 'child', 'walker', 'shaper', 'weaver', 'keeper', 'singer', 'dancer'],
      meanings: ['born before time', 'shaper of reality', 'keeper of cosmic secrets', 'walker of the void', 'weaver of fate itself'],
    },
  },
};

interface CharacterNameGeneratorToolProps {
  uiConfig?: UIConfig;
}

export const CharacterNameGeneratorTool: React.FC<CharacterNameGeneratorToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [isPrefilled, setIsPrefilled] = useState(false);

  const [genre, setGenre] = useState<Genre>('fantasy');
  const [gender, setGender] = useState<Gender>('neutral');

  // Handle prefill from uiConfig
  useEffect(() => {
    if (uiConfig?.prefillData && !isPrefilled) {
      const data = uiConfig.prefillData;
      if (data.genre && ['fantasy', 'scifi', 'modern', 'historical', 'mythological'].includes(data.genre as string)) {
        setGenre(data.genre as Genre);
      }
      if (data.gender && ['male', 'female', 'neutral'].includes(data.gender as string)) {
        setGender(data.gender as Gender);
      }
      if (data.origin && ['western', 'eastern', 'nordic', 'african', 'latin', 'arabic', 'mixed'].includes(data.origin as string)) {
        setOrigin(data.origin as Origin);
      }
      setIsPrefilled(true);
    }
  }, [uiConfig, isPrefilled]);
  const [origin, setOrigin] = useState<Origin>('mixed');
  const [includeNickname, setIncludeNickname] = useState(true);
  const [generatedName, setGeneratedName] = useState<NameData | null>(null);
  const [copied, setCopied] = useState(false);

  const genres: Record<Genre, { name: string; description: string }> = {
    fantasy: { name: 'Fantasy', description: 'Magical realms and epic adventures' },
    scifi: { name: 'Sci-Fi', description: 'Futuristic and space-age settings' },
    modern: { name: 'Modern', description: 'Contemporary real-world names' },
    historical: { name: 'Historical', description: 'Names from past eras and civilizations' },
    mythological: { name: 'Mythological', description: 'Gods, heroes, and legendary beings' },
  };

  const genders: Record<Gender, string> = {
    male: 'Male',
    female: 'Female',
    neutral: 'Neutral',
  };

  const origins: Record<Origin, string> = {
    western: 'Western',
    eastern: 'Eastern',
    nordic: 'Nordic',
    african: 'African',
    latin: 'Latin',
    arabic: 'Arabic',
    mixed: 'Mixed/Universal',
  };

  const generateName = () => {
    const database = nameDatabase[genre][origin];
    const firstNames = database.firstNames[gender];
    const surnames = database.surnames;
    const meanings = database.meanings;

    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const surname = surnames[Math.floor(Math.random() * surnames.length)];
    const meaning = meanings[Math.floor(Math.random() * meanings.length)];

    let nickname = '';
    if (includeNickname) {
      const prefix = database.nicknamePrefixes[Math.floor(Math.random() * database.nicknamePrefixes.length)];
      const suffix = database.nicknameSuffixes[Math.floor(Math.random() * database.nicknameSuffixes.length)];
      nickname = `${prefix}${suffix}`;
    }

    setGeneratedName({
      firstName,
      surname,
      nickname,
      meaning: `"${meaning}"`,
      origin: origins[origin],
    });
  };

  const copyToClipboard = () => {
    if (generatedName) {
      const fullName = `${generatedName.firstName} ${generatedName.surname}${generatedName.nickname ? ` (${generatedName.nickname})` : ''}`;
      navigator.clipboard.writeText(fullName);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className={`${isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-sm border overflow-hidden`}>
      <div className={`${isDark ? 'bg-gradient-to-r from-gray-800 to-purple-900/20' : 'bg-gradient-to-r from-white to-purple-50'} px-6 py-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-500/10 rounded-lg"><User className="w-5 h-5 text-purple-500" /></div>
          <div>
            <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.characterNameGenerator.characterNameGenerator', 'Character Name Generator')}</h3>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.characterNameGenerator.generateUniqueNamesForYour', 'Generate unique names for your characters')}</p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Genre Selection */}
        <div className="space-y-2">
          <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
            <Sparkles className="w-4 h-4 inline mr-1" />
            {t('tools.characterNameGenerator.genre', 'Genre')}
          </label>
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
            {(Object.keys(genres) as Genre[]).map((g) => (
              <button
                key={g}
                onClick={() => setGenre(g)}
                className={`py-2 px-3 rounded-lg text-sm ${genre === g ? 'bg-purple-500 text-white' : isDark ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'}`}
              >
                {genres[g].name}
              </button>
            ))}
          </div>
          <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{genres[genre].description}</p>
        </div>

        {/* Gender Selection */}
        <div className="space-y-2">
          <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
            {t('tools.characterNameGenerator.gender', 'Gender')}
          </label>
          <div className="flex gap-2">
            {(Object.keys(genders) as Gender[]).map((g) => (
              <button
                key={g}
                onClick={() => setGender(g)}
                className={`flex-1 py-2 rounded-lg ${gender === g ? 'bg-purple-500 text-white' : isDark ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'}`}
              >
                {genders[g]}
              </button>
            ))}
          </div>
        </div>

        {/* Origin Selection */}
        <div className="space-y-2">
          <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
            <Globe className="w-4 h-4 inline mr-1" />
            {t('tools.characterNameGenerator.originCulture', 'Origin / Culture')}
          </label>
          <div className="grid grid-cols-4 gap-2">
            {(Object.keys(origins) as Origin[]).map((o) => (
              <button
                key={o}
                onClick={() => setOrigin(o)}
                className={`py-2 px-3 rounded-lg text-sm ${origin === o ? 'bg-purple-500 text-white' : isDark ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'}`}
              >
                {origins[o]}
              </button>
            ))}
          </div>
        </div>

        {/* Nickname Toggle */}
        <div className="flex items-center justify-between">
          <label className={`text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
            {t('tools.characterNameGenerator.includeNickname', 'Include Nickname')}
          </label>
          <button
            onClick={() => setIncludeNickname(!includeNickname)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${includeNickname ? 'bg-purple-500' : isDark ? 'bg-gray-700' : 'bg-gray-300'}`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${includeNickname ? 'translate-x-6' : 'translate-x-1'}`}
            />
          </button>
        </div>

        {/* Generate Button */}
        <button
          onClick={generateName}
          className="w-full py-3 bg-purple-500 hover:bg-purple-600 text-white rounded-lg font-medium flex items-center justify-center gap-2 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          {t('tools.characterNameGenerator.generateName', 'Generate Name')}
        </button>

        {/* Generated Name Display */}
        {generatedName && (
          <div className={`p-4 rounded-lg ${isDark ? 'bg-purple-900/20 border-purple-800' : 'bg-purple-50 border-purple-200'} border`}>
            <div className="flex items-center justify-between mb-4">
              <h4 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.characterNameGenerator.generatedCharacter', 'Generated Character')}</h4>
              <button
                onClick={copyToClipboard}
                className={`p-2 rounded-lg ${isDark ? 'bg-gray-800 hover:bg-gray-700' : 'bg-white hover:bg-gray-100'} transition-colors`}
              >
                {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4 text-purple-500" />}
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <div className={`text-xs uppercase tracking-wide ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{t('tools.characterNameGenerator.fullName', 'Full Name')}</div>
                <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {generatedName.firstName} {generatedName.surname}
                </div>
              </div>

              {generatedName.nickname && (
                <div>
                  <div className={`text-xs uppercase tracking-wide ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{t('tools.characterNameGenerator.nickname', 'Nickname')}</div>
                  <div className={`text-lg font-medium text-purple-500`}>"{generatedName.nickname}"</div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className={`text-xs uppercase tracking-wide ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                    <BookOpen className="w-3 h-3 inline mr-1" />
                    {t('tools.characterNameGenerator.meaning', 'Meaning')}
                  </div>
                  <div className={`text-sm italic ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>{generatedName.meaning}</div>
                </div>
                <div>
                  <div className={`text-xs uppercase tracking-wide ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                    <Globe className="w-3 h-3 inline mr-1" />
                    {t('tools.characterNameGenerator.origin', 'Origin')}
                  </div>
                  <div className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>{generatedName.origin}</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tips */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
          <div className="flex items-start gap-2">
            <Info className={`w-4 h-4 mt-0.5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              <strong>{t('tools.characterNameGenerator.tips', 'Tips:')}</strong>
              <ul className="mt-1 space-y-1">
                <li>- Mix different origins for unique combinations</li>
                <li>- Use nicknames for memorable character titles</li>
                <li>- The meaning can inspire character backstories</li>
                <li>- Generate multiple names and pick your favorite</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CharacterNameGeneratorTool;
