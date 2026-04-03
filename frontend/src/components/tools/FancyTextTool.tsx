import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Copy, Check, Sparkles, RotateCcw, Type } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';

interface FancyTextToolProps {
  uiConfig?: UIConfig;
}

interface TextStyle {
  id: string;
  name: string;
  transform: (text: string) => string;
}

// Character mapping for various fancy text styles
const charMaps: Record<string, Record<string, string>> = {
  bold: {
    'a': '\u{1D41A}', 'b': '\u{1D41B}', 'c': '\u{1D41C}', 'd': '\u{1D41D}', 'e': '\u{1D41E}',
    'f': '\u{1D41F}', 'g': '\u{1D420}', 'h': '\u{1D421}', 'i': '\u{1D422}', 'j': '\u{1D423}',
    'k': '\u{1D424}', 'l': '\u{1D425}', 'm': '\u{1D426}', 'n': '\u{1D427}', 'o': '\u{1D428}',
    'p': '\u{1D429}', 'q': '\u{1D42A}', 'r': '\u{1D42B}', 's': '\u{1D42C}', 't': '\u{1D42D}',
    'u': '\u{1D42E}', 'v': '\u{1D42F}', 'w': '\u{1D430}', 'x': '\u{1D431}', 'y': '\u{1D432}', 'z': '\u{1D433}',
    'A': '\u{1D400}', 'B': '\u{1D401}', 'C': '\u{1D402}', 'D': '\u{1D403}', 'E': '\u{1D404}',
    'F': '\u{1D405}', 'G': '\u{1D406}', 'H': '\u{1D407}', 'I': '\u{1D408}', 'J': '\u{1D409}',
    'K': '\u{1D40A}', 'L': '\u{1D40B}', 'M': '\u{1D40C}', 'N': '\u{1D40D}', 'O': '\u{1D40E}',
    'P': '\u{1D40F}', 'Q': '\u{1D410}', 'R': '\u{1D411}', 'S': '\u{1D412}', 'T': '\u{1D413}',
    'U': '\u{1D414}', 'V': '\u{1D415}', 'W': '\u{1D416}', 'X': '\u{1D417}', 'Y': '\u{1D418}', 'Z': '\u{1D419}',
    '0': '\u{1D7CE}', '1': '\u{1D7CF}', '2': '\u{1D7D0}', '3': '\u{1D7D1}', '4': '\u{1D7D2}',
    '5': '\u{1D7D3}', '6': '\u{1D7D4}', '7': '\u{1D7D5}', '8': '\u{1D7D6}', '9': '\u{1D7D7}',
  },
  italic: {
    'a': '\u{1D44E}', 'b': '\u{1D44F}', 'c': '\u{1D450}', 'd': '\u{1D451}', 'e': '\u{1D452}',
    'f': '\u{1D453}', 'g': '\u{1D454}', 'h': '\u{210E}', 'i': '\u{1D456}', 'j': '\u{1D457}',
    'k': '\u{1D458}', 'l': '\u{1D459}', 'm': '\u{1D45A}', 'n': '\u{1D45B}', 'o': '\u{1D45C}',
    'p': '\u{1D45D}', 'q': '\u{1D45E}', 'r': '\u{1D45F}', 's': '\u{1D460}', 't': '\u{1D461}',
    'u': '\u{1D462}', 'v': '\u{1D463}', 'w': '\u{1D464}', 'x': '\u{1D465}', 'y': '\u{1D466}', 'z': '\u{1D467}',
    'A': '\u{1D434}', 'B': '\u{1D435}', 'C': '\u{1D436}', 'D': '\u{1D437}', 'E': '\u{1D438}',
    'F': '\u{1D439}', 'G': '\u{1D43A}', 'H': '\u{1D43B}', 'I': '\u{1D43C}', 'J': '\u{1D43D}',
    'K': '\u{1D43E}', 'L': '\u{1D43F}', 'M': '\u{1D440}', 'N': '\u{1D441}', 'O': '\u{1D442}',
    'P': '\u{1D443}', 'Q': '\u{1D444}', 'R': '\u{1D445}', 'S': '\u{1D446}', 'T': '\u{1D447}',
    'U': '\u{1D448}', 'V': '\u{1D449}', 'W': '\u{1D44A}', 'X': '\u{1D44B}', 'Y': '\u{1D44C}', 'Z': '\u{1D44D}',
  },
  boldItalic: {
    'a': '\u{1D482}', 'b': '\u{1D483}', 'c': '\u{1D484}', 'd': '\u{1D485}', 'e': '\u{1D486}',
    'f': '\u{1D487}', 'g': '\u{1D488}', 'h': '\u{1D489}', 'i': '\u{1D48A}', 'j': '\u{1D48B}',
    'k': '\u{1D48C}', 'l': '\u{1D48D}', 'm': '\u{1D48E}', 'n': '\u{1D48F}', 'o': '\u{1D490}',
    'p': '\u{1D491}', 'q': '\u{1D492}', 'r': '\u{1D493}', 's': '\u{1D494}', 't': '\u{1D495}',
    'u': '\u{1D496}', 'v': '\u{1D497}', 'w': '\u{1D498}', 'x': '\u{1D499}', 'y': '\u{1D49A}', 'z': '\u{1D49B}',
    'A': '\u{1D468}', 'B': '\u{1D469}', 'C': '\u{1D46A}', 'D': '\u{1D46B}', 'E': '\u{1D46C}',
    'F': '\u{1D46D}', 'G': '\u{1D46E}', 'H': '\u{1D46F}', 'I': '\u{1D470}', 'J': '\u{1D471}',
    'K': '\u{1D472}', 'L': '\u{1D473}', 'M': '\u{1D474}', 'N': '\u{1D475}', 'O': '\u{1D476}',
    'P': '\u{1D477}', 'Q': '\u{1D478}', 'R': '\u{1D479}', 'S': '\u{1D47A}', 'T': '\u{1D47B}',
    'U': '\u{1D47C}', 'V': '\u{1D47D}', 'W': '\u{1D47E}', 'X': '\u{1D47F}', 'Y': '\u{1D480}', 'Z': '\u{1D481}',
  },
  script: {
    'a': '\u{1D4EA}', 'b': '\u{1D4EB}', 'c': '\u{1D4EC}', 'd': '\u{1D4ED}', 'e': '\u{1D4EE}',
    'f': '\u{1D4EF}', 'g': '\u{1D4F0}', 'h': '\u{1D4F1}', 'i': '\u{1D4F2}', 'j': '\u{1D4F3}',
    'k': '\u{1D4F4}', 'l': '\u{1D4F5}', 'm': '\u{1D4F6}', 'n': '\u{1D4F7}', 'o': '\u{1D4F8}',
    'p': '\u{1D4F9}', 'q': '\u{1D4FA}', 'r': '\u{1D4FB}', 's': '\u{1D4FC}', 't': '\u{1D4FD}',
    'u': '\u{1D4FE}', 'v': '\u{1D4FF}', 'w': '\u{1D500}', 'x': '\u{1D501}', 'y': '\u{1D502}', 'z': '\u{1D503}',
    'A': '\u{1D4D0}', 'B': '\u{1D4D1}', 'C': '\u{1D4D2}', 'D': '\u{1D4D3}', 'E': '\u{1D4D4}',
    'F': '\u{1D4D5}', 'G': '\u{1D4D6}', 'H': '\u{1D4D7}', 'I': '\u{1D4D8}', 'J': '\u{1D4D9}',
    'K': '\u{1D4DA}', 'L': '\u{1D4DB}', 'M': '\u{1D4DC}', 'N': '\u{1D4DD}', 'O': '\u{1D4DE}',
    'P': '\u{1D4DF}', 'Q': '\u{1D4E0}', 'R': '\u{1D4E1}', 'S': '\u{1D4E2}', 'T': '\u{1D4E3}',
    'U': '\u{1D4E4}', 'V': '\u{1D4E5}', 'W': '\u{1D4E6}', 'X': '\u{1D4E7}', 'Y': '\u{1D4E8}', 'Z': '\u{1D4E9}',
  },
  fraktur: {
    'a': '\u{1D51E}', 'b': '\u{1D51F}', 'c': '\u{1D520}', 'd': '\u{1D521}', 'e': '\u{1D522}',
    'f': '\u{1D523}', 'g': '\u{1D524}', 'h': '\u{1D525}', 'i': '\u{1D526}', 'j': '\u{1D527}',
    'k': '\u{1D528}', 'l': '\u{1D529}', 'm': '\u{1D52A}', 'n': '\u{1D52B}', 'o': '\u{1D52C}',
    'p': '\u{1D52D}', 'q': '\u{1D52E}', 'r': '\u{1D52F}', 's': '\u{1D530}', 't': '\u{1D531}',
    'u': '\u{1D532}', 'v': '\u{1D533}', 'w': '\u{1D534}', 'x': '\u{1D535}', 'y': '\u{1D536}', 'z': '\u{1D537}',
    'A': '\u{1D504}', 'B': '\u{1D505}', 'C': '\u{212D}', 'D': '\u{1D507}', 'E': '\u{1D508}',
    'F': '\u{1D509}', 'G': '\u{1D50A}', 'H': '\u{210C}', 'I': '\u{2111}', 'J': '\u{1D50D}',
    'K': '\u{1D50E}', 'L': '\u{1D50F}', 'M': '\u{1D510}', 'N': '\u{1D511}', 'O': '\u{1D512}',
    'P': '\u{1D513}', 'Q': '\u{1D514}', 'R': '\u{211C}', 'S': '\u{1D516}', 'T': '\u{1D517}',
    'U': '\u{1D518}', 'V': '\u{1D519}', 'W': '\u{1D51A}', 'X': '\u{1D51B}', 'Y': '\u{1D51C}', 'Z': '\u{2128}',
  },
  doubleStruck: {
    'a': '\u{1D552}', 'b': '\u{1D553}', 'c': '\u{1D554}', 'd': '\u{1D555}', 'e': '\u{1D556}',
    'f': '\u{1D557}', 'g': '\u{1D558}', 'h': '\u{1D559}', 'i': '\u{1D55A}', 'j': '\u{1D55B}',
    'k': '\u{1D55C}', 'l': '\u{1D55D}', 'm': '\u{1D55E}', 'n': '\u{1D55F}', 'o': '\u{1D560}',
    'p': '\u{1D561}', 'q': '\u{1D562}', 'r': '\u{1D563}', 's': '\u{1D564}', 't': '\u{1D565}',
    'u': '\u{1D566}', 'v': '\u{1D567}', 'w': '\u{1D568}', 'x': '\u{1D569}', 'y': '\u{1D56A}', 'z': '\u{1D56B}',
    'A': '\u{1D538}', 'B': '\u{1D539}', 'C': '\u{2102}', 'D': '\u{1D53B}', 'E': '\u{1D53C}',
    'F': '\u{1D53D}', 'G': '\u{1D53E}', 'H': '\u{210D}', 'I': '\u{1D540}', 'J': '\u{1D541}',
    'K': '\u{1D542}', 'L': '\u{1D543}', 'M': '\u{1D544}', 'N': '\u{2115}', 'O': '\u{1D546}',
    'P': '\u{2119}', 'Q': '\u{211A}', 'R': '\u{211D}', 'S': '\u{1D54A}', 'T': '\u{1D54B}',
    'U': '\u{1D54C}', 'V': '\u{1D54D}', 'W': '\u{1D54E}', 'X': '\u{1D54F}', 'Y': '\u{1D550}', 'Z': '\u{2124}',
    '0': '\u{1D7D8}', '1': '\u{1D7D9}', '2': '\u{1D7DA}', '3': '\u{1D7DB}', '4': '\u{1D7DC}',
    '5': '\u{1D7DD}', '6': '\u{1D7DE}', '7': '\u{1D7DF}', '8': '\u{1D7E0}', '9': '\u{1D7E1}',
  },
  monospace: {
    'a': '\u{1D68A}', 'b': '\u{1D68B}', 'c': '\u{1D68C}', 'd': '\u{1D68D}', 'e': '\u{1D68E}',
    'f': '\u{1D68F}', 'g': '\u{1D690}', 'h': '\u{1D691}', 'i': '\u{1D692}', 'j': '\u{1D693}',
    'k': '\u{1D694}', 'l': '\u{1D695}', 'm': '\u{1D696}', 'n': '\u{1D697}', 'o': '\u{1D698}',
    'p': '\u{1D699}', 'q': '\u{1D69A}', 'r': '\u{1D69B}', 's': '\u{1D69C}', 't': '\u{1D69D}',
    'u': '\u{1D69E}', 'v': '\u{1D69F}', 'w': '\u{1D6A0}', 'x': '\u{1D6A1}', 'y': '\u{1D6A2}', 'z': '\u{1D6A3}',
    'A': '\u{1D670}', 'B': '\u{1D671}', 'C': '\u{1D672}', 'D': '\u{1D673}', 'E': '\u{1D674}',
    'F': '\u{1D675}', 'G': '\u{1D676}', 'H': '\u{1D677}', 'I': '\u{1D678}', 'J': '\u{1D679}',
    'K': '\u{1D67A}', 'L': '\u{1D67B}', 'M': '\u{1D67C}', 'N': '\u{1D67D}', 'O': '\u{1D67E}',
    'P': '\u{1D67F}', 'Q': '\u{1D680}', 'R': '\u{1D681}', 'S': '\u{1D682}', 'T': '\u{1D683}',
    'U': '\u{1D684}', 'V': '\u{1D685}', 'W': '\u{1D686}', 'X': '\u{1D687}', 'Y': '\u{1D688}', 'Z': '\u{1D689}',
    '0': '\u{1D7F6}', '1': '\u{1D7F7}', '2': '\u{1D7F8}', '3': '\u{1D7F9}', '4': '\u{1D7FA}',
    '5': '\u{1D7FB}', '6': '\u{1D7FC}', '7': '\u{1D7FD}', '8': '\u{1D7FE}', '9': '\u{1D7FF}',
  },
  circled: {
    'a': '\u{24D0}', 'b': '\u{24D1}', 'c': '\u{24D2}', 'd': '\u{24D3}', 'e': '\u{24D4}',
    'f': '\u{24D5}', 'g': '\u{24D6}', 'h': '\u{24D7}', 'i': '\u{24D8}', 'j': '\u{24D9}',
    'k': '\u{24DA}', 'l': '\u{24DB}', 'm': '\u{24DC}', 'n': '\u{24DD}', 'o': '\u{24DE}',
    'p': '\u{24DF}', 'q': '\u{24E0}', 'r': '\u{24E1}', 's': '\u{24E2}', 't': '\u{24E3}',
    'u': '\u{24E4}', 'v': '\u{24E5}', 'w': '\u{24E6}', 'x': '\u{24E7}', 'y': '\u{24E8}', 'z': '\u{24E9}',
    'A': '\u{24B6}', 'B': '\u{24B7}', 'C': '\u{24B8}', 'D': '\u{24B9}', 'E': '\u{24BA}',
    'F': '\u{24BB}', 'G': '\u{24BC}', 'H': '\u{24BD}', 'I': '\u{24BE}', 'J': '\u{24BF}',
    'K': '\u{24C0}', 'L': '\u{24C1}', 'M': '\u{24C2}', 'N': '\u{24C3}', 'O': '\u{24C4}',
    'P': '\u{24C5}', 'Q': '\u{24C6}', 'R': '\u{24C7}', 'S': '\u{24C8}', 'T': '\u{24C9}',
    'U': '\u{24CA}', 'V': '\u{24CB}', 'W': '\u{24CC}', 'X': '\u{24CD}', 'Y': '\u{24CE}', 'Z': '\u{24CF}',
    '0': '\u{24EA}', '1': '\u{2460}', '2': '\u{2461}', '3': '\u{2462}', '4': '\u{2463}',
    '5': '\u{2464}', '6': '\u{2465}', '7': '\u{2466}', '8': '\u{2467}', '9': '\u{2468}',
  },
  squared: {
    'A': '\u{1F130}', 'B': '\u{1F131}', 'C': '\u{1F132}', 'D': '\u{1F133}', 'E': '\u{1F134}',
    'F': '\u{1F135}', 'G': '\u{1F136}', 'H': '\u{1F137}', 'I': '\u{1F138}', 'J': '\u{1F139}',
    'K': '\u{1F13A}', 'L': '\u{1F13B}', 'M': '\u{1F13C}', 'N': '\u{1F13D}', 'O': '\u{1F13E}',
    'P': '\u{1F13F}', 'Q': '\u{1F140}', 'R': '\u{1F141}', 'S': '\u{1F142}', 'T': '\u{1F143}',
    'U': '\u{1F144}', 'V': '\u{1F145}', 'W': '\u{1F146}', 'X': '\u{1F147}', 'Y': '\u{1F148}', 'Z': '\u{1F149}',
  },
  fullwidth: {
    'a': '\u{FF41}', 'b': '\u{FF42}', 'c': '\u{FF43}', 'd': '\u{FF44}', 'e': '\u{FF45}',
    'f': '\u{FF46}', 'g': '\u{FF47}', 'h': '\u{FF48}', 'i': '\u{FF49}', 'j': '\u{FF4A}',
    'k': '\u{FF4B}', 'l': '\u{FF4C}', 'm': '\u{FF4D}', 'n': '\u{FF4E}', 'o': '\u{FF4F}',
    'p': '\u{FF50}', 'q': '\u{FF51}', 'r': '\u{FF52}', 's': '\u{FF53}', 't': '\u{FF54}',
    'u': '\u{FF55}', 'v': '\u{FF56}', 'w': '\u{FF57}', 'x': '\u{FF58}', 'y': '\u{FF59}', 'z': '\u{FF5A}',
    'A': '\u{FF21}', 'B': '\u{FF22}', 'C': '\u{FF23}', 'D': '\u{FF24}', 'E': '\u{FF25}',
    'F': '\u{FF26}', 'G': '\u{FF27}', 'H': '\u{FF28}', 'I': '\u{FF29}', 'J': '\u{FF2A}',
    'K': '\u{FF2B}', 'L': '\u{FF2C}', 'M': '\u{FF2D}', 'N': '\u{FF2E}', 'O': '\u{FF2F}',
    'P': '\u{FF30}', 'Q': '\u{FF31}', 'R': '\u{FF32}', 'S': '\u{FF33}', 'T': '\u{FF34}',
    'U': '\u{FF35}', 'V': '\u{FF36}', 'W': '\u{FF37}', 'X': '\u{FF38}', 'Y': '\u{FF39}', 'Z': '\u{FF3A}',
    '0': '\u{FF10}', '1': '\u{FF11}', '2': '\u{FF12}', '3': '\u{FF13}', '4': '\u{FF14}',
    '5': '\u{FF15}', '6': '\u{FF16}', '7': '\u{FF17}', '8': '\u{FF18}', '9': '\u{FF19}',
    ' ': '\u{3000}',
  },
};

const transformWithMap = (text: string, mapName: string): string => {
  const map = charMaps[mapName];
  if (!map) return text;
  return text.split('').map(char => map[char] || char).join('');
};

const textStyles: TextStyle[] = [
  { id: 'bold', name: 'Bold', transform: (t) => transformWithMap(t, 'bold') },
  { id: 'italic', name: 'Italic', transform: (t) => transformWithMap(t, 'italic') },
  { id: 'boldItalic', name: 'Bold Italic', transform: (t) => transformWithMap(t, 'boldItalic') },
  { id: 'script', name: 'Script', transform: (t) => transformWithMap(t, 'script') },
  { id: 'fraktur', name: 'Fraktur', transform: (t) => transformWithMap(t, 'fraktur') },
  { id: 'doubleStruck', name: 'Double-Struck', transform: (t) => transformWithMap(t, 'doubleStruck') },
  { id: 'monospace', name: 'Monospace', transform: (t) => transformWithMap(t, 'monospace') },
  { id: 'circled', name: 'Circled', transform: (t) => transformWithMap(t, 'circled') },
  { id: 'squared', name: 'Squared', transform: (t) => transformWithMap(t.toUpperCase(), 'squared') },
  { id: 'fullwidth', name: 'Fullwidth', transform: (t) => transformWithMap(t, 'fullwidth') },
  { id: 'upsideDown', name: 'Upside Down', transform: (t) => {
    const flipMap: Record<string, string> = {
      'a': '\u0250', 'b': 'q', 'c': '\u0254', 'd': 'p', 'e': '\u01DD', 'f': '\u025F',
      'g': '\u0183', 'h': '\u0265', 'i': '\u0131', 'j': '\u027E', 'k': '\u029E', 'l': 'l',
      'm': '\u026F', 'n': 'u', 'o': 'o', 'p': 'd', 'q': 'b', 'r': '\u0279', 's': 's',
      't': '\u0287', 'u': 'n', 'v': '\u028C', 'w': '\u028D', 'x': 'x', 'y': '\u028E', 'z': 'z',
      'A': '\u2200', 'B': '\u15FA', 'C': '\u0186', 'D': '\u15E1', 'E': '\u018E', 'F': '\u2132',
      'G': '\u2141', 'H': 'H', 'I': 'I', 'J': '\u017F', 'K': '\u22CA', 'L': '\u2142',
      'M': 'W', 'N': 'N', 'O': 'O', 'P': '\u0500', 'Q': '\u038C', 'R': '\u1D1A',
      'S': 'S', 'T': '\u22A5', 'U': '\u2229', 'V': '\u039B', 'W': 'M', 'X': 'X',
      'Y': '\u2144', 'Z': 'Z',
      '1': '\u0196', '2': '\u1105', '3': '\u0190', '4': '\u3123', '5': '\u03DB',
      '6': '9', '7': '\u3125', '8': '8', '9': '6', '0': '0',
      '.': '\u02D9', ',': "'", "'": ',', '"': '\u201E', '!': '\u00A1', '?': '\u00BF',
      '(': ')', ')': '(', '[': ']', ']': '[', '{': '}', '}': '{', '<': '>', '>': '<',
      '_': '\u203E', '&': '\u214B', ' ': ' ',
    };
    return t.split('').reverse().map(char => flipMap[char] || char).join('');
  }},
  { id: 'strikethrough', name: 'Strikethrough', transform: (t) => t.split('').map(c => c + '\u0336').join('') },
  { id: 'underline', name: 'Underline', transform: (t) => t.split('').map(c => c + '\u0332').join('') },
  { id: 'smallCaps', name: 'Small Caps', transform: (t) => {
    const smallCaps: Record<string, string> = {
      'a': '\u1D00', 'b': '\u0299', 'c': '\u1D04', 'd': '\u1D05', 'e': '\u1D07',
      'f': '\u0493', 'g': '\u0262', 'h': '\u029C', 'i': '\u026A', 'j': '\u1D0A',
      'k': '\u1D0B', 'l': '\u029F', 'm': '\u1D0D', 'n': '\u0274', 'o': '\u1D0F',
      'p': '\u1D18', 'q': 'Q', 'r': '\u0280', 's': '\u0455', 't': '\u1D1B',
      'u': '\u1D1C', 'v': '\u1D20', 'w': '\u1D21', 'x': 'x', 'y': '\u028F', 'z': '\u1D22',
    };
    return t.split('').map(char => {
      const lower = char.toLowerCase();
      return smallCaps[lower] || char.toUpperCase();
    }).join('');
  }},
  { id: 'superscript', name: 'Superscript', transform: (t) => {
    const superMap: Record<string, string> = {
      'a': '\u1D43', 'b': '\u1D47', 'c': '\u1D9C', 'd': '\u1D48', 'e': '\u1D49',
      'f': '\u1DA0', 'g': '\u1D4D', 'h': '\u02B0', 'i': '\u2071', 'j': '\u02B2',
      'k': '\u1D4F', 'l': '\u02E1', 'm': '\u1D50', 'n': '\u207F', 'o': '\u1D52',
      'p': '\u1D56', 'r': '\u02B3', 's': '\u02E2', 't': '\u1D57', 'u': '\u1D58',
      'v': '\u1D5B', 'w': '\u02B7', 'x': '\u02E3', 'y': '\u02B8', 'z': '\u1DBB',
      '0': '\u2070', '1': '\u00B9', '2': '\u00B2', '3': '\u00B3', '4': '\u2074',
      '5': '\u2075', '6': '\u2076', '7': '\u2077', '8': '\u2078', '9': '\u2079',
      '+': '\u207A', '-': '\u207B', '=': '\u207C', '(': '\u207D', ')': '\u207E',
    };
    return t.toLowerCase().split('').map(char => superMap[char] || char).join('');
  }},
  { id: 'subscript', name: 'Subscript', transform: (t) => {
    const subMap: Record<string, string> = {
      'a': '\u2090', 'e': '\u2091', 'h': '\u2095', 'i': '\u1D62', 'j': '\u2C7C',
      'k': '\u2096', 'l': '\u2097', 'm': '\u2098', 'n': '\u2099', 'o': '\u2092',
      'p': '\u209A', 'r': '\u1D63', 's': '\u209B', 't': '\u209C', 'u': '\u1D64',
      'v': '\u1D65', 'x': '\u2093',
      '0': '\u2080', '1': '\u2081', '2': '\u2082', '3': '\u2083', '4': '\u2084',
      '5': '\u2085', '6': '\u2086', '7': '\u2087', '8': '\u2088', '9': '\u2089',
      '+': '\u208A', '-': '\u208B', '=': '\u208C', '(': '\u208D', ')': '\u208E',
    };
    return t.toLowerCase().split('').map(char => subMap[char] || char).join('');
  }},
];

export const FancyTextTool = ({ uiConfig }: FancyTextToolProps) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const [input, setInput] = useState('');
  const [isPrefilled, setIsPrefilled] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Apply prefill data from uiConfig.params when component mounts
  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as ToolPrefillData;
      const textContent = params.text || params.content || params.sourceText || '';
      if (textContent) {
        setInput(textContent);
        setIsPrefilled(true);
      }
    }
  }, [uiConfig?.params]);

  const handleCopy = async (id: string, text: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleClear = () => {
    setInput('');
    setIsPrefilled(false);
  };

  return (
    <div className={`max-w-4xl mx-auto p-6 rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
      <h2 className={`text-2xl font-bold mb-6 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
        {t('tools.fancyText.fancyTextGenerator', 'Fancy Text Generator')}
      </h2>

      <div className="space-y-6">
        {/* Prefill Indicator */}
        {isPrefilled && (
          <div className="flex items-center gap-2 px-4 py-2 bg-[#0D9488]/10 rounded-xl border border-[#0D9488]/20">
            <Sparkles className="w-4 h-4 text-[#0D9488]" />
            <span className="text-sm text-[#0D9488] font-medium">{t('tools.fancyText.contentLoadedFromAiResponse', 'Content loaded from AI response')}</span>
          </div>
        )}

        {/* Input */}
        <div>
          <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
            {t('tools.fancyText.enterYourText', 'Enter Your Text')}
          </label>
          <div className="flex gap-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={t('tools.fancyText.typeSomethingToSeeFancy', 'Type something to see fancy text styles...')}
              className={`flex-1 px-4 py-3 rounded-lg border ${
                theme === 'dark'
                  ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                  : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-500'
              } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
            />
            <button
              onClick={handleClear}
              className={`px-4 py-3 rounded-lg transition-colors ${
                theme === 'dark'
                  ? 'bg-gray-700 hover:bg-gray-600 text-gray-200'
                  : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
              }`}
            >
              <RotateCcw className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Style Outputs */}
        {input && (
          <div className="space-y-3">
            <h3 className={`text-sm font-semibold ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
              {t('tools.fancyText.clickAnyStyleToCopy', 'Click any style to copy')}
            </h3>
            <div className="grid gap-3">
              {textStyles.map((style) => {
                const transformed = style.transform(input);
                const isCopied = copiedId === style.id;

                return (
                  <button
                    key={style.id}
                    onClick={() => handleCopy(style.id, transformed)}
                    className={`flex items-start justify-between p-4 rounded-lg border text-left transition-all overflow-hidden ${
                      isCopied
                        ? 'border-green-500 bg-green-500/10'
                        : theme === 'dark'
                        ? t('tools.fancyText.borderGray600HoverBorder', 'border-gray-600 hover:border-[#0D9488] bg-gray-700 hover:bg-gray-700/50') : t('tools.fancyText.borderGray200HoverBorder', 'border-gray-200 hover:border-[#0D9488] bg-gray-50 hover:bg-white')
                    }`}
                  >
                    <div className="flex-1 min-w-0 overflow-hidden">
                      <div className={`text-xs font-medium mb-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                        {style.name}
                      </div>
                      <div className={`text-lg break-words whitespace-pre-wrap ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        {transformed}
                      </div>
                    </div>
                    <div className="flex-shrink-0 ml-4 mt-1">
                      {isCopied ? (
                        <div className="flex items-center gap-1 text-green-500">
                          <Check className="w-5 h-5" />
                          <span className="text-sm">{t('tools.fancyText.copied', 'Copied!')}</span>
                        </div>
                      ) : (
                        <Copy className={`w-5 h-5 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {!input && (
          <div className={`text-center py-12 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
            <Type className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>{t('tools.fancyText.enterTextAboveToSee', 'Enter text above to see all fancy styles')}</p>
          </div>
        )}

        {/* Info Section */}
        <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
          <h3 className={`text-sm font-semibold mb-2 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
            {t('tools.fancyText.aboutFancyText', 'About Fancy Text')}
          </h3>
          <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
            These fancy text styles use special Unicode characters that look like stylized letters. They work in most
            places that support Unicode, including social media bios, messages, comments, and usernames. Note that
            some characters may not display correctly on all devices or platforms.
          </p>
        </div>
      </div>
    </div>
  );
};
