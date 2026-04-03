import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Copy, Check, Shuffle, Search, Sparkles, RefreshCw } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';

interface AnagramSolverToolProps {
  uiConfig?: UIConfig;
}

// Common English words for anagram matching
const wordList = [
  // 2-letter
  'an', 'at', 'be', 'by', 'do', 'go', 'he', 'if', 'in', 'is', 'it', 'me', 'my', 'no', 'of', 'on', 'or', 'so', 'to', 'up', 'us', 'we',
  // 3-letter
  'ace', 'act', 'add', 'age', 'ago', 'aid', 'aim', 'air', 'all', 'and', 'ant', 'any', 'ape', 'arc', 'are', 'ark', 'arm', 'art', 'ash', 'ask', 'ate', 'bad', 'bag', 'ban', 'bar', 'bat', 'bay', 'bed', 'bee', 'bet', 'big', 'bin', 'bit', 'bow', 'box', 'boy', 'bud', 'bug', 'bus', 'but', 'buy', 'cab', 'can', 'cap', 'car', 'cat', 'cop', 'cow', 'cry', 'cub', 'cup', 'cut', 'dad', 'dam', 'day', 'den', 'dew', 'did', 'die', 'dig', 'dim', 'dip', 'dog', 'dot', 'dry', 'dub', 'dud', 'due', 'dug', 'dye', 'ear', 'eat', 'egg', 'ego', 'elf', 'elk', 'elm', 'end', 'era', 'eve', 'eye', 'fad', 'fan', 'far', 'fat', 'fax', 'fed', 'fee', 'few', 'fig', 'fin', 'fir', 'fit', 'fix', 'flu', 'fly', 'foe', 'fog', 'for', 'fox', 'fry', 'fun', 'fur', 'gag', 'gap', 'gas', 'gel', 'gem', 'get', 'gin', 'god', 'got', 'gum', 'gun', 'gut', 'guy', 'gym', 'had', 'ham', 'has', 'hat', 'hay', 'hen', 'her', 'hid', 'him', 'hip', 'his', 'hit', 'hog', 'hop', 'hot', 'how', 'hub', 'hue', 'hug', 'hum', 'hut', 'ice', 'icy', 'ill', 'imp', 'ink', 'inn', 'ion', 'its', 'ivy', 'jam', 'jar', 'jaw', 'jay', 'jet', 'jig', 'job', 'jog', 'jot', 'joy', 'jug', 'keg', 'key', 'kid', 'kin', 'kit', 'lab', 'lad', 'lag', 'lap', 'law', 'lay', 'led', 'leg', 'let', 'lid', 'lie', 'lip', 'lit', 'log', 'lot', 'low', 'lug', 'mad', 'man', 'map', 'mat', 'may', 'men', 'met', 'mid', 'mix', 'mob', 'mom', 'mop', 'mud', 'mug', 'nab', 'nag', 'nap', 'net', 'new', 'nil', 'nip', 'nod', 'nor', 'not', 'now', 'nun', 'nut', 'oak', 'oar', 'oat', 'odd', 'ode', 'off', 'oil', 'old', 'one', 'opt', 'orb', 'ore', 'our', 'out', 'owe', 'owl', 'own', 'pad', 'pal', 'pan', 'par', 'pat', 'paw', 'pay', 'pea', 'peg', 'pen', 'pep', 'per', 'pet', 'pie', 'pig', 'pin', 'pit', 'ply', 'pod', 'pop', 'pot', 'pro', 'pry', 'pub', 'pug', 'pun', 'pup', 'put', 'rag', 'ram', 'ran', 'rap', 'rat', 'raw', 'ray', 'red', 'ref', 'rib', 'rid', 'rig', 'rim', 'rip', 'rob', 'rod', 'roe', 'rot', 'row', 'rub', 'rug', 'run', 'rut', 'rye', 'sad', 'sag', 'sap', 'sat', 'saw', 'say', 'sea', 'set', 'sew', 'she', 'shy', 'sin', 'sip', 'sir', 'sis', 'sit', 'six', 'ski', 'sky', 'sly', 'sob', 'sod', 'son', 'sop', 'sow', 'soy', 'spa', 'spy', 'sub', 'sum', 'sun', 'tab', 'tad', 'tag', 'tan', 'tap', 'tar', 'tax', 'tea', 'ten', 'the', 'thy', 'tie', 'tin', 'tip', 'toe', 'ton', 'too', 'top', 'tow', 'toy', 'try', 'tub', 'tug', 'two', 'urn', 'use', 'van', 'vat', 'vet', 'vie', 'vow', 'wad', 'wag', 'war', 'was', 'wax', 'way', 'web', 'wed', 'wee', 'wet', 'who', 'why', 'wig', 'win', 'wit', 'woe', 'wok', 'won', 'woo', 'wow', 'yak', 'yam', 'yap', 'yaw', 'yea', 'yes', 'yet', 'yew', 'you', 'zap', 'zed', 'zip', 'zoo',
  // 4-letter
  'able', 'ache', 'acne', 'aged', 'aide', 'also', 'alto', 'area', 'army', 'arts', 'atom', 'aunt', 'auto', 'baby', 'back', 'bait', 'bake', 'bald', 'ball', 'band', 'bank', 'bare', 'bark', 'barn', 'base', 'bath', 'bead', 'beam', 'bean', 'bear', 'beat', 'been', 'beer', 'bell', 'belt', 'bend', 'bent', 'best', 'bile', 'bill', 'bind', 'bird', 'bite', 'blow', 'blue', 'blur', 'boat', 'body', 'boil', 'bold', 'bolt', 'bomb', 'bond', 'bone', 'book', 'boom', 'boot', 'bore', 'born', 'boss', 'both', 'bowl', 'brag', 'bran', 'bred', 'brew', 'brow', 'bulk', 'bull', 'bump', 'burn', 'bury', 'bush', 'bust', 'busy', 'cafe', 'cage', 'cake', 'calf', 'call', 'calm', 'came', 'camp', 'cane', 'cape', 'card', 'care', 'cart', 'case', 'cash', 'cast', 'cave', 'chef', 'chin', 'chip', 'chop', 'cite', 'city', 'clad', 'clam', 'clap', 'claw', 'clay', 'clip', 'club', 'clue', 'coal', 'coat', 'code', 'coil', 'coin', 'cold', 'cole', 'colt', 'comb', 'come', 'cone', 'cook', 'cool', 'cope', 'copy', 'cord', 'core', 'cork', 'corn', 'cost', 'cozy', 'crab', 'cram', 'crew', 'crib', 'crop', 'crow', 'cube', 'cult', 'curb', 'cure', 'curl', 'cute', 'dale', 'dame', 'damp', 'dare', 'dark', 'dart', 'dash', 'data', 'date', 'dawn', 'days', 'dead', 'deaf', 'deal', 'dean', 'dear', 'debt', 'deck', 'deed', 'deem', 'deep', 'deer', 'demo', 'dent', 'deny', 'desk', 'dial', 'dice', 'diet', 'dine', 'dire', 'dirt', 'disc', 'dish', 'disk', 'dive', 'dock', 'does', 'doll', 'dome', 'done', 'doom', 'door', 'dose', 'dote', 'down', 'drag', 'dram', 'draw', 'drip', 'drop', 'drum', 'dual', 'duel', 'duke', 'dull', 'dumb', 'dump', 'dune', 'dunk', 'dusk', 'dust', 'duty', 'each', 'earn', 'ears', 'ease', 'east', 'easy', 'eats', 'echo', 'edge', 'edit', 'else', 'emit', 'envy', 'epic', 'even', 'ever', 'evil', 'exam', 'exit', 'expo', 'eyes', 'face', 'fact', 'fade', 'fail', 'fair', 'fake', 'fall', 'fame', 'fang', 'fare', 'farm', 'fast', 'fate', 'fawn', 'fear', 'feat', 'feed', 'feel', 'feet', 'fell', 'felt', 'fern', 'file', 'fill', 'film', 'find', 'fine', 'fire', 'firm', 'fish', 'fist', 'five', 'flag', 'flap', 'flat', 'flaw', 'flea', 'fled', 'flew', 'flip', 'flit', 'flog', 'flop', 'flow', 'foam', 'foil', 'fold', 'folk', 'fond', 'font', 'food', 'fool', 'foot', 'ford', 'fore', 'fork', 'form', 'fort', 'foul', 'four', 'fowl', 'free', 'frog', 'from', 'fuel', 'full', 'fume', 'fund', 'fuse', 'fuss', 'gait', 'gale', 'game', 'gang', 'gape', 'garb', 'gate', 'gave', 'gaze', 'gear', 'gene', 'gift', 'gilt', 'girl', 'give', 'glad', 'glee', 'glen', 'glow', 'glue', 'glum', 'goat', 'goes', 'gold', 'golf', 'gone', 'good', 'gore', 'gown', 'grab', 'grad', 'gram', 'gray', 'grew', 'grey', 'grid', 'grim', 'grin', 'grip', 'grit', 'grow', 'gulf', 'gust', 'hack', 'hail', 'hair', 'half', 'hall', 'halt', 'hand', 'hang', 'hank', 'hard', 'hare', 'harm', 'harp', 'hate', 'haul', 'have', 'hawk', 'haze', 'hazy', 'head', 'heal', 'heap', 'hear', 'heat', 'heed', 'heel', 'heir', 'held', 'hell', 'helm', 'help', 'hemp', 'herb', 'herd', 'here', 'hero', 'hide', 'high', 'hike', 'hill', 'hilt', 'hint', 'hire', 'hold', 'hole', 'holy', 'home', 'hood', 'hook', 'hoop', 'hope', 'horn', 'hose', 'host', 'hour', 'howl', 'huge', 'hulk', 'hull', 'hump', 'hung', 'hunt', 'hurl', 'hurt', 'hush', 'hymn', 'icon', 'idea', 'idle', 'idol', 'inch', 'info', 'into', 'iris', 'iron', 'isle', 'item', 'jack', 'jade', 'jail', 'jaws', 'jazz', 'jean', 'jeer', 'jerk', 'jest', 'jive', 'jobs', 'join', 'joke', 'jolt', 'judo', 'jump', 'june', 'junk', 'jury', 'just', 'kale', 'keen', 'keep', 'kelp', 'kept', 'kick', 'kids', 'kill', 'kind', 'king', 'kink', 'kite', 'knee', 'knew', 'knit', 'knob', 'knot', 'know', 'lace', 'lack', 'lacy', 'lady', 'laid', 'lair', 'lake', 'lamb', 'lame', 'lamp', 'land', 'lane', 'lard', 'lark', 'lash', 'lass', 'last', 'late', 'laud', 'lawn', 'laws', 'lead', 'leaf', 'leak', 'lean', 'leap', 'left', 'lend', 'lens', 'lent', 'less', 'liar', 'lick', 'lien', 'lies', 'life', 'lift', 'like', 'limb', 'lime', 'limp', 'line', 'link', 'lion', 'lips', 'lisp', 'list', 'live', 'load', 'loaf', 'loan', 'lock', 'loft', 'logo', 'lone', 'long', 'look', 'loom', 'loop', 'loot', 'lord', 'lore', 'lose', 'loss', 'lost', 'lots', 'loud', 'love', 'luck', 'lump', 'lung', 'lure', 'lurk', 'lush', 'lust', 'made', 'maid', 'mail', 'main', 'make', 'male', 'mall', 'malt', 'mane', 'many', 'maps', 'mare', 'mark', 'mars', 'mash', 'mask', 'mass', 'mast', 'mate', 'math', 'maze', 'meal', 'mean', 'meat', 'meek', 'meet', 'meld', 'melt', 'memo', 'mend', 'menu', 'mere', 'mesh', 'mess', 'mice', 'mild', 'mile', 'milk', 'mill', 'mime', 'mind', 'mine', 'mint', 'mire', 'miss', 'mist', 'mite', 'mitt', 'moan', 'moat', 'mock', 'mode', 'mold', 'mole', 'molt', 'monk', 'mood', 'moon', 'moor', 'more', 'morn', 'moss', 'most', 'moth', 'move', 'much', 'muck', 'mule', 'mull', 'murk', 'muse', 'mush', 'musk', 'must', 'mute', 'myth', 'nail', 'name', 'nape', 'navy', 'near', 'neat', 'neck', 'need', 'neon', 'nest', 'news', 'newt', 'next', 'nice', 'nick', 'nine', 'node', 'none', 'noon', 'nope', 'norm', 'nose', 'note', 'noun', 'nude', 'numb', 'nuts', 'oath', 'obey', 'odds', 'odor', 'oils', 'okay', 'omen', 'omit', 'once', 'ones', 'only', 'onto', 'open', 'opts', 'oral', 'orca', 'ounce', 'ours', 'oust', 'oven', 'over', 'owed', 'owls', 'owns', 'pace', 'pack', 'pact', 'page', 'paid', 'pail', 'pain', 'pair', 'pale', 'palm', 'pane', 'pant', 'park', 'part', 'pass', 'past', 'path', 'pave', 'peak', 'pear', 'peas', 'peat', 'peck', 'peek', 'peel', 'peer', 'pelt', 'pens', 'perk', 'perm', 'pest', 'pick', 'pier', 'pike', 'pile', 'pill', 'pine', 'pink', 'pint', 'pipe', 'piss', 'plan', 'play', 'plea', 'plod', 'plop', 'plot', 'plow', 'ploy', 'plug', 'plum', 'plus', 'pock', 'poem', 'poet', 'poke', 'pole', 'poll', 'polo', 'pomp', 'pond', 'pony', 'pool', 'poop', 'poor', 'pope', 'pops', 'pore', 'pork', 'porn', 'port', 'pose', 'posh', 'post', 'pour', 'pout', 'pray', 'prep', 'prey', 'prim', 'prod', 'prom', 'prop', 'pros', 'prowl', 'prune', 'puck', 'puff', 'pull', 'pulp', 'pump', 'punt', 'pure', 'push', 'quit', 'quiz', 'race', 'rack', 'raft', 'rage', 'raid', 'rail', 'rain', 'rake', 'ramp', 'rang', 'rank', 'rant', 'rare', 'rash', 'rasp', 'rate', 'rave', 'rays', 'raze', 'read', 'real', 'ream', 'reap', 'rear', 'reed', 'reef', 'reek', 'reel', 'rein', 'rely', 'rent', 'rest', 'rice', 'rich', 'ride', 'rife', 'rift', 'rile', 'rill', 'rind', 'ring', 'riot', 'ripe', 'rise', 'risk', 'rite', 'road', 'roam', 'roar', 'robe', 'rock', 'rode', 'role', 'roll', 'romp', 'roof', 'room', 'root', 'rope', 'rose', 'rosy', 'rote', 'rout', 'rove', 'rows', 'rude', 'ruin', 'rule', 'rump', 'rung', 'runs', 'runt', 'ruse', 'rush', 'rust', 'sack', 'safe', 'sage', 'said', 'sail', 'sake', 'sale', 'salt', 'same', 'sand', 'sane', 'sang', 'sank', 'sash', 'save', 'says', 'scab', 'scam', 'scan', 'scar', 'seal', 'seam', 'sear', 'seas', 'seat', 'sect', 'seed', 'seek', 'seem', 'seen', 'self', 'sell', 'semi', 'send', 'sent', 'sept', 'sewn', 'shed', 'shim', 'shin', 'ship', 'shiv', 'shoe', 'shoo', 'shop', 'shot', 'show', 'shun', 'shut', 'sick', 'side', 'sift', 'sigh', 'sign', 'silk', 'silo', 'sine', 'sing', 'sink', 'site', 'size', 'skim', 'skin', 'skip', 'slab', 'slag', 'slam', 'slap', 'slat', 'slaw', 'slay', 'sled', 'slew', 'slid', 'slim', 'slip', 'slit', 'slob', 'slog', 'slop', 'slot', 'slow', 'slug', 'slum', 'slur', 'smog', 'snag', 'snap', 'snip', 'snob', 'snot', 'snow', 'snub', 'snug', 'soak', 'soap', 'soar', 'sock', 'soda', 'sofa', 'soft', 'soil', 'sold', 'sole', 'some', 'song', 'soon', 'soot', 'sore', 'sort', 'soul', 'soup', 'sour', 'span', 'spar', 'spat', 'spec', 'sped', 'spin', 'spit', 'spot', 'spud', 'spur', 'stab', 'stag', 'star', 'stay', 'stem', 'step', 'stew', 'stir', 'stop', 'stub', 'stud', 'stun', 'such', 'suck', 'suds', 'suit', 'sulk', 'sung', 'sunk', 'sure', 'surf', 'swab', 'swam', 'swan', 'swap', 'sway', 'swim', 'tabs', 'tack', 'tact', 'tags', 'tail', 'take', 'tale', 'talk', 'tall', 'tame', 'tank', 'tape', 'taps', 'tart', 'task', 'taxi', 'teak', 'teal', 'team', 'tear', 'teas', 'tech', 'teem', 'teen', 'tell', 'temp', 'tend', 'tens', 'tent', 'term', 'test', 'text', 'than', 'that', 'thaw', 'them', 'then', 'they', 'thin', 'this', 'thou', 'thud', 'thug', 'thus', 'tick', 'tide', 'tidy', 'tied', 'tier', 'ties', 'tile', 'till', 'tilt', 'time', 'tint', 'tiny', 'tips', 'tire', 'toad', 'toes', 'toil', 'told', 'toll', 'tomb', 'tome', 'tone', 'tons', 'took', 'tool', 'toot', 'tops', 'tore', 'torn', 'tort', 'toss', 'tote', 'tour', 'town', 'toys', 'tram', 'trap', 'tray', 'tree', 'trek', 'trim', 'trio', 'trip', 'trod', 'trot', 'true', 'tsar', 'tuba', 'tube', 'tuck', 'tuft', 'tugs', 'tuna', 'tune', 'turf', 'turn', 'tusk', 'tutor', 'twig', 'twin', 'twit', 'type', 'ugly', 'undo', 'unit', 'unto', 'upon', 'urge', 'used', 'user', 'uses', 'vain', 'vale', 'vane', 'vary', 'vase', 'vast', 'veal', 'veer', 'veil', 'vein', 'vent', 'verb', 'very', 'vest', 'veto', 'vial', 'vibe', 'vice', 'vied', 'view', 'vile', 'vine', 'visa', 'vise', 'void', 'volt', 'vote', 'wade', 'waft', 'wage', 'wail', 'wait', 'wake', 'walk', 'wall', 'wand', 'want', 'ward', 'warm', 'warn', 'warp', 'wart', 'wary', 'wash', 'wasp', 'wave', 'wavy', 'waxy', 'ways', 'weak', 'wean', 'wear', 'weed', 'week', 'weep', 'weld', 'well', 'welt', 'went', 'wept', 'were', 'west', 'what', 'when', 'whey', 'whim', 'whip', 'whir', 'whom', 'wick', 'wide', 'wife', 'wild', 'will', 'wilt', 'wily', 'wimp', 'wind', 'wine', 'wing', 'wink', 'wipe', 'wire', 'wiry', 'wise', 'wish', 'wisp', 'with', 'wits', 'woke', 'wolf', 'womb', 'wont', 'wood', 'woof', 'wool', 'word', 'wore', 'work', 'worm', 'worn', 'wort', 'wrap', 'wren', 'writ', 'yank', 'yard', 'yarn', 'yawl', 'yawn', 'year', 'yell', 'yelp', 'yoga', 'yoke', 'yolk', 'your', 'yowl', 'zeal', 'zero', 'zest', 'zinc', 'zone', 'zoom',
  // 5-letter
  'about', 'above', 'abuse', 'actor', 'acute', 'admit', 'adopt', 'adult', 'after', 'again', 'agent', 'agree', 'ahead', 'alarm', 'album', 'alert', 'alien', 'align', 'alike', 'alive', 'alley', 'allow', 'alone', 'along', 'alter', 'among', 'angel', 'anger', 'angle', 'angry', 'apart', 'apple', 'apply', 'arena', 'argue', 'arise', 'armor', 'array', 'arrow', 'asset', 'avoid', 'award', 'aware', 'awful', 'basic', 'basis', 'beach', 'beast', 'begin', 'being', 'below', 'bench', 'birth', 'black', 'blade', 'blame', 'blank', 'blast', 'blaze', 'blend', 'bless', 'blind', 'block', 'blood', 'blown', 'blues', 'board', 'bonus', 'boost', 'booth', 'bound', 'brain', 'brand', 'brass', 'brave', 'bread', 'break', 'breed', 'brick', 'bride', 'brief', 'bring', 'broad', 'broke', 'brook', 'brown', 'brush', 'build', 'bunch', 'burst', 'buyer', 'cabin', 'cable', 'camel', 'candy', 'carry', 'carve', 'catch', 'cause', 'cease', 'chain', 'chair', 'chalk', 'champ', 'chaos', 'charm', 'chart', 'chase', 'cheap', 'cheat', 'check', 'cheek', 'cheer', 'chess', 'chest', 'chief', 'child', 'chill', 'china', 'chirp', 'choir', 'chord', 'chose', 'chunk', 'claim', 'clamp', 'clang', 'clash', 'clasp', 'class', 'clean', 'clear', 'clerk', 'click', 'cliff', 'climb', 'cling', 'cloak', 'clock', 'close', 'cloth', 'cloud', 'clown', 'coach', 'coast', 'color', 'couch', 'cough', 'could', 'count', 'court', 'cover', 'crack', 'craft', 'crane', 'crash', 'crawl', 'crazy', 'cream', 'creed', 'creek', 'creep', 'crest', 'crime', 'crisp', 'cross', 'crowd', 'crown', 'crude', 'cruel', 'crush', 'curve', 'cycle', 'daily', 'dairy', 'dance', 'dealt', 'death', 'debut', 'delay', 'delta', 'dense', 'depth', 'diary', 'dirty', 'doubt', 'dozen', 'draft', 'drain', 'drake', 'drama', 'drank', 'drawn', 'dread', 'dream', 'dress', 'dried', 'drift', 'drill', 'drink', 'drive', 'drown', 'drunk', 'dusty', 'dwarf', 'dwell', 'dying', 'eager', 'eagle', 'early', 'earth', 'eight', 'elder', 'elect', 'elite', 'email', 'empty', 'enemy', 'enjoy', 'enter', 'entry', 'equal', 'equip', 'erase', 'error', 'essay', 'evade', 'event', 'every', 'exact', 'exile', 'exist', 'extra', 'faint', 'fairy', 'faith', 'false', 'fancy', 'fatal', 'fault', 'favor', 'feast', 'fence', 'ferry', 'fetch', 'fever', 'fiber', 'field', 'fiery', 'fifth', 'fifty', 'fight', 'filth', 'final', 'first', 'fixed', 'flame', 'flank', 'flash', 'flask', 'fleet', 'flesh', 'flick', 'fling', 'flint', 'float', 'flock', 'flood', 'floor', 'flora', 'flour', 'flown', 'fluid', 'flung', 'flush', 'flute', 'focal', 'focus', 'foggy', 'force', 'forge', 'forth', 'forty', 'forum', 'fossil', 'found', 'frame', 'frank', 'fraud', 'freak', 'fresh', 'fried', 'front', 'frost', 'fruit', 'fully', 'funny', 'ghost', 'giant', 'given', 'gland', 'glare', 'glass', 'gleam', 'glide', 'globe', 'gloom', 'glory', 'gloss', 'glove', 'gnarl', 'grace', 'grade', 'grain', 'grand', 'grant', 'grape', 'graph', 'grasp', 'grass', 'grave', 'graze', 'great', 'greed', 'greek', 'green', 'greet', 'grief', 'grill', 'grind', 'groan', 'groom', 'grope', 'gross', 'group', 'grove', 'growl', 'grown', 'grunt', 'guard', 'guess', 'guest', 'guide', 'guild', 'guilt', 'habit', 'happy', 'harsh', 'haste', 'hasty', 'hatch', 'haunt', 'haven', 'heads', 'heard', 'heart', 'heath', 'heavy', 'hedge', 'heist', 'hello', 'hence', 'herbs', 'hinge', 'hobby', 'hoist', 'holly', 'homer', 'honey', 'honor', 'horse', 'hotel', 'hound', 'hours', 'house', 'human', 'humid', 'humor', 'hurry', 'ideal', 'image', 'imply', 'index', 'inner', 'input', 'intro', 'issue', 'ivory', 'jelly', 'jewel', 'joint', 'jolly', 'joust', 'judge', 'juice', 'jumbo', 'keeps', 'knife', 'knock', 'known', 'label', 'labor', 'laden', 'lance', 'laser', 'latch', 'later', 'laugh', 'layer', 'learn', 'lease', 'least', 'leave', 'legal', 'lemon', 'level', 'lever', 'light', 'liked', 'limit', 'linen', 'liner', 'lives', 'llama', 'local', 'lodge', 'logic', 'login', 'loose', 'lorry', 'lotus', 'loved', 'lover', 'lower', 'loyal', 'lucid', 'lucky', 'lunar', 'lunch', 'lying', 'lyric', 'magic', 'major', 'maker', 'manor', 'maple', 'march', 'marsh', 'match', 'matte', 'mayor', 'meant', 'medal', 'media', 'melon', 'mercy', 'merge', 'merit', 'merry', 'metal', 'meter', 'midst', 'might', 'mince', 'minor', 'minus', 'mirth', 'miser', 'mixed', 'mixer', 'model', 'modem', 'money', 'month', 'moral', 'motor', 'mould', 'mount', 'mouse', 'mouth', 'movie', 'muddy', 'music', 'nasal', 'naval', 'nerve', 'never', 'newer', 'night', 'ninth', 'noble', 'noise', 'north', 'notch', 'noted', 'novel', 'nurse', 'nylon', 'occur', 'ocean', 'offer', 'often', 'olive', 'omega', 'onset', 'opera', 'orbit', 'order', 'organ', 'other', 'ought', 'outer', 'owned', 'owner', 'oxide', 'ozone', 'paint', 'panel', 'panic', 'paper', 'party', 'pasta', 'paste', 'patch', 'pause', 'peace', 'peach', 'pearl', 'penny', 'phase', 'phone', 'photo', 'piano', 'piece', 'pilot', 'pinch', 'pitch', 'pizza', 'place', 'plain', 'plane', 'plant', 'plate', 'plaza', 'plead', 'pleas', 'pleat', 'plier', 'pluck', 'plumb', 'plume', 'plump', 'plunk', 'plush', 'poach', 'point', 'poise', 'polar', 'porch', 'poser', 'pound', 'power', 'prank', 'prawn', 'press', 'price', 'pride', 'prime', 'print', 'prior', 'prism', 'prize', 'probe', 'proof', 'proud', 'prove', 'proxy', 'prune', 'pulse', 'punch', 'pupil', 'puppy', 'purse', 'queen', 'query', 'quest', 'queue', 'quick', 'quiet', 'quilt', 'quirk', 'quota', 'quote', 'radar', 'radio', 'raise', 'rally', 'ranch', 'range', 'rapid', 'ratio', 'reach', 'react', 'ready', 'realm', 'rebel', 'refer', 'reign', 'relax', 'relay', 'relic', 'remit', 'renew', 'repay', 'reply', 'rhyme', 'rider', 'ridge', 'rifle', 'right', 'rigid', 'rigor', 'ripen', 'risen', 'risky', 'ritual', 'rival', 'river', 'robot', 'rocky', 'rogue', 'roman', 'roots', 'rotor', 'rouge', 'rough', 'round', 'route', 'royal', 'rugby', 'ruins', 'ruler', 'rural', 'rusty', 'sadly', 'saint', 'salad', 'salon', 'salty', 'sandy', 'sauce', 'saved', 'saver', 'scale', 'scalp', 'scare', 'scarf', 'scary', 'scene', 'scent', 'score', 'scout', 'scrap', 'seize', 'sense', 'serve', 'setup', 'seven', 'shade', 'shady', 'shake', 'shall', 'shame', 'shape', 'share', 'shark', 'sharp', 'shave', 'sheet', 'shelf', 'shell', 'shift', 'shine', 'shiny', 'shirt', 'shock', 'shore', 'short', 'shout', 'shown', 'shrub', 'siege', 'sight', 'sigma', 'silky', 'silly', 'since', 'siren', 'sixth', 'sixty', 'sized', 'skate', 'skill', 'skimp', 'skirt', 'skull', 'slack', 'slain', 'slave', 'sleek', 'sleep', 'slice', 'slide', 'slime', 'slope', 'sloth', 'small', 'smart', 'smell', 'smile', 'smith', 'smoke', 'snack', 'snail', 'snake', 'snare', 'sneak', 'snore', 'solar', 'solid', 'solve', 'sonic', 'sorry', 'sound', 'south', 'space', 'spare', 'spark', 'speak', 'spear', 'speed', 'spell', 'spend', 'spent', 'spice', 'spicy', 'spill', 'spine', 'spoil', 'spoke', 'spoon', 'sport', 'spray', 'spree', 'squad', 'stack', 'staff', 'stage', 'stain', 'stair', 'stake', 'stale', 'stamp', 'stand', 'stank', 'stark', 'start', 'state', 'stays', 'steak', 'steal', 'steam', 'steel', 'steep', 'steer', 'stern', 'stick', 'stiff', 'still', 'sting', 'stink', 'stock', 'stoic', 'stoke', 'stole', 'stomp', 'stone', 'stony', 'stood', 'stool', 'stoop', 'store', 'stork', 'storm', 'story', 'stove', 'strap', 'straw', 'stray', 'strip', 'stuck', 'study', 'stuff', 'stump', 'stung', 'stunk', 'stunt', 'style', 'sugar', 'suite', 'sunny', 'super', 'surge', 'swamp', 'swarm', 'swear', 'sweat', 'sweep', 'sweet', 'swift', 'swing', 'sword', 'swore', 'sworn', 'swung', 'syrup', 'table', 'taboo', 'tacit', 'taint', 'taken', 'tango', 'tardy', 'taste', 'tasty', 'teach', 'teeth', 'tempo', 'tense', 'tenth', 'terms', 'thank', 'theft', 'their', 'theme', 'there', 'these', 'thick', 'thief', 'thigh', 'thing', 'think', 'third', 'thorn', 'those', 'three', 'threw', 'thrill', 'throw', 'thumb', 'tiger', 'tight', 'timer', 'times', 'tired', 'title', 'toast', 'today', 'token', 'tooth', 'topic', 'torch', 'total', 'touch', 'tough', 'towel', 'tower', 'toxic', 'trace', 'track', 'tract', 'trade', 'trail', 'train', 'trait', 'tramp', 'trash', 'treat', 'trend', 'trial', 'tribe', 'trick', 'tried', 'troop', 'truck', 'truly', 'trump', 'trunk', 'trust', 'truth', 'tulip', 'tumor', 'tuner', 'twice', 'twist', 'tying', 'ultra', 'uncle', 'under', 'unfair', 'union', 'unite', 'unity', 'until', 'upper', 'upset', 'urban', 'usage', 'usual', 'utter', 'vague', 'valid', 'value', 'vapor', 'vault', 'venom', 'venue', 'verge', 'verse', 'video', 'vigor', 'viral', 'virus', 'visit', 'vista', 'vital', 'vivid', 'vocal', 'vodka', 'vogue', 'voice', 'voter', 'vouch', 'vowel', 'wagon', 'waist', 'waste', 'watch', 'water', 'weary', 'weave', 'weigh', 'weird', 'whale', 'wheat', 'wheel', 'where', 'which', 'while', 'whine', 'whirl', 'white', 'whole', 'whose', 'widen', 'width', 'witch', 'woman', 'women', 'woods', 'world', 'worry', 'worse', 'worst', 'worth', 'would', 'wound', 'woven', 'wreck', 'wrist', 'write', 'wrong', 'wrote', 'yacht', 'yearn', 'yeast', 'yield', 'young', 'yours', 'youth', 'zebra', 'zesty',
  // Common 6-letter words
  'listen', 'silent', 'rescue', 'secure', 'player', 'replay', 'dealer', 'leader', 'master', 'stream', 'garden', 'danger', 'thread', 'hatred', 'plates', 'staple', 'pastel', 'petals', 'pleats', 'palest', 'alerts', 'alters', 'artels', 'estral', 'laster', 'ratels', 'salter', 'slater', 'staler', 'stelar', 'talers', 'actors', 'castor', 'costar', 'scrota', 'tarocs', 'animal', 'manila', 'lamina', 'marine', 'remain', 'airmen', 'admire', 'married', 'rained', 'randie', 'sander', 'snared', 'redans', 'denars', 'stoner', 'tensor', 'toners', 'nestor', 'noters', 'stoker', 'stroke', 'trokes', 'respot', 'presto', 'poster', 'repost', 'stoper', 'topers', 'tropes', 'depart', 'parted', 'petard', 'prated', 'traped', 'drapes', 'padres', 'parsed', 'rasped', 'spader', 'spared', 'spread', 'stripe', 'ripest', 'priest', 'sprite', 'esprit', 'stripe', 'tripes', 'seated', 'sedate', 'teased', 'seared', 'erased', 'reseda', 'create', 'ecarte', 'cerate', 'secret', 'erects', 'certes', 'resect', 'screet', 'terces'
];

export const AnagramSolverTool = ({ uiConfig }: AnagramSolverToolProps) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const [input, setInput] = useState('');
  const [isPrefilled, setIsPrefilled] = useState(false);
  const [anagrams, setAnagrams] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [minLength, setMinLength] = useState(3);
  const [showOnlyFullAnagrams, setShowOnlyFullAnagrams] = useState(false);

  // Apply prefill data from uiConfig.params when component mounts
  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as ToolPrefillData;
      const textContent = params.text || params.content || params.sourceText || '';
      if (textContent) {
        setInput(textContent.toLowerCase().replace(/[^a-z]/g, ''));
        setIsPrefilled(true);
      }
    }
  }, [uiConfig?.params]);

  const sortLetters = (word: string): string => {
    return word.toLowerCase().split('').sort().join('');
  };

  const canFormWord = (word: string, letters: string): boolean => {
    const letterCounts: Record<string, number> = {};
    for (const letter of letters) {
      letterCounts[letter] = (letterCounts[letter] || 0) + 1;
    }
    for (const letter of word) {
      if (!letterCounts[letter] || letterCounts[letter] === 0) {
        return false;
      }
      letterCounts[letter]--;
    }
    return true;
  };

  const findAnagrams = () => {
    if (!input.trim()) return;

    setLoading(true);
    const normalizedInput = input.toLowerCase().replace(/[^a-z]/g, '');
    const sortedInput = sortLetters(normalizedInput);

    // Use setTimeout to prevent UI blocking
    setTimeout(() => {
      const found: string[] = [];

      for (const word of wordList) {
        if (word.length < minLength) continue;
        if (showOnlyFullAnagrams && word.length !== normalizedInput.length) continue;

        if (showOnlyFullAnagrams) {
          // For full anagrams, sorted letters must match exactly
          if (sortLetters(word) === sortedInput) {
            found.push(word);
          }
        } else {
          // For partial anagrams, check if word can be formed from letters
          if (word.length <= normalizedInput.length && canFormWord(word, normalizedInput)) {
            found.push(word);
          }
        }
      }

      // Sort by length (descending) then alphabetically
      found.sort((a, b) => {
        if (b.length !== a.length) return b.length - a.length;
        return a.localeCompare(b);
      });

      setAnagrams(found);
      setLoading(false);
    }, 100);
  };

  const handleCopy = async () => {
    if (anagrams.length === 0) return;
    await navigator.clipboard.writeText(anagrams.join(', '));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShuffle = () => {
    const letters = input.split('');
    for (let i = letters.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [letters[i], letters[j]] = [letters[j], letters[i]];
    }
    setInput(letters.join(''));
    setIsPrefilled(false);
  };

  const handleClear = () => {
    setInput('');
    setAnagrams([]);
    setIsPrefilled(false);
  };

  return (
    <div className={`max-w-4xl mx-auto p-6 rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
      <h2 className={`text-2xl font-bold mb-6 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
        {t('tools.anagramSolver.anagramSolver', 'Anagram Solver')}
      </h2>

      <div className="space-y-6">
        {/* Prefill Indicator */}
        {isPrefilled && (
          <div className="flex items-center gap-2 px-4 py-2 bg-[#0D9488]/10 rounded-xl border border-[#0D9488]/20">
            <Sparkles className="w-4 h-4 text-[#0D9488]" />
            <span className="text-sm text-[#0D9488] font-medium">{t('tools.anagramSolver.contentLoadedFromAiResponse', 'Content loaded from AI response')}</span>
          </div>
        )}

        {/* Options */}
        <div className="flex flex-wrap gap-4 items-center">
          <div>
            <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
              Minimum Length: {minLength}
            </label>
            <input
              type="range"
              min="2"
              max="8"
              value={minLength}
              onChange={(e) => setMinLength(Number(e.target.value))}
              className="w-32 h-2 bg-gray-300 dark:bg-gray-600 rounded-lg appearance-none cursor-pointer accent-[#0D9488]"
            />
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={showOnlyFullAnagrams}
              onChange={(e) => setShowOnlyFullAnagrams(e.target.checked)}
              className="w-4 h-4 rounded accent-[#0D9488] cursor-pointer"
            />
            <span className={`text-sm ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
              {t('tools.anagramSolver.onlyShowFullAnagramsSame', 'Only show full anagrams (same length)')}
            </span>
          </label>
        </div>

        {/* Input */}
        <div>
          <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
            {t('tools.anagramSolver.enterLetters', 'Enter Letters')}
          </label>
          <div className="flex gap-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value.toLowerCase().replace(/[^a-z]/g, ''))}
              onKeyDown={(e) => e.key === 'Enter' && findAnagrams()}
              placeholder={t('tools.anagramSolver.enterLettersToFindAnagrams', 'Enter letters to find anagrams...')}
              className={`flex-1 px-4 py-3 rounded-lg border font-mono text-xl tracking-wider ${
                theme === 'dark'
                  ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                  : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-500'
              } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
            />
            <button
              onClick={handleShuffle}
              disabled={!input}
              className={`px-4 py-3 rounded-lg transition-colors ${
                theme === 'dark'
                  ? 'bg-gray-700 hover:bg-gray-600 text-gray-200 disabled:bg-gray-800'
                  : 'bg-gray-200 hover:bg-gray-300 text-gray-700 disabled:bg-gray-100'
              }`}
              title={t('tools.anagramSolver.shuffleLetters', 'Shuffle letters')}
            >
              <Shuffle className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-3">
          <button
            onClick={findAnagrams}
            disabled={!input.trim() || loading}
            className="flex items-center gap-2 px-6 py-2 bg-[#0D9488] hover:bg-[#0F766E] disabled:bg-gray-400 text-white rounded-lg font-medium transition-colors"
          >
            {loading ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Search className="w-4 h-4" />
            )}
            {loading ? t('tools.anagramSolver.searching', 'Searching...') : t('tools.anagramSolver.findAnagrams', 'Find Anagrams')}
          </button>
          <button
            onClick={handleClear}
            className={`px-6 py-2 rounded-lg transition-colors font-medium ${
              theme === 'dark'
                ? 'bg-gray-700 hover:bg-gray-600 text-gray-200'
                : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
            }`}
          >
            {t('tools.anagramSolver.clear', 'Clear')}
          </button>
        </div>

        {/* Results */}
        {anagrams.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                Found {anagrams.length} word{anagrams.length !== 1 ? 's' : ''}
              </h3>
              <button
                onClick={handleCopy}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-colors text-sm ${
                  copied
                    ? 'bg-green-500 text-white'
                    : theme === 'dark'
                    ? 'bg-gray-700 hover:bg-gray-600 text-gray-200'
                    : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                }`}
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copied ? t('tools.anagramSolver.copied', 'Copied!') : t('tools.anagramSolver.copyAll', 'Copy All')}
              </button>
            </div>

            {/* Group by length */}
            {Array.from(new Set(anagrams.map(w => w.length)))
              .sort((a, b) => b - a)
              .map(length => {
                const wordsOfLength = anagrams.filter(w => w.length === length);
                return (
                  <div key={length} className="mb-4">
                    <h4 className={`text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                      {length}-letter words ({wordsOfLength.length})
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {wordsOfLength.map((word, index) => (
                        <span
                          key={index}
                          className={`px-3 py-1.5 rounded-lg text-sm font-mono ${
                            word.length === input.length
                              ? 'bg-[#0D9488]/20 text-[#0D9488] border border-[#0D9488]'
                              : theme === 'dark'
                              ? 'bg-gray-700 text-gray-200'
                              : 'bg-gray-100 text-gray-700'
                          }`}
                        >
                          {word}
                        </span>
                      ))}
                    </div>
                  </div>
                );
              })}
          </div>
        )}

        {anagrams.length === 0 && input && !loading && (
          <div className={`text-center py-8 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
            {t('tools.anagramSolver.noAnagramsFoundTryDifferent', 'No anagrams found. Try different letters or adjust the minimum length.')}
          </div>
        )}

        {/* Info Section */}
        <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
          <h3 className={`text-sm font-semibold mb-2 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
            {t('tools.anagramSolver.whatIsAnAnagram', 'What is an Anagram?')}
          </h3>
          <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
            An anagram is a word or phrase formed by rearranging the letters of another word or phrase.
            For example, "listen" and "silent" are anagrams of each other. This tool finds all valid English
            words that can be formed using some or all of your input letters.
          </p>
        </div>
      </div>
    </div>
  );
};
