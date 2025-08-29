import React, { useState, useMemo } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search } from 'lucide-react';
import * as LucideIcons from 'lucide-react';

// Get all available Lucide icons - more comprehensive filtering
const ALL_LUCIDE_ICONS = Object.keys(LucideIcons).filter(name => {
  // Exclude non-component exports
  if (name === 'createLucideIcon' || name === 'default' || name === 'icons') return false;
  
  const component = (LucideIcons as any)[name];
  // Check if it's a React component function
  return typeof component === 'function' && component.displayName !== undefined;
});

// If the filtered list is empty, fall back to a curated list of common icons
const FALLBACK_LUCIDE_ICONS = [
  'Activity', 'AlertCircle', 'AlertTriangle', 'Archive', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowUp',
  'Bell', 'Book', 'Calendar', 'Camera', 'Check', 'ChevronDown', 'ChevronLeft', 'ChevronRight', 'ChevronUp',
  'Circle', 'Clock', 'Cloud', 'Code', 'Coffee', 'Copy', 'Database', 'Download', 'Edit', 'Eye', 'EyeOff',
  'File', 'Filter', 'Flag', 'Folder', 'Gift', 'Grid', 'Heart', 'Home', 'Image', 'Inbox', 'Info',
  'Key', 'Layers', 'List', 'Lock', 'Mail', 'Map', 'Menu', 'MessageSquare', 'Minus', 'Monitor', 'Moon',
  'MoreHorizontal', 'MoreVertical', 'Music', 'Package', 'Pause', 'Phone', 'Play', 'Plus', 'Power',
  'Printer', 'Refresh', 'Save', 'Search', 'Send', 'Settings', 'Share', 'Shield', 'ShoppingCart', 'Star',
  'Sun', 'Tag', 'Target', 'Trash2', 'Trophy', 'Truck', 'Twitter', 'Upload', 'User', 'Users', 'Video', 'Volume2',
  'Wifi', 'X', 'Zap', 'Zoom', 'Smile', 'SmilePlus'
].filter(name => (LucideIcons as any)[name]);

const FINAL_LUCIDE_ICONS = ALL_LUCIDE_ICONS.length > 0 ? ALL_LUCIDE_ICONS : FALLBACK_LUCIDE_ICONS;

// Debug: log the icon count
console.log('Lucide icons found:', FINAL_LUCIDE_ICONS.length, 'first 10:', FINAL_LUCIDE_ICONS.slice(0, 10));

// Comprehensive emoji collection organized by category
const ALL_EMOJIS = [
  // Faces & People
  '😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣', '😊', '😇', '🙂', '🙃', '😉', '😌', '😍', '🥰', '😘', '😗', '😙', '😚', '😋', '😛', '😝', '😜', '🤪', '🤨', '🧐', '🤓', '😎', '🤩', '🥳', '😏', '😒', '😞', '😔', '😟', '😕', '🙁', '☹️', '😣', '😖', '😫', '😩', '🥺', '😢', '😭', '😤', '😠', '😡', '🤬', '🤯', '😳', '🥵', '🥶', '😱', '😨', '😰', '😥', '😓', '🤗', '🤔', '🤭', '🤫', '🤥', '😶', '😐', '😑', '😬', '🙄', '😯', '😦', '😧', '😮', '😲', '🥱', '😴', '🤤', '😪', '😵', '🤐', '🥴', '🤢', '🤮', '🤧', '😷', '🤒', '🤕',
  // Animals & Nature
  '🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯', '🦁', '🐮', '🐷', '🐽', '🐸', '🐵', '🙈', '🙉', '🙊', '🐒', '🐔', '🐧', '🐦', '🐤', '🐣', '🐥', '🦆', '🦅', '🦉', '🦇', '🐺', '🐗', '🐴', '🦄', '🐝', '🐛', '🦋', '🐌', '🐞', '🐜', '🦟', '🦗', '🕷️', '🕸️', '🦂', '🐢', '🐍', '🦎', '🦖', '🦕', '🐙', '🦑', '🦐', '🦞', '🦀', '🐡', '🐠', '🐟', '🐬', '🐳', '🐋', '🦈', '🐊', '🐅', '🐆', '🦓', '🦍', '🦧', '🐘', '🦛', '🦏', '🐪', '🐫', '🦒', '🦘', '🐃', '🐂', '🐄', '🐎', '🐖', '🐏', '🐑', '🦙', '🐐', '🦌', '🐕', '🐩', '🦮', '🐕‍🦺', '🐈', '🐈‍⬛', '🐓', '🦃', '🦚', '🦜', '🦢', '🦩', '🕊️', '🐇', '🦝', '🦨', '🦡', '🦦', '🦥', '🐁', '🐀', '🐿️', '🦔',
  // Food & Drink
  '🍏', '🍎', '🍐', '🍊', '🍋', '🍌', '🍉', '🍇', '🍓', '🫐', '🍈', '🍒', '🍑', '🥭', '🍍', '🥥', '🥝', '🍅', '🍆', '🥑', '🥦', '🥬', '🥒', '🌶️', '🫑', '🌽', '🥕', '🫒', '🧄', '🧅', '🥔', '🍠', '🥐', '🥯', '🍞', '🥖', '🥨', '🧀', '🥚', '🍳', '🧈', '🥞', '🧇', '🥓', '🥩', '🍗', '🍖', '🦴', '🌭', '🍔', '🍟', '🍕', '🫓', '🥪', '🥙', '🧆', '🌮', '🌯', '🫔', '🥗', '🥘', '🫕', '🍝', '🍜', '🍲', '🍛', '🍣', '🍱', '🥟', '🦪', '🍤', '🍙', '🍚', '🍘', '🍥', '🥠', '🥮', '🍢', '🍡', '🍧', '🍨', '🍦', '🥧', '🧁', '🍰', '🎂', '🍮', '🍭', '🍬', '🍫', '🍿', '🍩', '🍪', '🌰', '🥜', '🍯', '🥛', '🍼', '☕', '🍵', '🧃', '🥤', '🍶', '🍺', '🍻', '🥂', '🍷', '🥃', '🍸', '🍹', '🧉', '🍾',
  // Objects & Symbols
  '⌚', '📱', '📲', '💻', '⌨️', '🖥️', '🖨️', '🖱️', '🖲️', '🕹️', '🗜️', '💽', '💾', '💿', '📀', '📼', '📷', '📸', '📹', '🎥', '📽️', '🎞️', '📞', '☎️', '📟', '📠', '📺', '📻', '🎙️', '🎚️', '🎛️', '🧭', '⏱️', '⏲️', '⏰', '🕰️', '⌛', '⏳', '📡', '🔋', '🔌', '💡', '🔦', '🕯️', '🪔', '🧯', '🛢️', '💸', '💵', '💴', '💶', '💷', '💰', '💳', '💎', '⚖️', '🧰', '🔧', '🔨', '⚒️', '🛠️', '⛏️', '🔩', '⚙️', '🧱', '⛓️', '🧲', '🔫', '💣', '🧨', '🪓', '🔪', '🗡️', '⚔️', '🛡️', '🚬', '⚰️', '⚱️', '🏺', '🔮', '📿', '🧿', '💈', '⚗️', '🔭', '🔬', '🕳️', '🩹', '🩺', '💊', '💉', '🧬', '🦠', '🧫', '🧪', '🌡️', '🧹', '🧺', '🧻', '🚽', '🚰', '🚿', '🛁', '🛀', '🧼', '🪒', '🧽', '🧴', '🛎️', '🔑', '🗝️', '🚪', '🪑', '🛏️', '🛋️', '🧸', '🖼️', '🛍️', '🛒', '🎁', '🎈', '🎏', '🎀', '🎊', '🎉', '🎎', '🏮', '🎐', '🧧', '✉️', '📩', '📨', '📧', '💌', '📥', '📤', '📦', '🏷️', '📪', '📫', '📬', '📭', '📮', '📯', '📜', '📃', '📄', '📑', '🧾', '📊', '📈', '📉', '🗒️', '🗓️', '📅', '📆', '📇', '🗃️', '🗳️', '🗄️', '📋', '📌', '📍', '📎', '🖇️', '📏', '📐', '✂️', '🗃️', '🗂️', '🗞️', '📰', '📓', '📔', '📒', '📕', '📗', '📘', '📙', '📚', '📖', '🔖', '🧷', '🔗', '📎', '🖇️', '📐', '📏', '🧮', '📝', '✏️', '✒️', '🖋️', '🖊️', '🖌️', '🖍️', '📝', '📄', '📃', '📜', '📋', '📊', '📈', '📉', '📊', '💼', '🗂️',
  // Activities & Sports
  '⚽', '🏀', '🏈', '⚾', '🥎', '🎾', '🏐', '🏉', '🥏', '🎱', '🪀', '🏓', '🏸', '🏒', '🏑', '🥍', '🏏', '🪃', '🥅', '⛳', '🪁', '🏹', '🎣', '🤿', '🥽', '🥼', '🦺', '⛷️', '🏂', '🪂', '🏋️‍♀️', '🏋️', '🏋️‍♂️', '🤼‍♀️', '🤼', '🤼‍♂️', '🤸‍♀️', '🤸', '🤸‍♂️', '⛹️‍♀️', '⛹️', '⛹️‍♂️', '🤺', '🤾‍♀️', '🤾', '🤾‍♂️', '🏌️‍♀️', '🏌️', '🏌️‍♂️', '🏇', '🧘‍♀️', '🧘', '🧘‍♂️', '🏄‍♀️', '🏄', '🏄‍♂️', '🏊‍♀️', '🏊', '🏊‍♂️', '🤽‍♀️', '🤽', '🤽‍♂️', '🚣‍♀️', '🚣', '🚣‍♂️', '🧗‍♀️', '🧗', '🧗‍♂️', '🚵‍♀️', '🚵', '🚵‍♂️', '🚴‍♀️', '🚴', '🚴‍♂️', '🏆', '🥇', '🥈', '🥉', '🏅', '🎖️', '🏵️', '🎗️', '🎫', '🎟️', '🎪', '🤹‍♀️', '🤹', '🤹‍♂️', '🎭', '🩰', '🎨', '🎬', '🎤', '🎧', '🎼', '🎵', '🎶', '🥇', '🥈', '🥉', '🏆', '🏅', '🎖️',
  // Travel & Places
  '🚗', '🚕', '🚙', '🚌', '🚎', '🏎️', '🚓', '🚑', '🚒', '🚐', '🛻', '🚚', '🚛', '🚜', '🏍️', '🛵', '🚲', '🛴', '🛹', '🛼', '🚁', '🛸', '✈️', '🛩️', '🛫', '🛬', '🪂', '💺', '🚀', '🛰️', '🚉', '🚞', '🚝', '🚄', '🚅', '🚈', '🚂', '🚆', '🚇', '🚊', '🚃', '🚋', '🚍', '🚘', '🚖', '🚡', '🚠', '🚟', '🎢', '🎡', '🎠', '🎪', '🚢', '⛵', '🛶', '🚤', '🛥️', '🛳️', '⛴️', '🚁', '🚟', '🚠', '🚡', '🚂', '🚃', '🚄', '🚅', '🚆', '🚇', '🚈', '🚉', '🚊', '🚝', '🚞', '🚋', '🚌', '🚍', '🚎', '🚐', '🚑', '🚒', '🚓', '🚔', '🚕', '🚖', '🚗', '🚘', '🚙', '🚚', '🚛', '🚜', '🏍️', '🛵', '🚲', '🛴', '🛹', '🛼', '🚁', '🛸', '✈️', '🛩️', '🛫', '🛬', '🪂', '💺', '🚀', '🛰️'
];

interface IconPickerPopoverProps {
  children: React.ReactNode;
  onIconSelect: (icon: string, type: 'lucide' | 'emoji') => void;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function IconPickerPopover({ 
  children, 
  onIconSelect, 
  open, 
  onOpenChange 
}: IconPickerPopoverProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'icons' | 'emojis'>('icons');

  // Comprehensive icon search mapping for semantic terms
  const iconSearchMap: { [key: string]: string[] } = {
    // Alerts and notifications
    'warning': ['AlertTriangle', 'AlertCircle'],
    'alert': ['AlertTriangle', 'AlertCircle', 'Bell'],
    'danger': ['AlertTriangle'],
    'error': ['AlertCircle', 'X'],
    'info': ['Info', 'AlertCircle'],
    'notification': ['Bell'],
    
    // Navigation and arrows
    'arrow': ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'],
    'up': ['ArrowUp', 'ChevronUp'],
    'down': ['ArrowDown', 'ChevronDown'],
    'left': ['ArrowLeft', 'ChevronLeft'],
    'right': ['ArrowRight', 'ChevronRight'],
    'back': ['ArrowLeft', 'ChevronLeft'],
    'forward': ['ArrowRight', 'ChevronRight'],
    'next': ['ArrowRight', 'ChevronRight'],
    'previous': ['ArrowLeft', 'ChevronLeft'],
    
    // Actions
    'add': ['Plus'],
    'create': ['Plus'],
    'new': ['Plus'],
    'remove': ['Minus', 'X', 'Trash2'],
    'delete': ['Trash2', 'X'],
    'edit': ['Edit', 'Settings'],
    'save': ['Save'],
    'download': ['Download'],
    'upload': ['Upload'],
    'copy': ['Copy'],
    'share': ['Share'],
    'send': ['Send'],
    'refresh': ['Refresh'],
    'search': ['Search'],
    'filter': ['Filter'],
    'settings': ['Settings'],
    'config': ['Settings'],
    'gear': ['Settings'],
    'menu': ['Menu', 'MoreHorizontal', 'MoreVertical'],
    'close': ['X'],
    'check': ['Check'],
    'ok': ['Check'],
    'done': ['Check'],
    'yes': ['Check'],
    
    // Media and content
    'play': ['Play'],
    'pause': ['Pause'],
    'stop': ['Square'],
    'music': ['Music'],
    'sound': ['Volume2'],
    'video': ['Video'],
    'image': ['Image'],
    'photo': ['Camera', 'Image'],
    'camera': ['Camera'],
    'file': ['File'],
    'folder': ['Folder'],
    'document': ['File'],
    
    // Communication
    'email': ['Mail'],
    'mail': ['Mail'],
    'message': ['MessageSquare'],
    'chat': ['MessageSquare'],
    'phone': ['Phone'],
    'call': ['Phone'],
    
    // Interface elements
    'home': ['Home'],
    'house': ['Home'],
    'user': ['User'],
    'users': ['Users'],
    'person': ['User'],
    'people': ['Users'],
    'profile': ['User'],
    'account': ['User'],
    'lock': ['Lock'],
    'unlock': ['Lock'],
    'secure': ['Lock', 'Shield'],
    'security': ['Shield', 'Lock'],
    'key': ['Key'],
    'password': ['Key', 'Lock'],
    
    // Time and calendar
    'time': ['Clock'],
    'clock': ['Clock'],
    'calendar': ['Calendar'],
    'date': ['Calendar'],
    'schedule': ['Calendar'],
    
    // Weather and nature
    'sun': ['Sun'],
    'moon': ['Moon'],
    'star': ['Star'],
    'cloud': ['Cloud'],
    'weather': ['Cloud', 'Sun'],
    
    // Technology
    'computer': ['Monitor'],
    'laptop': ['Monitor'],
    'screen': ['Monitor'],
    'wifi': ['Wifi'],
    'internet': ['Wifi'],
    'network': ['Wifi'],
    'power': ['Power'],
    'battery': ['Power'],
    'printer': ['Printer'],
    'print': ['Printer'],
    
    // Shopping and business
    'shop': ['ShoppingCart'],
    'cart': ['ShoppingCart'],
    'buy': ['ShoppingCart'],
    'purchase': ['ShoppingCart'],
    'money': ['ShoppingCart'],
    'package': ['Package'],
    'box': ['Package'],
    'gift': ['Gift'],
    'present': ['Gift'],
    
    // Shapes and geometry
    'circle': ['Circle'],
    'round': ['Circle'],
    'square': ['Square'],
    'triangle': ['AlertTriangle'],
    
    // Miscellaneous
    'help': ['Info'],
    'question': ['Info'],
    'support': ['Info'],
    'more': ['MoreHorizontal', 'MoreVertical'],
    'options': ['MoreHorizontal', 'Settings'],
    'tools': ['Settings'],
    'bookmark': ['Flag'],
    'flag': ['Flag'],
    'tag': ['Tag'],
    'label': ['Tag'],
    'list': ['List'],
    'grid': ['Grid'],
    'layout': ['Grid'],
    'zoom': ['Zoom'],
    'magnify': ['Search'],
    'inbox': ['Inbox'],
    'archive': ['Archive'],
    'truck': ['Truck'],
    'delivery': ['Truck'],
    'shipping': ['Truck'],
    'target': ['Target'],
    'aim': ['Target'],
    'goal': ['Target']
  };

  // Filter Lucide icons based on search with semantic mapping
  const filteredLucideIcons = useMemo(() => {
    console.log('Filtering icons, searchTerm:', searchTerm, 'FINAL_LUCIDE_ICONS length:', FINAL_LUCIDE_ICONS.length);
    if (!searchTerm) return FINAL_LUCIDE_ICONS;
    
    const searchLower = searchTerm.toLowerCase().trim();
    
    // Find direct name matches
    const nameMatches = FINAL_LUCIDE_ICONS.filter(iconName => {
      const iconLower = iconName.toLowerCase();
      return iconLower.includes(searchLower);
    });
    
    // Find semantic matches
    const semanticMatches = Object.keys(iconSearchMap)
      .filter(term => term.includes(searchLower) || term.startsWith(searchLower))
      .flatMap(term => iconSearchMap[term])
      .filter(iconName => FINAL_LUCIDE_ICONS.includes(iconName));
    
    // Combine and deduplicate
    const allMatches = Array.from(new Set([...nameMatches, ...semanticMatches]));
    
    console.log('Filtered icons count:', allMatches.length, 'sample:', allMatches.slice(0, 5), 'semantic matches:', semanticMatches.length);
    return allMatches;
  }, [searchTerm]);

  // Filter emojis based on search with basic emoji name mapping
  const filteredEmojis = useMemo(() => {
    if (!searchTerm) return ALL_EMOJIS;
    
    const searchLower = searchTerm.toLowerCase().trim();
    
    // Comprehensive emoji search mapping with semantic terms
    const emojiMap: { [key: string]: string[] } = {
      // Faces and emotions
      'smile': ['😀', '😃', '😄', '😁', '😆', '😅', '😊', '🙂', '🙃', '😉'],
      'happy': ['😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣', '😊', '😇', '🙂', '🙃', '😉', '🎉', '🥳'],
      'face': ['😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣', '😊', '😇', '🙂', '🙃', '😉', '😌', '😍', '🥰', '😘'],
      'laugh': ['😂', '🤣', '😆', '😄'],
      'joy': ['😂', '🤣', '😊', '😁', '🎉'],
      'grin': ['😀', '😃', '😄', '😁'],
      'wink': ['😉', '🙃'],
      'sad': ['😢', '😭', '😞', '😔', '😟', '😕', '🙁', '☹️', '😣', '😖', '😫', '😩', '🥺'],
      'cry': ['😢', '😭', '🥺'],
      'tear': ['😢', '😭'],
      'love': ['😍', '🥰', '😘', '😗', '😙', '😚', '❤️', '💖', '💕', '💓', '💗', '💘', '💝'],
      'kiss': ['😘', '😗', '😙', '😚', '💋'],
      'angry': ['😠', '😡', '🤬', '😤', '💢'],
      'mad': ['😠', '😡', '🤬'],
      'heart': ['❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💕', '💞', '💓', '💗', '💖', '💘', '💝'],
      'red': ['❤️', '🔴', '🌹'],
      'blue': ['💙', '🔵'],
      'yellow': ['💛', '🟡', '🌞'],
      'green': ['💚', '🟢', '🌱'],
      'purple': ['💜', '🟣'],
      
      // Animals and nature
      'animal': ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯', '🦁', '🐮', '🐷', '🐸', '🐵'],
      'dog': ['🐶', '🐕', '🦮', '🐕‍🦺'],
      'puppy': ['🐶'],
      'cat': ['🐱', '🐈', '🐈‍⬛'],
      'kitten': ['🐱'],
      'bear': ['🐻', '🐼'],
      'panda': ['🐼'],
      'fox': ['🦊'],
      'lion': ['🦁'],
      'tiger': ['🐯'],
      'monkey': ['🐵'],
      'mouse': ['🐭'],
      'rabbit': ['🐰'],
      'bunny': ['🐰'],
      'frog': ['🐸'],
      'pig': ['🐷'],
      'cow': ['🐮'],
      
      // Food and drink
      'food': ['🍏', '🍎', '🍐', '🍊', '🍋', '🍌', '🍉', '🍇', '🍓', '🍞', '🥖', '🧀', '🍗', '🍖', '🍔', '🍟', '🍕'],
      'fruit': ['🍏', '🍎', '🍐', '🍊', '🍋', '🍌', '🍉', '🍇', '🍓'],
      'apple': ['🍏', '🍎'],
      'banana': ['🍌'],
      'orange': ['🍊'],
      'grape': ['🍇'],
      'strawberry': ['🍓'],
      'pizza': ['🍕'],
      'burger': ['🍔'],
      'fries': ['🍟'],
      'bread': ['🍞', '🥖'],
      'cheese': ['🧀'],
      'meat': ['🍗', '🍖'],
      'chicken': ['🍗'],
      'coffee': ['☕'],
      'drink': ['☕', '🥤', '🍺', '🍷'],
      
      // Technology
      'tech': ['⌚', '📱', '📲', '💻', '⌨️', '🖥️', '🖨️', '📷', '📹', '🎥', '📞', '☎️', '📺', '📻'],
      'computer': ['💻', '🖥️', '⌨️'],
      'laptop': ['💻'],
      'phone': ['📱', '📞', '☎️'],
      'mobile': ['📱'],
      'camera': ['📷', '📹', '🎥'],
      'tv': ['📺'],
      'radio': ['📻'],
      'watch': ['⌚'],
      'keyboard': ['⌨️'],
      'printer': ['🖨️'],
      
      // Tools and objects
      'tool': ['🔧', '🔨', '⚙️', '🔩', '🪚', '🛠️', '⚒️', '🪓', '🔪'],
      'hammer': ['🔨', '⚒️'],
      'wrench': ['🔧'],
      'saw': ['🪚'],
      'knife': ['🔪'],
      'axe': ['🪓'],
      'gear': ['⚙️'],
      'screw': ['🔩'],
      
      // Nature and weather
      'star': ['⭐', '🌟', '✨', '💫', '🌠'],
      'sun': ['☀️', '🌞'],
      'moon': ['🌙', '🌛', '🌜'],
      'fire': ['🔥'],
      'flame': ['🔥'],
      'hot': ['🔥'],
      'cloud': ['☁️', '⛅'],
      'rain': ['🌧️', '☔'],
      'snow': ['❄️', '☃️'],
      'lightning': ['⚡'],
      'tree': ['🌳', '🌲'],
      'flower': ['🌸', '🌺', '🌻', '🌹'],
      'rose': ['🌹'],
      'plant': ['🌱', '🪴'],
      
      // Transportation
      'car': ['🚗', '🚕', '🚙'],
      'truck': ['🚚', '🚛'],
      'bus': ['🚌', '🚐'],
      'plane': ['✈️', '🛩️'],
      'airplane': ['✈️', '🛩️'],
      'train': ['🚂', '🚄', '🚅'],
      'bike': ['🚲'],
      'bicycle': ['🚲'],
      'boat': ['⛵', '🚤'],
      'ship': ['🚢'],
      
      // Sports and activities
      'ball': ['⚽', '🏀', '🏈', '⚾', '🎾'],
      'football': ['⚽', '🏈'],
      'soccer': ['⚽'],
      'basketball': ['🏀'],
      'tennis': ['🎾'],
      'baseball': ['⚾'],
      'sport': ['⚽', '🏀', '🏈', '⚾', '🎾'],
      
      // Objects and symbols
      'book': ['📚', '📖', '📕', '📗', '📘', '📙'],
      'money': ['💰', '💵', '💴', '💶', '💷'],
      'gift': ['🎁'],
      'present': ['🎁'],
      'key': ['🔑', '🗝️'],
      'lock': ['🔒', '🔓'],
      'clock': ['🕐', '⏰', '⏱️'],
      'time': ['🕐', '⏰', '⏱️'],
      'calendar': ['📅', '📆'],
      'mail': ['📧', '📨', '📩'],
      'email': ['📧'],
      'message': ['💬', '💭'],
      'flag': ['🏳️', '🏴', '🚩'],
      'trophy': ['🏆'],
      'medal': ['🥇', '🥈', '🥉'],
      'crown': ['👑'],
      'diamond': ['💎'],
      'gem': ['💎']
    };
    
    // Find category matches
    const categoryMatches = Object.keys(emojiMap)
      .filter(category => category.includes(searchLower) || category.startsWith(searchLower))
      .flatMap(category => emojiMap[category]);
    
    // Find direct emoji matches (for single emoji searches)
    const directMatches = ALL_EMOJIS.filter(emoji => emoji.includes(searchTerm));
    
    // Combine and deduplicate
    const combinedMatches = [...categoryMatches, ...directMatches];
    const uniqueMatches = Array.from(new Set(combinedMatches));
    
    console.log('Emoji search for:', searchTerm, 'found:', uniqueMatches.length, 'matches', 'sample:', uniqueMatches.slice(0, 5));
    return uniqueMatches;
  }, [searchTerm]);

  const handleIconClick = (iconName: string, type: 'lucide' | 'emoji') => {
    onIconSelect(iconName, type);
    onOpenChange?.(false);
  };

  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>
        {children}
      </PopoverTrigger>
      <PopoverContent 
        className="w-96 p-4" 
        align="start"
        onWheel={(e) => e.stopPropagation()}
      >
        <div className="space-y-4">
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search icons & emojis..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Tabs with match counts */}
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'icons' | 'emojis')}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="icons">
                Icons{searchTerm ? ` (${filteredLucideIcons.length})` : ''}
              </TabsTrigger>
              <TabsTrigger value="emojis">
                Emojis{searchTerm ? ` (${filteredEmojis.length})` : ''}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="icons" className="mt-4">
              <ScrollArea 
                className="h-80"
                onWheel={(e) => e.stopPropagation()}
              >
                <div className="grid grid-cols-6 gap-2">
                  {filteredLucideIcons.length === 0 ? (
                    <div className="col-span-6 text-center text-gray-500 py-4">
                      No icons found
                    </div>
                  ) : (
                    filteredLucideIcons.map((iconName) => {
                      const IconComponent = (LucideIcons as any)[iconName];
                      if (!IconComponent) {
                        console.log('Missing icon component for:', iconName);
                        return null;
                      }
                      
                      return (
                        <Button
                          key={iconName}
                          variant="ghost"
                          size="sm"
                          className="h-12 w-12 p-0 hover:bg-gray-100"
                          onClick={() => handleIconClick(iconName, 'lucide')}
                          title={iconName}
                        >
                          <IconComponent className="h-5 w-5 text-gray-600" />
                        </Button>
                      );
                    })
                  )}
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="emojis" className="mt-4">
              <ScrollArea 
                className="h-80"
                onWheel={(e) => e.stopPropagation()}
              >
                <div className="grid grid-cols-6 gap-2">
                  {filteredEmojis.map((emoji, index) => (
                    <Button
                      key={`emoji-${index}`}
                      variant="ghost"
                      size="sm"
                      className="h-12 w-12 p-0 hover:bg-gray-100"
                      onClick={() => handleIconClick(emoji, 'emoji')}
                    >
                      <span className="text-lg">{emoji}</span>
                    </Button>
                  ))}
                </div>
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </div>
      </PopoverContent>
    </Popover>
  );
}