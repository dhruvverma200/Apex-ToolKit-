import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Search, FileText, Image as ImageIcon, QrCode, Type, Percent, RefreshCw,
  Minimize2, Layers, Download, Upload, Trash2, ArrowUp, ArrowDown, Check,
  AlertCircle, Shield, Zap, Globe, Menu, X, ChevronRight,
  Copy, Sparkles, CheckCircle2,
  Sliders, BookOpen, Terminal, Play, Settings, ArrowLeft,
  Scissors, RotateCw, RotateCcw, FlipHorizontal, FlipVertical, Key,
  Braces, CaseSensitive, Binary, Calendar, Landmark, Scale, Palette,
  GitCompare, Fingerprint, Code2, UserSquare2, Stamp, HeartPulse, Receipt,
  Timer, Wand2, FileCheck2, Flame, Crop, Eraser, Sparkle,
  LogIn, LogOut, User as UserIcon, Clock, Cloud, History, Share2, Eye,
  Video
} from 'lucide-react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged, signOut, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { getFirestore, collection, addDoc, query, onSnapshot, orderBy, serverTimestamp } from 'firebase/firestore';

let app: any, auth: any, db: any;
const appId = typeof __app_id !== 'undefined' ? __app_id : 'apextoolkit-pro-v1';
try {
  if (typeof __firebase_config !== 'undefined' && __firebase_config) {
    const firebaseConfig = JSON.parse(__firebase_config);
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
  }
} catch (e) {
  console.log('Firebase init notice:', e);
}

export interface SiteConfig {
  siteName: string;
  siteUrl: string;
  supportEmail: string;
  adsense: {
    enabled: boolean;
    publisherId: string;
    headerSlotId: string;
    sidebarSlotId: string;
    inArticleSlotId: string;
  };
}

const DEFAULT_SITE_CONFIG: SiteConfig = {
  siteName: 'ApexToolkit Pro',
  siteUrl: 'https://apextoolkit.pages.dev',
  supportEmail: 'support@apextoolkit.pages.dev',
  adsense: {
    enabled: false,
    publisherId: 'ca-pub-XXXXXXXXXXXXXXXX',
    headerSlotId: '1234567890',
    sidebarSlotId: '0987654321',
    inArticleSlotId: '1122334455',
  },
};

declare global {
  interface Window {
    PDFLib: any;
    pdfjsLib: any;
    QRCode: any;
    adsbygoogle: any[];
  }
}

const loadedScripts: Record<string, Promise<void>> = {};

function loadExternalScript(src: string, globalName: string): Promise<any> {
  if (typeof window !== 'undefined' && (window as any)[globalName]) {
    return Promise.resolve((window as any)[globalName]);
  }
  if (!loadedScripts[src]) {
    loadedScripts[src] = new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = src;
      script.async = true;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error(`Failed to load library from ${src}`));
      document.head.appendChild(script);
    });
  }
  return loadedScripts[src].then(() => (window as any)[globalName]);
}

async function ensurePdfLib() {
  return loadExternalScript(
    'https://cdnjs.cloudflare.com/ajax/libs/pdf-lib/1.17.1/pdf-lib.min.js',
    'PDFLib'
  );
}

async function ensureQRCode() {
  return loadExternalScript(
    'https://cdnjs.cloudflare.com/ajax/libs/qrcode/1.5.1/qrcode.min.js',
    'QRCode'
  );
}

function triggerDownload(url: string, filename: string) {
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

function formatBytes(bytes: number) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export type ToolCategory =
  | 'All'
  | 'PDF Tools'
  | 'Image Tools'
  | 'Text & Calculators'
  | 'Developer & Security'
  | 'Generators'
  | 'Daily Essentials';

export interface ToolFAQ {
  q: string;
  a: string;
}

export interface ToolDefinition {
  id: string;
  slug: string;
  name: string;
  shortDesc: string;
  category: Exclude<ToolCategory, 'All'>;
  popular?: boolean;
  featured?: boolean;
  badge?: string;
  seoTitle: string;
  seoDescription: string;
  keywords: string[];
  howItWorks: string[];
  guideTitle: string;
  guideParagraphs: string[];
  faqs: ToolFAQ[];
}

export const TOOLS: ToolDefinition[] = [
  {
    id: 'image-compressor',
    slug: '/image-compressor',
    name: '🔥 Image Compressor (KB / MB)',
    shortDesc: 'Compress JPG & PNG to exact KB or MB limits (e.g. 20KB, 50KB) for exams and portals.',
    category: 'Image Tools',
    popular: true,
    featured: true,
    badge: '#1 Hype Tool',
    seoTitle: 'Compress Image to 20KB, 50KB or Custom KB/MB Online | ApexToolkit Pro',
    seoDescription: 'Shrink JPG and PNG images to exact KB or MB file sizes instantly in your browser with zero server uploads.',
    keywords: ['compress image to 50kb', 'image size reducer', 'compress jpg to kb', 'reduce photo file size'],
    howItWorks: ['Upload any JPG, PNG or WEBP image.', 'Enter your exact target KB or MB limit (e.g., 50 KB).', 'Click compress and download your optimized image instantly.'],
    guideTitle: 'Compressing Photos to Exact KB Limits for Government Portals',
    guideParagraphs: ['Exam application portals and university upload forms frequently enforce strict file size limits such as "Maximum 50 KB". Our compressor automatically iterates down resolution and quality until your image fits.'],
    faqs: [{ q: 'Can I set an exact target like 20 KB or 50 KB?', a: 'Yes! Enter your desired size in KB and our engine iterates automatically.' }]
  },
  {
    id: 'unit-converter',
    slug: '/unit-converter',
    name: '📐 Universal Unit & Land Converter (Bigha, Feet, Meter, Kadi)',
    shortDesc: 'Convert any unit to any unit: feet to bigha, bigha to feet, meter to cm, kadi to feet, and more.',
    category: 'Text & Calculators',
    popular: true,
    featured: true,
    badge: 'Land & Math',
    seoTitle: 'Universal Unit & Land Area Converter (Bigha to Feet, Meter to CM) | ApexToolkit Pro',
    seoDescription: 'Convert land area, length, weight and temperature units instantly. Feet to Bigha, Kadi, Meter, Centimeter, Acre, and more.',
    keywords: ['bigha to feet converter', 'kadi to feet', 'meter to cm', 'land area converter'],
    howItWorks: ['Select measurement type (Land Area, Length, Weight, Temperature).', 'Enter value and select From / To units.', 'View instant bidirectional conversions.'],
    guideTitle: 'Understanding Land Measurements: Bigha, Kadi, Feet and Meters',
    guideParagraphs: ['Land measurements vary by region, making quick conversions between Bigha, Acres, Square Feet, and Kadis essential for property verification and mapping.'],
    faqs: [{ q: 'Can I convert Bigha to Square Feet?', a: 'Yes! Our tool supports regional land measurements including Bigha, Biswa, Acres, Square Feet, Meters, and Kadis.' }]
  },
  {
    id: 'jpg-to-png',
    slug: '/jpg-to-png',
    name: 'JPG to PNG Converter',
    shortDesc: 'Convert JPG images to lossless PNG format instantly in your browser.',
    category: 'Image Tools',
    popular: true,
    featured: true,
    badge: 'Lossless',
    seoTitle: 'JPG to PNG Converter Online - Free & Secure | ApexToolkit Pro',
    seoDescription: 'Convert JPG images to high-quality PNG format instantly without uploading to servers.',
    keywords: ['jpg to png', 'convert jpg to png online'],
    howItWorks: ['Upload your JPG image.', 'Preview the rendered lossless image.', 'Download PNG instantly.'],
    guideTitle: 'Converting JPG to PNG Losslessly',
    guideParagraphs: ['PNG format supports lossless compression and transparency.'],
    faqs: [{ q: 'Is my photo uploaded to any server?', a: 'No, conversion happens locally in browser memory.' }]
  },
  {
    id: 'png-to-jpg',
    slug: '/png-to-jpg',
    name: 'PNG to JPG Converter',
    shortDesc: 'Convert PNG images to compressed JPG format with background color selection.',
    category: 'Image Tools',
    popular: true,
    featured: true,
    badge: 'Compressed',
    seoTitle: 'PNG to JPG Converter Online - Free | ApexToolkit Pro',
    seoDescription: 'Convert transparent PNG images to JPG format with white background fill.',
    keywords: ['png to jpg', 'convert png to jpg'],
    howItWorks: ['Upload PNG image.', 'Convert with white background fill.', 'Download JPG.'],
    guideTitle: 'Converting PNG to JPG for Portals',
    guideParagraphs: ['Many application portals reject transparent PNG files and require standard JPEGs.'],
    faqs: [{ q: 'What happens to transparent areas?', a: 'Transparent pixels are filled with a clean white background.' }]
  },
  {
    id: 'pdf-splitter',
    slug: '/pdf-splitter',
    name: 'PDF Splitter & Page Extractor',
    shortDesc: 'Extract specific page ranges from any PDF document into a new PDF.',
    category: 'PDF Tools',
    popular: true,
    featured: true,
    badge: 'Page Extract',
    seoTitle: 'Free Online PDF Splitter - Extract PDF Pages | ApexToolkit Pro',
    seoDescription: 'Split multi-page PDF documents and extract custom page ranges securely in your browser.',
    keywords: ['pdf splitter', 'extract pdf pages', 'split pdf online'],
    howItWorks: ['Upload your PDF file.', 'Specify page numbers or ranges (e.g., 1-3, 5).', 'Click split and download.'],
    guideTitle: 'How to Extract Specific Pages from Large PDFs',
    guideParagraphs: ['Splitting large PDF documents allows you to share only relevant pages.'],
    faqs: [{ q: 'Can I extract non-consecutive pages?', a: 'Yes, specify page numbers separated by commas.' }]
  },
  {
    id: 'pdf-rotator',
    slug: '/pdf-rotator',
    name: 'PDF Page Rotator',
    shortDesc: 'Rotate PDF pages 90°, 180°, or 270° instantly.',
    category: 'PDF Tools',
    popular: true,
    featured: true,
    badge: 'Rotate',
    seoTitle: 'Free Online PDF Page Rotator | ApexToolkit Pro',
    seoDescription: 'Rotate individual or all pages of a PDF document securely.',
    keywords: ['rotate pdf', 'pdf page rotator'],
    howItWorks: ['Upload PDF document.', 'Select rotation angle (90°, 180°, 270°).', 'Save and download.'],
    guideTitle: 'Fixing Scanned Upside-Down PDF Pages',
    guideParagraphs: ['Correct orientation for scanned documents in seconds.'],
    faqs: [{ q: 'Can I rotate all pages at once?', a: 'Yes, select global rotation or individual page rotation.' }]
  },
  {
    id: 'image-format-converter',
    slug: '/image-format-converter',
    name: 'Image Format Converter (WEBP / JPG / PNG)',
    shortDesc: 'Convert any image between WEBP, PNG, and JPG formats.',
    category: 'Image Tools',
    popular: true,
    featured: true,
    badge: 'Multi-Format',
    seoTitle: 'Image Format Converter Online (WEBP, PNG, JPG) | ApexToolkit Pro',
    seoDescription: 'Batch convert image formats between WEBP, PNG, and JPEG instantly in browser.',
    keywords: ['image format converter', 'webp to jpg', 'png to webp'],
    howItWorks: ['Upload image.', 'Select target format.', 'Download converted file.'],
    guideTitle: 'Choosing the Right Image Format',
    guideParagraphs: ['WEBP offers superior compression, while JPEG and PNG ensure universal compatibility.'],
    faqs: [{ q: 'What formats are supported?', a: 'WEBP, PNG, JPEG, and BMP.' }]
  },
  {
    id: 'pdf-merger',
    slug: '/pdf-merger',
    name: 'PDF Merger',
    shortDesc: 'Combine multiple PDF documents into a single organized file in seconds.',
    category: 'PDF Tools',
    popular: true,
    badge: '100% Local',
    seoTitle: 'Free Online PDF Merger - Combine PDF Files Locally | ApexToolkit Pro',
    seoDescription: 'Merge multiple PDF files into one document directly in your browser without server uploads.',
    keywords: ['merge pdf', 'combine pdf', 'pdf merger free'],
    howItWorks: ['Select or drag and drop two or more PDF files into the upload zone.', 'Click "Merge PDFs Now" to combine and download.'],
    guideTitle: 'How Client-Side PDF Merging Protects Your Privacy',
    guideParagraphs: ['Traditional online PDF mergers require uploading sensitive documents to remote servers. Our PDF Merger uses pdf-lib directly inside your browser memory.'],
    faqs: [{ q: 'Is there a limit to how many PDF files I can merge?', a: 'You can combine as many PDF files as your device memory allows.' }]
  },
  {
    id: 'qr-code-generator',
    slug: '/qr-code-generator',
    name: 'QR Code Generator',
    shortDesc: 'Create customizable, high-resolution QR codes for URLs, Wi-Fi, text, and vCards.',
    category: 'Generators',
    popular: true,
    badge: 'Instant PNG',
    seoTitle: 'Free Custom QR Code Generator - No Expiration, High-Res PNG | ApexToolkit Pro',
    seoDescription: 'Generate static QR codes for links, text, or Wi-Fi. Customize colors and download PNG.',
    keywords: ['qr code generator', 'free qr code maker', 'custom qr code'],
    howItWorks: ['Enter any URL or text into the content box.', 'Download crisp PNG image.'],
    guideTitle: 'Static vs. Dynamic QR Codes: Why Our QR Codes Never Expire',
    guideParagraphs: ['Many QR code websites generate dynamic redirect links that expire after a trial.'],
    faqs: [{ q: 'Do these QR codes ever expire?', a: 'Never. They are direct static QR codes.' }]
  },
  {
    id: 'word-counter',
    slug: '/word-counter',
    name: 'Word Counter',
    shortDesc: 'Count words, characters, sentences, paragraphs, reading time, and keyword density.',
    category: 'Text & Calculators',
    popular: true,
    seoTitle: 'Online Word Counter & Character Count Tool | ApexToolkit Pro',
    seoDescription: 'Real-time word counter, character counter, sentence analyzer, and keyword density tool.',
    keywords: ['word counter', 'character counter', 'keyword density checker'],
    howItWorks: ['Type or paste your article into the text editor.', 'View instant live metrics for words, characters, and reading time.'],
    guideTitle: 'Mastering Word Counts & Character Limits',
    guideParagraphs: ['Accurate text metrics save time during editing for essays, meta descriptions, or speeches.'],
    faqs: [{ q: 'How is reading time calculated?', a: 'Based on average silent reading speed of 200 words per minute.' }]
  },
  {
    id: 'percentage-calculator',
    slug: '/percentage-calculator',
    name: 'Percentage Calculator',
    shortDesc: 'Calculate percentages, percentage increase/decrease, discounts, and ratios effortlessly.',
    category: 'Text & Calculators',
    popular: true,
    seoTitle: 'Free Percentage Calculator - % of Number, Increase & Change | ApexToolkit Pro',
    seoDescription: 'Solve percentage problems instantly: What is X% of Y, percentage increase, and discounts.',
    keywords: ['percentage calculator', 'calculate percent', 'percentage increase calculator'],
    howItWorks: ['Enter values into any interactive calculator card.', 'Formulas and results update automatically as you type.'],
    guideTitle: 'Essential Percentage Formulas Explained Simply',
    guideParagraphs: ['From calculating sales tax to measuring revenue growth, percentages appear in daily finance tasks.'],
    faqs: [{ q: 'How do you calculate percentage increase?', a: '((New - Old) / |Old|) x 100.' }]
  },
  {
    id: 'gst-discount-calculator',
    slug: '/gst-discount-calculator',
    name: 'GST, Sales Tax & Shopping Discount Calculator',
    shortDesc: 'Add or remove GST/Tax and calculate shopping discounts with CGST/SGST split.',
    category: 'Text & Calculators',
    popular: true,
    badge: 'Billing',
    seoTitle: 'Online GST Calculator (Inclusive/Exclusive) & Discount Calculator | ApexToolkit Pro',
    seoDescription: 'Calculate GST inclusive and exclusive prices with automatic CGST/SGST breakdown.',
    keywords: ['gst calculator', 'reverse gst calculator', 'cgst sgst calculator'],
    howItWorks: ['Enter base amount and optional shopping discount.', 'Choose Add GST or Remove GST and select tax rate.', 'View invoice summary with CGST + SGST split.'],
    guideTitle: 'How to Calculate GST Exclusive vs. GST Inclusive (Reverse Tax)',
    guideParagraphs: ['Extracting pre-tax base amounts from MRP retail receipts requires reverse tax calculation.'],
    faqs: [{ q: 'What is the formula for removing GST?', a: 'Base Amount = Inclusive Price / (1 + (GST% / 100)).' }]
  },
  {
    id: 'emi-calculator',
    slug: '/emi-calculator',
    name: 'Loan & EMI Calculator',
    shortDesc: 'Calculate monthly loan EMI, total interest payable, visual breakdown, and amortization schedule.',
    category: 'Text & Calculators',
    popular: true,
    badge: 'Finance',
    seoTitle: 'Loan & Mortgage EMI Calculator with Amortization Table | ApexToolkit Pro',
    seoDescription: 'Calculate Equated Monthly Installment (EMI) for home or car loans with amortization table.',
    keywords: ['emi calculator', 'loan calculator', 'mortgage calculator'],
    howItWorks: ['Enter Loan Principal, Interest Rate, and Tenure.', 'Inspect Monthly EMI, Total Interest, and Amortization Schedule.'],
    guideTitle: 'Understanding Loan Amortization & How to Save on Interest',
    guideParagraphs: ['An EMI keeps monthly payments fixed, but the internal principal vs. interest split changes monthly.'],
    faqs: [{ q: 'What formula is used for EMI?', a: 'Reducing-balance formula: EMI = P x r x (1 + r)^n / ((1 + r)^n - 1).' }]
  },
  {
    id: 'bmi-calorie-calculator',
    slug: '/bmi-calorie-calculator',
    name: 'BMI, BMR & Daily Calorie Calculator',
    shortDesc: 'Calculate Body Mass Index (BMI), Basal Metabolic Rate (BMR), and TDEE calories.',
    category: 'Text & Calculators',
    popular: true,
    badge: 'Health',
    seoTitle: 'BMI, BMR & Daily Calorie (TDEE) Calculator | ApexToolkit Pro',
    seoDescription: 'Calculate Body Mass Index, healthy weight range, BMR, and daily calorie targets.',
    keywords: ['bmi calculator', 'calorie calculator', 'bmr calculator', 'tdee calculator'],
    howItWorks: ['Enter age, gender, height, weight, and activity level.', 'View BMI score, healthy weight range, and daily calorie targets.'],
    guideTitle: 'Understanding BMI, Mifflin-St Jeor BMR & TDEE Calories',
    guideParagraphs: ['BMI provides a quick screening ratio of weight to height, while BMR measures calories burned at rest.'],
    faqs: [{ q: 'What is a normal healthy BMI?', a: 'According to WHO standards, BMI between 18.5 and 24.9 is Normal Weight.' }]
  },
  {
    id: 'age-calculator',
    slug: '/age-calculator',
    name: 'Age & Date Difference Calculator',
    shortDesc: 'Calculate exact chronological age in years, months, days, total weeks, hours, and next birthday.',
    category: 'Text & Calculators',
    popular: true,
    seoTitle: 'Exact Age Calculator & Date Difference Tool | ApexToolkit Pro',
    seoDescription: 'Calculate exact age in years, months, and days between any two dates with birthday countdown.',
    keywords: ['age calculator', 'date difference calculator', 'how old am i'],
    howItWorks: ['Select your Date of Birth and Target Date.', 'View exact breakdown in Years, Months, Days, and next birthday.'],
    guideTitle: 'How Calendar Leap Years & Month Lengths Affect Date Math',
    guideParagraphs: ['Calculating duration between dates is trickier than dividing by 365 because months vary and leap years add Feb 29.'],
    faqs: [{ q: 'Does this account for leap years?', a: 'Yes, every leap year is factored into the exact day count.' }]
  },
  {
    id: 'tip-calculator',
    slug: '/tip-calculator',
    name: 'Tip & Bill Splitter Calculator',
    shortDesc: 'Calculate gratuity tips, split dinner bills evenly among friends, and compute tax.',
    category: 'Text & Calculators',
    popular: true,
    seoTitle: 'Restaurant Tip Calculator & Bill Splitter Online | ApexToolkit Pro',
    seoDescription: 'Quickly calculate restaurant tips and split total bill evenly across any number of people.',
    keywords: ['tip calculator', 'bill splitter calculator', 'restaurant tip percentage'],
    howItWorks: ['Enter bill subtotal amount.', 'Choose tip percentage or enter custom amount.', 'Enter number of people to see per-person shares.'],
    guideTitle: 'Fair Dining: How to Split Bills and Calculate Tips Accurately',
    guideParagraphs: ['Calculating tips and splitting restaurant checks after dinner can sometimes lead to confusion.'],
    faqs: [{ q: 'Should I calculate tip before or after tax?', a: 'Traditionally calculated on pre-tax bill amount, though total calculation is also common.' }]
  },
  {
    id: 'signature-generator',
    slug: '/signature-generator',
    name: 'Digital Signature Maker & Draw Pad',
    shortDesc: 'Draw a smooth digital signature with custom pen color and export as transparent PNG.',
    category: 'Daily Essentials',
    popular: true,
    featured: true,
    badge: 'New',
    seoTitle: 'Free Online Digital Signature Maker & Draw Pad | ApexToolkit Pro',
    seoDescription: 'Draw your signature online with mouse or touch. Export transparent PNG for PDFs.',
    keywords: ['signature maker online', 'draw signature', 'digital signature pad'],
    howItWorks: ['Draw your signature on touch canvas using mouse or finger.', 'Choose ink color and stroke width.', 'Download transparent PNG.'],
    guideTitle: 'Creating Professional Digital Signatures for Contracts',
    guideParagraphs: ['Signing digital PDFs requires a clean signature cutout without background paper artifacts.'],
    faqs: [{ q: 'Can I use this signature on official documents?', a: 'Yes, the exported PNG is transparent and high resolution.' }]
  },
  {
    id: 'password-generator',
    slug: '/password-generator',
    name: 'Password Generator & Strength Analyzer',
    shortDesc: 'Generate cryptographically secure passwords and analyze entropy bits.',
    category: 'Developer & Security',
    popular: true,
    badge: 'Web Crypto',
    seoTitle: 'Secure Password Generator & Entropy Strength Checker | ApexToolkit Pro',
    seoDescription: 'Generate strong random passwords using window.crypto.getRandomValues and test entropy.',
    keywords: ['password generator', 'random password maker', 'password strength checker'],
    howItWorks: ['Set password length and toggle character sets.', 'Copy your generated password or analyze entropy.'],
    guideTitle: 'Why Cryptographic Randomness & Entropy Matter',
    guideParagraphs: ['Human-chosen passwords follow predictable patterns that cracking rigs guess in seconds.'],
    faqs: [{ q: 'Are generated passwords stored anywhere?', a: 'Never. They are generated in local memory and vanish when you close the tab.' }]
  },
  {
    id: 'case-converter',
    slug: '/case-converter',
    name: 'Text Case Converter',
    shortDesc: 'Convert text between UPPERCASE, lowercase, Title Case, camelCase, snake_case, etc.',
    category: 'Text & Calculators',
    popular: true,
    seoTitle: 'Online Text Case Converter - UPPER, lower, Title, camelCase | ApexToolkit Pro',
    seoDescription: 'Transform text capitalization with one click: Sentence case, Title Case, camelCase, snake_case.',
    keywords: ['case converter', 'title case converter', 'camelcase converter'],
    howItWorks: ['Paste text into the editor.', 'Click any case transformation button.', 'Copy converted result.'],
    guideTitle: 'From Editorial Headlines to Programming Naming Conventions',
    guideParagraphs: ['Converting article titles into URL slugs (kebab-case) or database columns (snake_case) should be instant.'],
    faqs: [{ q: 'How does Title Case handle small words?', a: 'It capitalizes principal words while keeping minor prepositions lowercase.' }]
  }
];

export function ToolIcon({ id, className = 'w-6 h-6' }: { id: string; className?: string }) {
  switch (id) {
    case 'image-compressor': return <Flame className={className} />;
    case 'unit-converter': return <Scale className={className} />;
    case 'jpg-to-png': return <ImageIcon className={className} />;
    case 'png-to-jpg': return <ImageIcon className={className} />;
    case 'pdf-splitter': return <Scissors className={className} />;
    case 'pdf-rotator': return <RotateCw className={className} />;
    case 'image-format-converter': return <RefreshCw className={className} />;
    case 'pdf-merger': return <Layers className={className} />;
    case 'qr-code-generator': return <QrCode className={className} />;
    case 'word-counter': return <Type className={className} />;
    case 'percentage-calculator': return <Percent className={className} />;
    case 'gst-discount-calculator': return <Receipt className={className} />;
    case 'emi-calculator': return <Landmark className={className} />;
    case 'bmi-calorie-calculator': return <HeartPulse className={className} />;
    case 'age-calculator': return <Calendar className={className} />;
    case 'tip-calculator': return <Percent className={className} />;
    case 'signature-generator': return <Wand2 className={className} />;
    case 'password-generator': return <Key className={className} />;
    case 'case-converter': return <CaseSensitive className={className} />;
    default: return <Sparkles className={className} />;
  }
}

const AdSenseUnit: React.FC<{ config: SiteConfig; slotId: string; className?: string }> = ({
  config,
  slotId,
  className = '',
}) => {
  const isValidPublisher =
    config.adsense.enabled &&
    /^ca-pub-\d{10,20}$/.test(config.adsense.publisherId.trim()) &&
    /^\d{5,20}$/.test(slotId.trim());

  useEffect(() => {
    if (!isValidPublisher) return;
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch {}
  }, [isValidPublisher]);

  if (!isValidPublisher) return null;

  return (
    <div className={`my-4 overflow-hidden text-center ${className}`}>
      <ins
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client={config.adsense.publisherId.trim()}
        data-ad-slot={slotId.trim()}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </div>
  );
};

interface ToolBaseProps {
  user: any;
  db: any;
  toolName: string;
}

const ImageCompressorTool: React.FC<ToolBaseProps> = ({ user, db, toolName }) => {
  const [file, setFile] = useState<File | null>(null);
  const [targetKb, setTargetKb] = useState<string>('50');
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<{ url: string; originalSize: number; compressedSize: number } | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const loadSampleImage = () => {
    const c = document.createElement('canvas');
    c.width = 1600;
    c.height = 1200;
    const ctx = c.getContext('2d')!;
    ctx.fillStyle = '#3b82f6';
    ctx.fillRect(0, 0, 1600, 1200);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 64px sans-serif';
    ctx.fillText('ApexToolkit Pro Sample', 200, 600);
    c.toBlob((blob) => {
      if (blob) {
        const f = new File([blob], 'sample-photo.jpg', { type: 'image/jpeg' });
        setFile(f);
        setResult(null);
      }
    }, 'image/jpeg', 0.95);
  };

  const handleCompress = async () => {
    if (!file) return;
    setIsProcessing(true);
    try {
      const targetBytes = Math.max(5, parseFloat(targetKb) || 50) * 1024;
      const reader = new FileReader();
      reader.onload = async () => {
        const img = new Image();
        img.onload = async () => {
          let quality = 0.9;
          let scale = 1.0;

          const attempt = async () => {
            const canvas = document.createElement('canvas');
            canvas.width = Math.max(100, Math.floor(img.naturalWidth * scale));
            canvas.height = Math.max(100, Math.floor(img.naturalHeight * scale));
            const ctx = canvas.getContext('2d')!;
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

            canvas.toBlob(
              async (blob) => {
                if (!blob) {
                  setIsProcessing(false);
                  return;
                }
                if (blob.size > targetBytes && (quality > 0.1 || scale > 0.3)) {
                  if (quality > 0.2) {
                    quality -= 0.15;
                  } else {
                    scale -= 0.15;
                    quality = 0.7;
                  }
                  attempt();
                } else {
                  setIsProcessing(false);
                  const url = URL.createObjectURL(blob);
                  setResult({
                    url,
                    originalSize: file.size,
                    compressedSize: blob.size,
                  });

                  if (user && db) {
                    try {
                      await addDoc(collection(db, 'artifacts', appId, 'users', user.uid, 'history'), {
                        toolName,
                        fileName: file.name,
                        originalSize: file.size,
                        resultSize: blob.size,
                        timestamp: serverTimestamp(),
                      });
                    } catch {}
                  }
                }
              },
              'image/jpeg',
              quality
            );
          };
          attempt();
        };
        img.src = String(reader.result);
      };
      reader.readAsDataURL(file);
    } catch {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 text-white p-6 rounded-3xl shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <span className="px-3 py-1 bg-white/20 rounded-full text-xs font-black uppercase tracking-wider">#1 Most Popular Tool</span>
          <h2 className="text-xl sm:text-2xl font-black mt-2">Compress Photos to Exact KB / MB Instantly</h2>
          <p className="text-xs sm:text-sm text-white/90 mt-1">Shrink JPG and PNG images for exams, portals, and email attachments.</p>
        </div>
        <button
          type="button"
          onClick={loadSampleImage}
          className="w-full sm:w-auto px-5 py-3 rounded-2xl bg-white text-orange-700 font-extrabold text-xs shadow-lg hover:bg-slate-50 transition shrink-0"
        >
          Load Sample Photo
        </button>
      </div>

      <div
        onClick={() => inputRef.current?.click()}
        className="border-2 border-dashed border-orange-300 hover:border-orange-600 bg-orange-50/40 rounded-3xl p-6 sm:p-8 text-center cursor-pointer transition-all"
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => e.target.files?.[0] && setFile(e.target.files[0])}
        />
        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-amber-500 to-red-600 text-white flex items-center justify-center shadow-lg shadow-orange-500/30">
          <Flame className="w-8 h-8" />
        </div>
        <h3 className="text-base sm:text-lg font-black text-slate-900 break-all">{file ? file.name : 'Drop photo here or click to browse'}</h3>
        <p className="text-xs text-slate-500 mt-1">Supports JPG, PNG, WEBP • 100% Client-Side Private</p>
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); inputRef.current?.click(); }}
          className="mt-4 px-6 py-2.5 rounded-xl bg-orange-600 text-white text-xs font-bold shadow-md"
        >
          Select Image File
        </button>
      </div>

      {file && (
        <div className="space-y-4 bg-slate-50 p-6 rounded-3xl border">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <p className="text-xs font-bold text-slate-500">Original Size: <span className="text-slate-900">{formatBytes(file.size)}</span></p>
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <label className="text-xs font-bold text-slate-700 shrink-0">Target Size (KB):</label>
              <input
                type="number"
                value={targetKb}
                onChange={(e) => setTargetKb(e.target.value)}
                className="w-full sm:w-24 px-3 py-2 rounded-xl border bg-white font-bold text-sm text-center"
              />
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {['20', '50', '100', '200', '500'].map((kb) => (
              <button
                key={kb}
                type="button"
                onClick={() => setTargetKb(kb)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold ${targetKb === kb ? 'bg-orange-600 text-white' : 'bg-white border text-slate-700'}`}
              >
                {kb} KB Target
              </button>
            ))}
          </div>
          <button
            type="button"
            disabled={isProcessing}
            onClick={handleCompress}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-amber-500 to-red-600 text-white font-black text-base shadow-xl hover:opacity-95 transition"
          >
            {isProcessing ? 'Compressing Image...' : 'Compress Image Now'}
          </button>
        </div>
      )}

      {result && (
        <div className="p-6 rounded-3xl bg-emerald-50 border border-emerald-200 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <img src={result.url} alt="Compressed" className="w-16 h-16 object-cover rounded-xl border shrink-0" />
            <div>
              <p className="font-extrabold text-sm text-emerald-950">Compressed Successfully!</p>
              <p className="text-xs text-emerald-700 mt-0.5">
                {formatBytes(result.originalSize)} → <span className="font-black">{formatBytes(result.compressedSize)}</span> ({Math.round((1 - result.compressedSize / result.originalSize) * 100)}% smaller)
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => triggerDownload(result.url, 'compressed-image.jpg')}
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-emerald-600 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-md hover:bg-emerald-700 transition"
          >
            <Download className="w-4 h-4" /> Download Compressed Image
          </button>
        </div>
      )}
    </div>
  );
};

const UnitConverterTool: React.FC<ToolBaseProps> = ({ user, db, toolName }) => {
  const [val, setVal] = useState('1');
  const [category, setCategory] = useState<'land' | 'length' | 'weight' | 'temp'>('land');
  const [fromUnit, setFromUnit] = useState('bigha');
  const [toUnit, setToUnit] = useState('sqft');

  const handleCategoryChange = (newCat: 'land' | 'length' | 'weight' | 'temp') => {
    setCategory(newCat);
    if (newCat === 'land') {
      setFromUnit('bigha');
      setToUnit('sqft');
    } else if (newCat === 'length') {
      setFromUnit('m');
      setToUnit('ft');
    } else if (newCat === 'weight') {
      setFromUnit('kg');
      setToUnit('lb');
    } else if (newCat === 'temp') {
      setFromUnit('c');
      setToUnit('f');
    }
  };

  const converted = useMemo(() => {
    const v = parseFloat(val) || 0;
    if (category === 'land') {
      let sqft = v;
      if (fromUnit === 'bigha') sqft = v * 27225;
      else if (fromUnit === 'biswa') sqft = v * 1361.25;
      else if (fromUnit === 'acre') sqft = v * 43560;
      else if (fromUnit === 'hectare') sqft = v * 107639;
      else if (fromUnit === 'sqm') sqft = v * 10.7639;
      else if (fromUnit === 'sqyd') sqft = v * 9;
      else if (fromUnit === 'sqft') sqft = v;

      let res = sqft;
      if (toUnit === 'bigha') res = sqft / 27225;
      else if (toUnit === 'biswa') res = sqft / 1361.25;
      else if (toUnit === 'acre') res = sqft / 43560;
      else if (toUnit === 'hectare') res = sqft / 107639;
      else if (toUnit === 'sqm') res = sqft / 10.7639;
      else if (toUnit === 'sqyd') res = sqft / 9;
      else if (toUnit === 'sqft') res = sqft;
      return res.toFixed(4);
    } else if (category === 'length') {
      let meters = v;
      if (fromUnit === 'cm') meters = v / 100;
      else if (fromUnit === 'km') meters = v * 1000;
      else if (fromUnit === 'ft') meters = v * 0.3048;
      else if (fromUnit === 'inch') meters = v * 0.0254;
      else if (fromUnit === 'yard') meters = v * 0.9144;
      else if (fromUnit === 'kadi') meters = v * 0.201168;
      else if (fromUnit === 'm') meters = v;

      let res = meters;
      if (toUnit === 'cm') res = meters * 100;
      else if (toUnit === 'km') res = meters / 1000;
      else if (toUnit === 'ft') res = meters / 0.3048;
      else if (toUnit === 'inch') res = meters / 0.0254;
      else if (toUnit === 'yard') res = meters / 0.9144;
      else if (toUnit === 'kadi') res = meters / 0.201168;
      else if (toUnit === 'm') res = meters;
      return res.toFixed(4);
    } else if (category === 'weight') {
      let kg = v;
      if (fromUnit === 'g') kg = v / 1000;
      else if (fromUnit === 'mg') kg = v / 1000000;
      else if (fromUnit === 'lb') kg = v * 0.45359237;
      else if (fromUnit === 'oz') kg = v * 0.0283495;
      else if (fromUnit === 'quintal') kg = v * 100;
      else if (fromUnit === 'ton') kg = v * 1000;
      else if (fromUnit === 'kg') kg = v;

      let res = kg;
      if (toUnit === 'g') res = kg * 1000;
      else if (toUnit === 'mg') res = kg * 1000000;
      else if (toUnit === 'lb') res = kg / 0.45359237;
      else if (toUnit === 'oz') res = kg / 0.0283495;
      else if (toUnit === 'quintal') res = kg / 100;
      else if (toUnit === 'ton') res = kg / 1000;
      else if (toUnit === 'kg') res = kg;
      return res.toFixed(4);
    } else {
      let c = v;
      if (fromUnit === 'f') c = (v - 32) * (5 / 9);
      else if (fromUnit === 'k') c = v - 273.15;
      else c = v;

      let res = c;
      if (toUnit === 'f') res = c * (9 / 5) + 32;
      else if (toUnit === 'k') res = c + 273.15;
      else res = c;
      return res.toFixed(2);
    }
  }, [val, category, fromUnit, toUnit]);

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 p-1.5 bg-slate-100 rounded-2xl">
        <button
          type="button"
          onClick={() => handleCategoryChange('land')}
          className={`py-2.5 px-2 rounded-xl text-xs font-bold transition ${category === 'land' ? 'bg-indigo-600 text-white shadow' : 'text-slate-600'}`}
        >
          Land & Area
        </button>
        <button
          type="button"
          onClick={() => handleCategoryChange('length')}
          className={`py-2.5 px-2 rounded-xl text-xs font-bold transition ${category === 'length' ? 'bg-indigo-600 text-white shadow' : 'text-slate-600'}`}
        >
          Length & Kadi
        </button>
        <button
          type="button"
          onClick={() => handleCategoryChange('weight')}
          className={`py-2.5 px-2 rounded-xl text-xs font-bold transition ${category === 'weight' ? 'bg-indigo-600 text-white shadow' : 'text-slate-600'}`}
        >
          Weight & Mass
        </button>
        <button
          type="button"
          onClick={() => handleCategoryChange('temp')}
          className={`py-2.5 px-2 rounded-xl text-xs font-bold transition ${category === 'temp' ? 'bg-indigo-600 text-white shadow' : 'text-slate-600'}`}
        >
          Temperature
        </button>
      </div>

      <div className="bg-slate-50 p-6 rounded-3xl border space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Value:</label>
            <input
              type="number"
              value={val}
              onChange={(e) => setVal(e.target.value)}
              className="w-full p-3 rounded-xl border bg-white font-bold text-sm"
            />
          </div>
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">From Unit:</label>
            <select
              value={fromUnit}
              onChange={(e) => setFromUnit(e.target.value)}
              className="w-full p-3 rounded-xl border bg-white font-bold text-sm"
            >
              {category === 'land' && (
                <>
                  <option value="bigha">Bigha</option>
                  <option value="biswa">Biswa</option>
                  <option value="acre">Acre</option>
                  <option value="hectare">Hectare</option>
                  <option value="sqft">Square Feet (sqft)</option>
                  <option value="sqm">Square Meters (sqm)</option>
                  <option value="sqyd">Square Yards (Gaj)</option>
                </>
              )}
              {category === 'length' && (
                <>
                  <option value="m">Meters (m)</option>
                  <option value="cm">Centimeters (cm)</option>
                  <option value="km">Kilometers (km)</option>
                  <option value="ft">Feet (ft)</option>
                  <option value="inch">Inches (in)</option>
                  <option value="yard">Yards</option>
                  <option value="kadi">Kadi (Link)</option>
                </>
              )}
              {category === 'weight' && (
                <>
                  <option value="kg">Kilograms (kg)</option>
                  <option value="g">Grams (g)</option>
                  <option value="mg">Milligrams (mg)</option>
                  <option value="lb">Pounds (lb)</option>
                  <option value="oz">Ounces (oz)</option>
                  <option value="quintal">Quintal</option>
                  <option value="ton">Metric Ton</option>
                </>
              )}
              {category === 'temp' && (
                <>
                  <option value="c">Celsius (°C)</option>
                  <option value="f">Fahrenheit (°F)</option>
                  <option value="k">Kelvin (K)</option>
                </>
              )}
            </select>
          </div>
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">To Unit:</label>
            <select
              value={toUnit}
              onChange={(e) => setToUnit(e.target.value)}
              className="w-full p-3 rounded-xl border bg-white font-bold text-sm"
            >
              {category === 'land' && (
                <>
                  <option value="bigha">Bigha</option>
                  <option value="biswa">Biswa</option>
                  <option value="acre">Acre</option>
                  <option value="hectare">Hectare</option>
                  <option value="sqft">Square Feet (sqft)</option>
                  <option value="sqm">Square Meters (sqm)</option>
                  <option value="sqyd">Square Yards (Gaj)</option>
                </>
              )}
              {category === 'length' && (
                <>
                  <option value="m">Meters (m)</option>
                  <option value="cm">Centimeters (cm)</option>
                  <option value="km">Kilometers (km)</option>
                  <option value="ft">Feet (ft)</option>
                  <option value="inch">Inches (in)</option>
                  <option value="yard">Yards</option>
                  <option value="kadi">Kadi (Link)</option>
                </>
              )}
              {category === 'weight' && (
                <>
                  <option value="kg">Kilograms (kg)</option>
                  <option value="g">Grams (g)</option>
                  <option value="mg">Milligrams (mg)</option>
                  <option value="lb">Pounds (lb)</option>
                  <option value="oz">Ounces (oz)</option>
                  <option value="quintal">Quintal</option>
                  <option value="ton">Metric Ton</option>
                </>
              )}
              {category === 'temp' && (
                <>
                  <option value="c">Celsius (°C)</option>
                  <option value="f">Fahrenheit (°F)</option>
                  <option value="k">Kelvin (K)</option>
                </>
              )}
            </select>
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-indigo-50 border border-indigo-200 text-center space-y-1">
          <p className="text-xs font-bold text-indigo-700">Converted Output Result</p>
          <p className="text-2xl sm:text-3xl font-black text-indigo-950 break-all">{converted} {toUnit}</p>
        </div>
      </div>
    </div>
  );
};

const JpgToPngTool: React.FC<ToolBaseProps> = ({ user, db, toolName }) => {
  const [file, setFile] = useState<File | null>(null);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleConvert = () => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const c = document.createElement('canvas');
        c.width = img.naturalWidth;
        c.height = img.naturalHeight;
        const ctx = c.getContext('2d')!;
        ctx.drawImage(img, 0, 0);
        c.toBlob((blob) => {
          if (blob) {
            setResultUrl(URL.createObjectURL(blob));
          }
        }, 'image/png');
      };
      img.src = String(reader.result);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-6 max-w-xl mx-auto">
      <div
        onClick={() => fileRef.current?.click()}
        className="border-2 border-dashed border-indigo-300 hover:border-indigo-600 bg-indigo-50/40 rounded-3xl p-8 text-center cursor-pointer transition"
      >
        <input
          ref={fileRef}
          type="file"
          accept="image/jpeg"
          className="hidden"
          onChange={(e) => e.target.files?.[0] && setFile(e.target.files[0])}
        />
        <ImageIcon className="w-12 h-12 text-indigo-600 mx-auto mb-3" />
        <h3 className="text-base font-bold text-slate-900 break-all">{file ? file.name : 'Select JPG Image'}</h3>
      </div>
      {file && (
        <button
          type="button"
          onClick={handleConvert}
          className="w-full py-4 rounded-2xl bg-indigo-600 text-white font-black text-base shadow-xl"
        >
          Convert to PNG
        </button>
      )}
      {resultUrl && (
        <div className="p-6 rounded-3xl bg-emerald-50 border border-emerald-200 flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="font-bold text-xs text-emerald-900">Converted Successfully!</span>
          <button type="button" onClick={() => triggerDownload(resultUrl, 'converted.png')} className="w-full sm:w-auto px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold">Download PNG</button>
        </div>
      )}
    </div>
  );
};

const PngToJpgTool: React.FC<ToolBaseProps> = ({ user, db, toolName }) => {
  const [file, setFile] = useState<File | null>(null);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleConvert = () => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const c = document.createElement('canvas');
        c.width = img.naturalWidth;
        c.height = img.naturalHeight;
        const ctx = c.getContext('2d')!;
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, c.width, c.height);
        ctx.drawImage(img, 0, 0);
        c.toBlob((blob) => {
          if (blob) {
            setResultUrl(URL.createObjectURL(blob));
          }
        }, 'image/jpeg', 0.9);
      };
      img.src = String(reader.result);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-6 max-w-xl mx-auto">
      <div
        onClick={() => fileRef.current?.click()}
        className="border-2 border-dashed border-indigo-300 hover:border-indigo-600 bg-indigo-50/40 rounded-3xl p-8 text-center cursor-pointer transition"
      >
        <input
          ref={fileRef}
          type="file"
          accept="image/png"
          className="hidden"
          onChange={(e) => e.target.files?.[0] && setFile(e.target.files[0])}
        />
        <ImageIcon className="w-12 h-12 text-indigo-600 mx-auto mb-3" />
        <h3 className="text-base font-bold text-slate-900 break-all">{file ? file.name : 'Select PNG Image'}</h3>
      </div>
      {file && (
        <button
          type="button"
          onClick={handleConvert}
          className="w-full py-4 rounded-2xl bg-indigo-600 text-white font-black text-base shadow-xl"
        >
          Convert to JPG
        </button>
      )}
      {resultUrl && (
        <div className="p-6 rounded-3xl bg-emerald-50 border border-emerald-200 flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="font-bold text-xs text-emerald-900">Converted Successfully!</span>
          <button type="button" onClick={() => triggerDownload(resultUrl, 'converted.jpg')} className="w-full sm:w-auto px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold">Download JPG</button>
        </div>
      )}
    </div>
  );
};

const PdfSplitterTool: React.FC<ToolBaseProps> = ({ user, db, toolName }) => {
  const [file, setFile] = useState<File | null>(null);
  const [pageRange, setPageRange] = useState('1');
  const [isProcessing, setIsProcessing] = useState(false);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleSplit = async () => {
    if (!file) return;
    setIsProcessing(true);
    try {
      const PDFLib = await ensurePdfLib();
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await PDFLib.PDFDocument.load(arrayBuffer);
      const newPdf = await PDFLib.PDFDocument.create();

      const [start, end] = pageRange.split('-').map(Number);
      const indices = [];
      if (end) {
        for (let i = start; i <= end; i++) indices.push(i - 1);
      } else {
        indices.push(start - 1);
      }

      const copiedPages = await newPdf.copyPages(pdf, indices.filter((i) => i >= 0 && i < pdf.getPageCount()));
      copiedPages.forEach((p: any) => newPdf.addPage(p));
      const bytes = await newPdf.save();
      const blob = new Blob([bytes], { type: 'application/pdf' });
      setResultUrl(URL.createObjectURL(blob));
      setIsProcessing(false);
    } catch (e: any) {
      setIsProcessing(false);
      alert('Error splitting PDF: ' + e.message);
    }
  };

  return (
    <div className="space-y-6 max-w-xl mx-auto">
      <div
        onClick={() => fileRef.current?.click()}
        className="border-2 border-dashed border-indigo-300 hover:border-indigo-600 bg-indigo-50/40 rounded-3xl p-8 text-center cursor-pointer transition"
      >
        <input
          ref={fileRef}
          type="file"
          accept="application/pdf"
          className="hidden"
          onChange={(e) => e.target.files?.[0] && setFile(e.target.files[0])}
        />
        <Scissors className="w-12 h-12 text-indigo-600 mx-auto mb-3" />
        <h3 className="text-base font-bold text-slate-900 break-all">{file ? file.name : 'Select PDF File'}</h3>
      </div>
      {file && (
        <div className="space-y-4 bg-slate-50 p-6 rounded-3xl border">
          <label className="text-xs font-bold text-slate-700 block">Page Range (e.g., 1-3 or 2):</label>
          <input
            type="text"
            value={pageRange}
            onChange={(e) => setPageRange(e.target.value)}
            className="w-full p-3 rounded-xl border bg-white font-bold text-sm"
          />
          <button
            type="button"
            disabled={isProcessing}
            onClick={handleSplit}
            className="w-full py-4 rounded-2xl bg-indigo-600 text-white font-black text-base shadow-xl"
          >
            {isProcessing ? 'Splitting PDF...' : 'Split & Extract PDF'}
          </button>
        </div>
      )}
      {resultUrl && (
        <div className="p-6 rounded-3xl bg-emerald-50 border border-emerald-200 flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="font-bold text-xs text-emerald-900">PDF Split Successfully!</span>
          <button type="button" onClick={() => triggerDownload(resultUrl, 'split-document.pdf')} className="w-full sm:w-auto px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold">Download Split PDF</button>
        </div>
      )}
    </div>
  );
};

const PdfRotatorTool: React.FC<ToolBaseProps> = ({ user, db, toolName }) => {
  const [file, setFile] = useState<File | null>(null);
  const [angle, setAngle] = useState(90);
  const [isProcessing, setIsProcessing] = useState(false);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleRotate = async () => {
    if (!file) return;
    setIsProcessing(true);
    try {
      const PDFLib = await ensurePdfLib();
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await PDFLib.PDFDocument.load(arrayBuffer);
      pdf.getPages().forEach((page: any) => {
        page.setRotation(PDFLib.degrees(page.getRotation().angle + angle));
      });
      const bytes = await pdf.save();
      const blob = new Blob([bytes], { type: 'application/pdf' });
      setResultUrl(URL.createObjectURL(blob));
      setIsProcessing(false);
    } catch (e: any) {
      setIsProcessing(false);
      alert('Error rotating PDF: ' + e.message);
    }
  };

  return (
    <div className="space-y-6 max-w-xl mx-auto">
      <div
        onClick={() => fileRef.current?.click()}
        className="border-2 border-dashed border-indigo-300 hover:border-indigo-600 bg-indigo-50/40 rounded-3xl p-8 text-center cursor-pointer transition"
      >
        <input
          ref={fileRef}
          type="file"
          accept="application/pdf"
          className="hidden"
          onChange={(e) => e.target.files?.[0] && setFile(e.target.files[0])}
        />
        <RotateCw className="w-12 h-12 text-indigo-600 mx-auto mb-3" />
        <h3 className="text-base font-bold text-slate-900 break-all">{file ? file.name : 'Select PDF File'}</h3>
      </div>
      {file && (
        <div className="space-y-4 bg-slate-50 p-6 rounded-3xl border">
          <label className="text-xs font-bold text-slate-700 block">Rotation Angle:</label>
          <select
            value={angle}
            onChange={(e) => setAngle(Number(e.target.value))}
            className="w-full p-3 rounded-xl border bg-white font-bold text-sm"
          >
            <option value="90">90° Clockwise</option>
            <option value="180">180°</option>
            <option value="270">270° (90° Counter-Clockwise)</option>
          </select>
          <button
            type="button"
            disabled={isProcessing}
            onClick={handleRotate}
            className="w-full py-4 rounded-2xl bg-indigo-600 text-white font-black text-base shadow-xl"
          >
            {isProcessing ? 'Rotating PDF...' : 'Rotate PDF Pages'}
          </button>
        </div>
      )}
      {resultUrl && (
        <div className="p-6 rounded-3xl bg-emerald-50 border border-emerald-200 flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="font-bold text-xs text-emerald-900">PDF Rotated Successfully!</span>
          <button type="button" onClick={() => triggerDownload(resultUrl, 'rotated-document.pdf')} className="w-full sm:w-auto px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold">Download Rotated PDF</button>
        </div>
      )}
    </div>
  );
};

const ImageFormatConverterTool: React.FC<ToolBaseProps> = ({ user, db, toolName }) => {
  const [file, setFile] = useState<File | null>(null);
  const [format, setFormat] = useState('image/webp');
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleConvert = () => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const c = document.createElement('canvas');
        c.width = img.naturalWidth;
        c.height = img.naturalHeight;
        const ctx = c.getContext('2d')!;
        if (format === 'image/jpeg') {
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, c.width, c.height);
        }
        ctx.drawImage(img, 0, 0);
        c.toBlob((blob) => {
          if (blob) {
            setResultUrl(URL.createObjectURL(blob));
          }
        }, format, 0.9);
      };
      img.src = String(reader.result);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-6 max-w-xl mx-auto">
      <div
        onClick={() => fileRef.current?.click()}
        className="border-2 border-dashed border-indigo-300 hover:border-indigo-600 bg-indigo-50/40 rounded-3xl p-8 text-center cursor-pointer transition"
      >
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => e.target.files?.[0] && setFile(e.target.files[0])}
        />
        <RefreshCw className="w-12 h-12 text-indigo-600 mx-auto mb-3" />
        <h3 className="text-base font-bold text-slate-900 break-all">{file ? file.name : 'Select Image File'}</h3>
      </div>
      {file && (
        <div className="space-y-4 bg-slate-50 p-6 rounded-3xl border">
          <label className="text-xs font-bold text-slate-700 block">Target Format:</label>
          <select
            value={format}
            onChange={(e) => setFormat(e.target.value)}
            className="w-full p-3 rounded-xl border bg-white font-bold text-sm"
          >
            <option value="image/webp">WEBP (Modern & Fast)</option>
            <option value="image/jpeg">JPEG / JPG</option>
            <option value="image/png">PNG (Lossless)</option>
          </select>
          <button
            type="button"
            onClick={handleConvert}
            className="w-full py-4 rounded-2xl bg-indigo-600 text-white font-black text-base shadow-xl"
          >
            Convert Image Format
          </button>
        </div>
      )}
      {resultUrl && (
        <div className="p-6 rounded-3xl bg-emerald-50 border border-emerald-200 flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="font-bold text-xs text-emerald-900">Converted Successfully!</span>
          <button type="button" onClick={() => triggerDownload(resultUrl, 'converted-image.' + format.split('/')[1])} className="w-full sm:w-auto px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold">Download Converted Image</button>
        </div>
      )}
    </div>
  );
};

const PdfMergerTool: React.FC<ToolBaseProps> = ({ user, db, toolName }) => {
  const [files, setFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [mergedUrl, setMergedUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleMerge = async () => {
    if (files.length < 2) {
      alert('Please select at least 2 PDF files to merge.');
      return;
    }
    setIsProcessing(true);
    try {
      const PDFLib = await ensurePdfLib();
      const mergedPdf = await PDFLib.PDFDocument.create();

      for (const file of files) {
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await PDFLib.PDFDocument.load(arrayBuffer);
        const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
        copiedPages.forEach((page: any) => mergedPdf.addPage(page));
      }

      const pdfBytes = await mergedPdf.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      setMergedUrl(url);
      setIsProcessing(false);
    } catch (e: any) {
      setIsProcessing(false);
      alert('Error merging PDFs: ' + e.message);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div
        onClick={() => fileInputRef.current?.click()}
        className="border-2 border-dashed border-indigo-300 hover:border-indigo-600 bg-indigo-50/40 rounded-3xl p-8 text-center cursor-pointer transition"
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="application/pdf"
          multiple
          className="hidden"
          onChange={(e) => {
            if (e.target.files) {
              setFiles(Array.from(e.target.files));
              setMergedUrl(null);
            }
          }}
        />
        <Layers className="w-12 h-12 text-indigo-600 mx-auto mb-3" />
        <h3 className="text-base font-bold text-slate-900">
          {files.length > 0 ? `${files.length} PDF files selected` : 'Drop PDF files here or click to browse'}
        </h3>
        <p className="text-xs text-slate-500 mt-1">Combine multiple PDFs securely in browser memory</p>
      </div>

      {files.length > 0 && (
        <div className="space-y-4">
          <div className="bg-slate-50 p-4 rounded-2xl border space-y-2">
            <h4 className="text-xs font-bold text-slate-700">Selected Files:</h4>
            {files.map((f, i) => (
              <div key={i} className="flex justify-between items-center bg-white p-2.5 rounded-xl border text-xs gap-2">
                <span className="font-semibold text-slate-800 truncate">{f.name}</span>
                <span className="text-slate-400 shrink-0">{formatBytes(f.size)}</span>
              </div>
            ))}
          </div>
          <button
            type="button"
            disabled={isProcessing}
            onClick={handleMerge}
            className="w-full py-4 rounded-2xl bg-indigo-600 text-white font-black text-base shadow-xl hover:bg-indigo-700 transition"
          >
            {isProcessing ? 'Merging PDFs...' : 'Merge PDFs Now'}
          </button>
        </div>
      )}

      {mergedUrl && (
        <div className="p-6 rounded-3xl bg-emerald-50 border border-emerald-200 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <p className="font-extrabold text-sm text-emerald-950">PDFs Merged Successfully!</p>
            <p className="text-xs text-emerald-700 mt-0.5">Ready for instant download</p>
          </div>
          <button
            type="button"
            onClick={() => triggerDownload(mergedUrl, 'merged-document.pdf')}
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-emerald-600 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-md hover:bg-emerald-700 transition"
          >
            <Download className="w-4 h-4" /> Download Merged PDF
          </button>
        </div>
      )}
    </div>
  );
};

const QrCodeGeneratorTool: React.FC<ToolBaseProps> = ({ user, db, toolName }) => {
  const [text, setText] = useState('https://apextoolkit.pages.dev');
  const [qrUrl, setQrUrl] = useState<string | null>(null);

  useEffect(() => {
    const generate = async () => {
      try {
        const QRCode = await ensureQRCode();
        const url = await QRCode.toDataURL(text || 'https://apextoolkit.pages.dev', { width: 400, margin: 2 });
        setQrUrl(url);
      } catch {}
    };
    generate();
  }, [text]);

  return (
    <div className="space-y-6 max-w-xl mx-auto">
      <div className="bg-slate-50 p-6 rounded-3xl border space-y-4">
        <label className="text-xs font-bold text-slate-700 block">QR Code Content (URL or Text):</label>
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="w-full p-3.5 rounded-xl border bg-white font-bold text-sm"
        />

        {qrUrl && (
          <div className="flex flex-col items-center justify-center p-6 bg-white rounded-2xl border space-y-4">
            <img src={qrUrl} alt="QR Code" className="w-48 h-48 object-contain" />
            <button
              type="button"
              onClick={() => triggerDownload(qrUrl, 'qrcode.png')}
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-indigo-600 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-md hover:bg-indigo-700 transition"
            >
              <Download className="w-4 h-4" /> Download QR Code PNG
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

const WordCounterTool: React.FC<ToolBaseProps> = ({ user, db, toolName }) => {
  const [text, setText] = useState('');

  const stats = useMemo(() => {
    const words = text.trim() ? text.trim().split(/\s+/).length : 0;
    const chars = text.length;
    const sentences = text ? text.split(/[.!?]+/).filter(Boolean).length : 0;
    const paragraphs = text ? text.split(/\n+/).filter(Boolean).length : 0;
    const readingTime = Math.ceil(words / 200);
    return { words, chars, sentences, paragraphs, readingTime };
  }, [text]);

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="bg-indigo-50 border border-indigo-200 p-4 rounded-2xl text-center">
          <p className="text-[11px] font-bold text-indigo-700">Words</p>
          <p className="text-2xl font-black text-indigo-950">{stats.words}</p>
        </div>
        <div className="bg-indigo-50 border border-indigo-200 p-4 rounded-2xl text-center">
          <p className="text-[11px] font-bold text-indigo-700">Characters</p>
          <p className="text-2xl font-black text-indigo-950">{stats.chars}</p>
        </div>
        <div className="bg-indigo-50 border border-indigo-200 p-4 rounded-2xl text-center">
          <p className="text-[11px] font-bold text-indigo-700">Sentences</p>
          <p className="text-2xl font-black text-indigo-950">{stats.sentences}</p>
        </div>
        <div className="bg-indigo-50 border border-indigo-200 p-4 rounded-2xl text-center">
          <p className="text-[11px] font-bold text-indigo-700">Paragraphs</p>
          <p className="text-2xl font-black text-indigo-950">{stats.paragraphs}</p>
        </div>
        <div className="bg-indigo-50 border border-indigo-200 p-4 rounded-2xl text-center col-span-2 sm:col-span-1">
          <p className="text-[11px] font-bold text-indigo-700">Read Time</p>
          <p className="text-2xl font-black text-indigo-950">{stats.readingTime} min</p>
        </div>
      </div>

      <div className="bg-slate-50 p-6 rounded-3xl border space-y-4">
        <textarea
          rows={8}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type or paste your text here to analyze word count, characters, sentences..."
          className="w-full p-4 rounded-2xl border font-mono text-xs focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
        />
      </div>
    </div>
  );
};

const PercentageCalculatorTool: React.FC<ToolBaseProps> = ({ user, db, toolName }) => {
  const [mode, setMode] = useState<'part' | 'increase' | 'discount'>('part');
  const [val1, setVal1] = useState<string>('20');
  const [val2, setVal2] = useState<string>('150');

  const result = useMemo(() => {
    const a = parseFloat(val1) || 0;
    const b = parseFloat(val2) || 0;
    if (mode === 'part') {
      return {
        answer: ((a / 100) * b).toFixed(2),
        formula: `${a}% of ${b} = (${a} / 100) × ${b}`,
      };
    } else if (mode === 'increase') {
      const diff = b - a;
      const pct = a !== 0 ? (diff / Math.abs(a)) * 100 : 0;
      return {
        answer: `${pct >= 0 ? '+' : ''}${pct.toFixed(2)}%`,
        formula: `Percentage change from ${a} to ${b} = (( ${b} - ${a} ) / |${a}|) × 100`,
      };
    } else {
      const saving = (a * b) / 100;
      const finalPrice = a - saving;
      return {
        answer: `Final Price: $${finalPrice.toFixed(2)} (Save $${saving.toFixed(2)})`,
        formula: `Discount of ${b}% on $${a} = $${a} - (${a} × ${b} / 100)`,
      };
    }
  }, [mode, val1, val2]);

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="flex flex-col sm:flex-row gap-2 p-1.5 bg-slate-100 rounded-2xl">
        <button
          type="button"
          onClick={() => setMode('part')}
          className={`flex-1 py-2.5 px-2 rounded-xl text-xs font-bold transition ${mode === 'part' ? 'bg-indigo-600 text-white shadow' : 'text-slate-600'}`}
        >
          What is X% of Y?
        </button>
        <button
          type="button"
          onClick={() => setMode('increase')}
          className={`flex-1 py-2.5 px-2 rounded-xl text-xs font-bold transition ${mode === 'increase' ? 'bg-indigo-600 text-white shadow' : 'text-slate-600'}`}
        >
          Percentage Change
        </button>
        <button
          type="button"
          onClick={() => setMode('discount')}
          className={`flex-1 py-2.5 px-2 rounded-xl text-xs font-bold transition ${mode === 'discount' ? 'bg-indigo-600 text-white shadow' : 'text-slate-600'}`}
        >
          Discount Calculator
        </button>
      </div>

      <div className="bg-slate-50 p-6 rounded-3xl border space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              {mode === 'discount' ? 'Original Price ($):' : mode === 'increase' ? 'Initial Value:' : 'Percentage X (%):'}
            </label>
            <input
              type="number"
              value={val1}
              onChange={(e) => setVal1(e.target.value)}
              className="w-full p-3 rounded-xl border bg-white font-bold text-sm"
            />
          </div>
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              {mode === 'discount' ? 'Discount Percentage (%):' : mode === 'increase' ? 'Final Value:' : 'Total Value Y:'}
            </label>
            <input
              type="number"
              value={val2}
              onChange={(e) => setVal2(e.target.value)}
              className="w-full p-3 rounded-xl border bg-white font-bold text-sm"
            />
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-indigo-50 border border-indigo-200 text-center space-y-2">
          <p className="text-xs font-bold text-indigo-700 uppercase tracking-wider">Calculated Result</p>
          <p className="text-2xl sm:text-3xl font-black text-indigo-950 break-all">{result.answer}</p>
          <p className="text-xs font-mono text-indigo-600/80 pt-1 break-all">Formula: {result.formula}</p>
        </div>
      </div>
    </div>
  );
};

const GstCalculatorTool: React.FC<ToolBaseProps> = ({ user, db, toolName }) => {
  const [amount, setAmount] = useState('1000');
  const [gstRate, setGstRate] = useState('18');
  const [calcType, setCalcType] = useState<'add' | 'remove'>('add');

  const result = useMemo(() => {
    const base = parseFloat(amount) || 0;
    const rate = parseFloat(gstRate) || 0;
    if (calcType === 'add') {
      const gstAmount = (base * rate) / 100;
      const total = base + gstAmount;
      return {
        net: base.toFixed(2),
        tax: gstAmount.toFixed(2),
        total: total.toFixed(2),
        cgst: (gstAmount / 2).toFixed(2),
        sgst: (gstAmount / 2).toFixed(2),
      };
    } else {
      const net = base / (1 + rate / 100);
      const gstAmount = base - net;
      return {
        net: net.toFixed(2),
        tax: gstAmount.toFixed(2),
        total: base.toFixed(2),
        cgst: (gstAmount / 2).toFixed(2),
        sgst: (gstAmount / 2).toFixed(2),
      };
    }
  }, [amount, gstRate, calcType]);

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="flex flex-col sm:flex-row gap-2 p-1.5 bg-slate-100 rounded-2xl">
        <button
          type="button"
          onClick={() => setCalcType('add')}
          className={`flex-1 py-2.5 px-2 rounded-xl text-xs font-bold transition ${calcType === 'add' ? 'bg-indigo-600 text-white shadow' : 'text-slate-600'}`}
        >
          Add GST (Exclusive)
        </button>
        <button
          type="button"
          onClick={() => setCalcType('remove')}
          className={`flex-1 py-2.5 px-2 rounded-xl text-xs font-bold transition ${calcType === 'remove' ? 'bg-indigo-600 text-white shadow' : 'text-slate-600'}`}
        >
          Remove GST (Inclusive)
        </button>
      </div>

      <div className="bg-slate-50 p-6 rounded-3xl border space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              {calcType === 'add' ? 'Net Amount ($):' : 'Gross / MRP Amount ($):'}
            </label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full p-3 rounded-xl border bg-white font-bold text-sm"
            />
          </div>
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">GST Rate (%):</label>
            <select
              value={gstRate}
              onChange={(e) => setGstRate(e.target.value)}
              className="w-full p-3 rounded-xl border bg-white font-bold text-sm"
            >
              <option value="5">5% (Essential)</option>
              <option value="12">12% (Standard)</option>
              <option value="18">18% (Standard Services)</option>
              <option value="28">28% (Luxury / Goods)</option>
            </select>
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-indigo-50 border border-indigo-200 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-center pb-3 border-b border-indigo-200">
            <div>
              <p className="text-[11px] font-bold text-indigo-700">Net Amount</p>
              <p className="text-lg font-black text-indigo-950">${result.net}</p>
            </div>
            <div>
              <p className="text-[11px] font-bold text-indigo-700">Total GST ({gstRate}%)</p>
              <p className="text-lg font-black text-indigo-950">${result.tax}</p>
            </div>
            <div>
              <p className="text-[11px] font-bold text-indigo-700">Gross Total</p>
              <p className="text-lg font-black text-indigo-950">${result.total}</p>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row justify-between text-xs text-indigo-900 font-semibold px-2 gap-1">
            <span>CGST ({Number(gstRate) / 2}%): ${result.cgst}</span>
            <span>SGST ({Number(gstRate) / 2}%): ${result.sgst}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

const EmiCalculatorTool: React.FC<ToolBaseProps> = ({ user, db, toolName }) => {
  const [principal, setPrincipal] = useState('500000');
  const [rate, setRate] = useState('8.5');
  const [tenureYears, setTenureYears] = useState('20');

  const calc = useMemo(() => {
    const p = parseFloat(principal) || 0;
    const r = (parseFloat(rate) || 0) / 12 / 100;
    const n = (parseFloat(tenureYears) || 0) * 12;
    if (p <= 0 || r <= 0 || n <= 0) return { emi: 0, totalPayable: 0, totalInterest: 0 };

    const emi = (p * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
    const totalPayable = emi * n;
    const totalInterest = totalPayable - p;
    return { emi: Math.round(emi), totalPayable: Math.round(totalPayable), totalInterest: Math.round(totalInterest) };
  }, [principal, rate, tenureYears]);

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="bg-slate-50 p-6 rounded-3xl border space-y-4">
        <div>
          <label className="text-xs font-bold text-slate-700 block mb-1">Loan Principal Amount ($):</label>
          <input
            type="number"
            value={principal}
            onChange={(e) => setPrincipal(e.target.value)}
            className="w-full p-3 rounded-xl border bg-white font-bold text-sm"
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Interest Rate (% p.a.):</label>
            <input
              type="number"
              step="0.1"
              value={rate}
              onChange={(e) => setRate(e.target.value)}
              className="w-full p-3 rounded-xl border bg-white font-bold text-sm"
            />
          </div>
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Tenure (Years):</label>
            <input
              type="number"
              value={tenureYears}
              onChange={(e) => setTenureYears(e.target.value)}
              className="w-full p-3 rounded-xl border bg-white font-bold text-sm"
            />
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-indigo-50 border border-indigo-200 grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-xs font-bold text-indigo-700">Monthly EMI</p>
            <p className="text-xl sm:text-2xl font-black text-indigo-950">${calc.emi.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-xs font-bold text-indigo-700">Total Interest</p>
            <p className="text-xl sm:text-2xl font-black text-indigo-950">${calc.totalInterest.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-xs font-bold text-indigo-700">Total Payment</p>
            <p className="text-xl sm:text-2xl font-black text-indigo-950">${calc.totalPayable.toLocaleString()}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

const BmiCalculatorTool: React.FC<ToolBaseProps> = ({ user, db, toolName }) => {
  const [weightKg, setWeightKg] = useState('70');
  const [heightCm, setHeightCm] = useState('175');
  const [age, setAge] = useState('28');
  const [gender, setGender] = useState<'male' | 'female'>('male');

  const results = useMemo(() => {
    const w = parseFloat(weightKg) || 0;
    const hM = (parseFloat(heightCm) || 0) / 100;
    const a = parseFloat(age) || 25;
    if (w <= 0 || hM <= 0) return { bmi: '0.0', category: 'Invalid Input', bmr: 0 };

    const bmi = w / (hM * hM);
    let category = 'Normal weight';
    if (bmi < 18.5) category = 'Underweight';
    else if (bmi >= 25 && bmi < 30) category = 'Overweight';
    else if (bmi >= 30) category = 'Obese';

    const bmr = gender === 'male' ? 10 * w + 6.25 * (hM * 100) - 5 * a + 5 : 10 * w + 6.25 * (hM * 100) - 5 * a - 161;

    return { bmi: bmi.toFixed(1), category, bmr: Math.round(bmr) };
  }, [weightKg, heightCm, age, gender]);

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="bg-slate-50 p-6 rounded-3xl border space-y-4">
        <div className="flex gap-4">
          <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer">
            <input type="radio" name="gender" checked={gender === 'male'} onChange={() => setGender('male')} /> Male
          </label>
          <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer">
            <input type="radio" name="gender" checked={gender === 'female'} onChange={() => setGender('female')} /> Female
          </label>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Weight (kg):</label>
            <input
              type="number"
              value={weightKg}
              onChange={(e) => setWeightKg(e.target.value)}
              className="w-full p-3 rounded-xl border bg-white font-bold text-sm"
            />
          </div>
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Height (cm):</label>
            <input
              type="number"
              value={heightCm}
              onChange={(e) => setHeightCm(e.target.value)}
              className="w-full p-3 rounded-xl border bg-white font-bold text-sm"
            />
          </div>
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Age (Years):</label>
            <input
              type="number"
              value={age}
              onChange={(e) => setAge(e.target.value)}
              className="w-full p-3 rounded-xl border bg-white font-bold text-sm"
            />
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-indigo-50 border border-indigo-200 grid grid-cols-1 sm:grid-cols-2 gap-4 text-center">
          <div>
            <p className="text-xs font-bold text-indigo-700">Body Mass Index (BMI)</p>
            <p className="text-2xl sm:text-3xl font-black text-indigo-950">{results.bmi}</p>
            <p className="text-xs font-bold text-indigo-600 mt-1">{results.category}</p>
          </div>
          <div>
            <p className="text-xs font-bold text-indigo-700">Basal Metabolic Rate (BMR)</p>
            <p className="text-2xl sm:text-3xl font-black text-indigo-950">{results.bmr} kcal/day</p>
            <p className="text-xs font-bold text-indigo-600 mt-1">Calories burned at rest</p>
          </div>
        </div>
      </div>
    </div>
  );
};

const AgeCalculatorTool: React.FC<ToolBaseProps> = ({ user, db, toolName }) => {
  const [dob, setDob] = useState('1995-06-15');

  const diff = useMemo(() => {
    const birth = new Date(dob);
    const now = new Date();
    if (isNaN(birth.getTime())) return { years: 0, months: 0, days: 0, totalHours: 0 };

    let years = now.getFullYear() - birth.getFullYear();
    let months = now.getMonth() - birth.getMonth();
    let days = now.getDate() - birth.getDate();

    if (days < 0) {
      months--;
      days += new Date(now.getFullYear(), now.getMonth(), 0).getDate();
    }
    if (months < 0) {
      years--;
      months += 12;
    }

    const diffTime = Math.abs(now.getTime() - birth.getTime());
    const totalHours = Math.floor(diffTime / (1000 * 60 * 60));

    return { years, months, days, totalHours };
  }, [dob]);

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="bg-slate-50 p-6 rounded-3xl border space-y-4">
        <div>
          <label className="text-xs font-bold text-slate-700 block mb-1">Date of Birth:</label>
          <input
            type="date"
            value={dob}
            onChange={(e) => setDob(e.target.value)}
            className="w-full p-3 rounded-xl border bg-white font-bold text-sm"
          />
        </div>

        <div className="p-6 rounded-2xl bg-indigo-50 border border-indigo-200 text-center space-y-2">
          <p className="text-xs font-bold text-indigo-700 uppercase tracking-wider">Exact Chronological Age</p>
          <p className="text-xl sm:text-3xl font-black text-indigo-950">
            {diff.years} Years, {diff.months} Months, {diff.days} Days
          </p>
          <p className="text-xs font-mono text-indigo-600/80 pt-1">Total Lived: {diff.totalHours.toLocaleString()} hours approx.</p>
        </div>
      </div>
    </div>
  );
};

const TipCalculatorTool: React.FC<ToolBaseProps> = ({ user, db, toolName }) => {
  const [bill, setBill] = useState('85.50');
  const [tipPct, setTipPct] = useState('15');
  const [people, setPeople] = useState('2');

  const calculation = useMemo(() => {
    const b = parseFloat(bill) || 0;
    const t = parseFloat(tipPct) || 0;
    const p = parseInt(people) || 1;
    const tipAmount = (b * t) / 100;
    const total = b + tipAmount;
    const perPerson = total / (p > 0 ? p : 1);
    return { tipAmount: tipAmount.toFixed(2), total: total.toFixed(2), perPerson: perPerson.toFixed(2) };
  }, [bill, tipPct, people]);

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="bg-slate-50 p-6 rounded-3xl border space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Bill Amount ($):</label>
            <input
              type="number"
              step="0.01"
              value={bill}
              onChange={(e) => setBill(e.target.value)}
              className="w-full p-3 rounded-xl border bg-white font-bold text-sm"
            />
          </div>
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Tip Percentage (%):</label>
            <input
              type="number"
              value={tipPct}
              onChange={(e) => setTipPct(e.target.value)}
              className="w-full p-3 rounded-xl border bg-white font-bold text-sm"
            />
          </div>
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Split Among People:</label>
            <input
              type="number"
              min="1"
              value={people}
              onChange={(e) => setPeople(e.target.value)}
              className="w-full p-3 rounded-xl border bg-white font-bold text-sm"
            />
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-indigo-50 border border-indigo-200 grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-xs font-bold text-indigo-700">Tip Amount</p>
            <p className="text-xl sm:text-2xl font-black text-indigo-950">${calculation.tipAmount}</p>
          </div>
          <div>
            <p className="text-xs font-bold text-indigo-700">Total Bill</p>
            <p className="text-xl sm:text-2xl font-black text-indigo-950">${calculation.total}</p>
          </div>
          <div>
            <p className="text-xs font-bold text-indigo-700">Per Person Share</p>
            <p className="text-xl sm:text-2xl font-black text-indigo-950">${calculation.perPerson}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

const SignatureGeneratorTool: React.FC<ToolBaseProps> = ({ user, db, toolName }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState('#0f172a');
  const [lineWidth, setLineWidth] = useState(3);
  const [signatureUrl, setSignatureUrl] = useState<string | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.strokeStyle = color;
    ctx.lineWidth = lineWidth;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
  }, [color, lineWidth]);

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    setIsDrawing(true);
    draw(e);
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    const canvas = canvasRef.current;
    if (canvas) {
      setSignatureUrl(canvas.toDataURL('image/png'));
    }
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;
    const x = clientX - rect.left;
    const y = clientY - rect.top;

    ctx.lineTo(x, y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setSignatureUrl(null);
  };

  const saveSignature = async () => {
    if (!signatureUrl) return;
    triggerDownload(signatureUrl, 'my-digital-signature.png');
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="bg-slate-50 p-6 rounded-3xl border border-slate-200 space-y-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <label className="text-xs font-bold text-slate-700">Pen Color:</label>
            {['#0f172a', '#2563eb', '#dc2626', '#16a34a'].map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setColor(c)}
                className={`w-7 h-7 rounded-full border-2 ${color === c ? 'border-indigo-600 scale-110' : 'border-transparent'}`}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>
          <div className="flex items-center gap-3">
            <label className="text-xs font-bold text-slate-700">Thickness:</label>
            {[2, 3, 5].map((w) => (
              <button
                key={w}
                type="button"
                onClick={() => setLineWidth(w)}
                className={`px-3 py-1 rounded-lg text-xs font-bold ${lineWidth === w ? 'bg-indigo-600 text-white' : 'bg-white border text-slate-700'}`}
              >
                {w}px
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={clearCanvas}
            className="w-full sm:w-auto px-4 py-2 rounded-xl bg-red-50 text-red-600 text-xs font-bold hover:bg-red-100 transition"
          >
            Clear Pad
          </button>
        </div>

        <div className="border-2 border-indigo-200 rounded-2xl bg-white overflow-hidden shadow-inner flex justify-center">
          <canvas
            ref={canvasRef}
            width={700}
            height={250}
            onMouseDown={startDrawing}
            onMouseUp={stopDrawing}
            onMouseMove={draw}
            onTouchStart={startDrawing}
            onTouchEnd={stopDrawing}
            onTouchMove={draw}
            className="cursor-crosshair w-full max-w-full touch-none bg-[linear-gradient(45deg,#f8fafc_25%,transparent_25%),linear-gradient(-45deg,#f8fafc_25%,transparent_25%),linear-gradient(45deg,transparent_75%,#f8fafc_75%),linear-gradient(-45deg,transparent_75%,#f8fafc_75%)] bg-[size:20px_20px]"
          />
        </div>
      </div>

      <button
        type="button"
        onClick={saveSignature}
        disabled={!signatureUrl}
        className="w-full py-4 rounded-2xl bg-indigo-600 text-white font-black text-base shadow-xl shadow-indigo-500/25 hover:bg-indigo-700 transition disabled:opacity-50"
      >
        Download Transparent Signature PNG
      </button>
    </div>
  );
};

const PasswordGeneratorTool: React.FC<ToolBaseProps> = ({ user, db, toolName }) => {
  const [length, setLength] = useState(16);
  const [password, setPassword] = useState('');

  const generate = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$%&*!';
    let res = '';
    const array = new Uint32Array(length);
    window.crypto.getRandomValues(array);
    for (let i = 0; i < length; i++) {
      res += chars[array[i] % chars.length];
    }
    setPassword(res);
  };

  useEffect(() => { generate(); }, [length]);

  return (
    <div className="space-y-6 max-w-xl mx-auto">
      <div className="bg-slate-50 p-6 rounded-3xl border space-y-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
          <label className="text-xs font-bold text-slate-700">Password Length ({length} chars):</label>
          <input
            type="range"
            min="8"
            max="32"
            value={length}
            onChange={(e) => setLength(Number(e.target.value))}
            className="w-full sm:w-48"
          />
        </div>
        <div className="flex items-center gap-2 bg-white p-3 rounded-xl border">
          <input
            type="text"
            readOnly
            value={password}
            className="w-full font-mono text-sm bg-transparent outline-none font-bold text-indigo-950 truncate"
          />
          <button
            type="button"
            onClick={() => { document.execCommand('copy'); alert('Password copied to clipboard!'); }}
            className="px-4 py-2 rounded-lg bg-indigo-600 text-white text-xs font-bold shrink-0"
          >
            Copy
          </button>
        </div>
        <button
          type="button"
          onClick={generate}
          className="w-full py-3 rounded-xl bg-slate-900 text-white text-xs font-bold"
        >
          Generate New Password
        </button>
      </div>
    </div>
  );
};

const CaseConverterTool: React.FC<ToolBaseProps> = ({ user, db, toolName }) => {
  const [text, setText] = useState('hello world apex toolkit');

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="bg-slate-50 p-6 rounded-3xl border space-y-4">
        <textarea
          rows={4}
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="w-full p-4 rounded-xl border bg-white font-mono text-xs"
        />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <button type="button" onClick={() => setText(text.toUpperCase())} className="p-2.5 rounded-xl bg-white border text-xs font-bold">UPPERCASE</button>
          <button type="button" onClick={() => setText(text.toLowerCase())} className="p-2.5 rounded-xl bg-white border text-xs font-bold">lowercase</button>
          <button type="button" onClick={() => setText(text.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()))} className="p-2.5 rounded-xl bg-white border text-xs font-bold">Title Case</button>
          <button type="button" onClick={() => setText(text.split('').reverse().join(''))} className="p-2.5 rounded-xl bg-white border text-xs font-bold">Reverse</button>
        </div>
      </div>
    </div>
  );
};

export default function App() {
  const [route, setRoute] = useState<string>(() => window.location.hash.replace(/^#/, '') || '/');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<ToolCategory>('All');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [config] = useState<SiteConfig>(DEFAULT_SITE_CONFIG);

  const [user, setUser] = useState<any>(null);
  const [historyItems, setHistoryItems] = useState<any[]>([]);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showHistoryDrawer, setShowHistoryDrawer] = useState(false);

  useEffect(() => {
    if (!auth) return;
    const initAuth = async () => {
      try {
        if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
          await signInWithCustomToken(auth, __initial_auth_token);
        } else {
          await signInAnonymously(auth);
        }
      } catch (e) {
        console.log('Auth init notice:', e);
      }
    };
    initAuth();
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user || !db) return;
    const q = query(collection(db, 'artifacts', appId, 'users', user.uid, 'history'), orderBy('timestamp', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const items = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
      setHistoryItems(items);
    }, (error) => {
      console.log('History fetch error:', error);
    });
    return () => unsubscribe();
  }, [user]);

  const handleGoogleLogin = async () => {
    if (!auth) return;
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      setShowAuthModal(false);
    } catch (e: any) {
      alert('Login error: ' + e.message);
    }
  };

  const handleAnonymousLogin = async () => {
    if (!auth) return;
    try {
      await signInAnonymously(auth);
      setShowAuthModal(false);
    } catch {}
  };

  const handleLogout = async () => {
    if (!auth) return;
    await signOut(auth);
    setUser(null);
  };

  const navigate = (path: string) => {
    const clean = path.startsWith('/') ? path : `/${path}`;
    setRoute(clean);
    setMobileMenuOpen(false);
    try { window.location.hash = clean; } catch {}
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    const onHashChange = () => {
      const h = window.location.hash.replace(/^#/, '');
      if (h) setRoute(h);
    };
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  const currentTool = useMemo(() => TOOLS.find((t) => t.slug === route), [route]);

  useEffect(() => {
    let title = 'ApexToolkit Pro - Free Fast Browser-Based PDF & Image Utilities';
    let desc = 'Free online utilities including image compressor, unit converter, JPG to PNG, PDF splitter, and more. Processed 100% locally in your browser.';
    if (currentTool) {
      title = currentTool.seoTitle;
      desc = currentTool.seoDescription;
    }
    document.title = title;
  }, [route, currentTool]);

  const filteredTools = useMemo(() => {
    return TOOLS.filter((tool) => {
      const matchesCat = selectedCategory === 'All' || tool.category === selectedCategory;
      const q = searchQuery.toLowerCase().trim();
      const matchesQuery = !q || tool.name.toLowerCase().includes(q) || tool.shortDesc.toLowerCase().includes(q) || tool.keywords.some((k) => k.toLowerCase().includes(q));
      return matchesCat && matchesQuery;
    });
  }, [selectedCategory, searchQuery]);

  const featuredTools = useMemo(() => TOOLS.filter((t) => t.featured), []);

  const renderActiveToolComponent = (tool: ToolDefinition) => {
    const props = { user, db, toolName: tool.name };
    switch (tool.id) {
      case 'image-compressor': return <ImageCompressorTool {...props} />;
      case 'unit-converter': return <UnitConverterTool {...props} />;
      case 'jpg-to-png': return <JpgToPngTool {...props} />;
      case 'png-to-jpg': return <PngToJpgTool {...props} />;
      case 'pdf-splitter': return <PdfSplitterTool {...props} />;
      case 'pdf-rotator': return <PdfRotatorTool {...props} />;
      case 'image-format-converter': return <ImageFormatConverterTool {...props} />;
      case 'pdf-merger': return <PdfMergerTool {...props} />;
      case 'qr-code-generator': return <QrCodeGeneratorTool {...props} />;
      case 'word-counter': return <WordCounterTool {...props} />;
      case 'percentage-calculator': return <PercentageCalculatorTool {...props} />;
      case 'gst-discount-calculator': return <GstCalculatorTool {...props} />;
      case 'emi-calculator': return <EmiCalculatorTool {...props} />;
      case 'bmi-calorie-calculator': return <BmiCalculatorTool {...props} />;
      case 'age-calculator': return <AgeCalculatorTool {...props} />;
      case 'tip-calculator': return <TipCalculatorTool {...props} />;
      case 'signature-generator': return <SignatureGeneratorTool {...props} />;
      case 'password-generator': return <PasswordGeneratorTool {...props} />;
      case 'case-converter': return <CaseConverterTool {...props} />;
      default: return <WordCounterTool {...props} />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-white text-slate-900 font-sans selection:bg-indigo-600 selection:text-white">
      {/* HEADER */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          <button type="button" onClick={() => navigate('/')} className="flex items-center gap-2.5 text-left group focus:outline-none shrink-0">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 via-indigo-600 to-fuchsia-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/25 group-hover:scale-105 transition">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <span className="font-black text-lg sm:text-xl tracking-tight bg-gradient-to-r from-slate-900 via-indigo-900 to-indigo-600 bg-clip-text text-transparent">
                ApexToolkit Pro
              </span>
              <span className="hidden sm:inline-block ml-2 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-indigo-50 text-indigo-700 rounded-full">
                Pro Verified
              </span>
            </div>
          </button>

          <nav className="hidden md:flex items-center gap-6 text-sm font-semibold text-slate-600">
            <button type="button" onClick={() => navigate('/')} className="hover:text-indigo-600 transition">All Tools</button>
            <button type="button" onClick={() => navigate('/image-compressor')} className="text-orange-600 font-bold hover:underline flex items-center gap-1">
              <Flame className="w-4 h-4 fill-orange-500 text-orange-500" /> Image Compressor
            </button>
            <button type="button" onClick={() => navigate('/unit-converter')} className="text-indigo-600 font-bold hover:underline flex items-center gap-1">
              <Scale className="w-4 h-4 text-indigo-500" /> Unit Converter
            </button>
            <button type="button" onClick={() => navigate('/faq')} className="hover:text-indigo-600 transition">FAQ</button>
            <button type="button" onClick={() => navigate('/about')} className="hover:text-indigo-600 transition">About</button>
          </nav>

          <div className="flex items-center gap-2 sm:gap-3">
            {user ? (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowHistoryDrawer(true)}
                  className="px-3 py-2 rounded-xl bg-indigo-50 text-indigo-700 text-xs font-bold flex items-center gap-1.5 hover:bg-indigo-100 transition"
                  title="View Saved History & Docs"
                >
                  <History className="w-4 h-4" /> <span className="hidden sm:inline">History</span> ({historyItems.length})
                </button>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="p-2 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 transition"
                  title="Log out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setShowAuthModal(true)}
                className="px-3 sm:px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold flex items-center gap-1.5 shadow-md hover:bg-indigo-700 transition shrink-0"
              >
                <LogIn className="w-4 h-4" /> <span className="hidden sm:inline">Login / Signup</span><span className="sm:hidden">Login</span>
              </button>
            )}
            <button type="button" onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden p-2 rounded-xl text-slate-700 hover:bg-slate-100 shrink-0">
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-b px-4 pt-2 pb-5 space-y-2">
            <button type="button" onClick={() => navigate('/')} className="block w-full text-left px-3 py-2 rounded-xl font-semibold text-sm">Home - All Tools</button>
            <button type="button" onClick={() => navigate('/image-compressor')} className="block w-full text-left px-3 py-2 rounded-xl font-bold text-sm text-orange-600 bg-orange-50">🔥 Image Compressor (KB/MB)</button>
            <button type="button" onClick={() => navigate('/unit-converter')} className="block w-full text-left px-3 py-2 rounded-xl font-bold text-sm text-indigo-600 bg-indigo-50">📐 Unit & Land Converter</button>
            <button type="button" onClick={() => navigate('/about')} className="block w-full text-left px-3 py-2 rounded-xl font-semibold text-sm">About Shoury Verma (Awagarh)</button>
            <div className="pt-2 border-t border-slate-100 grid grid-cols-2 gap-2">
              {TOOLS.slice(2, 8).map((t) => (
                <button key={t.id} type="button" onClick={() => navigate(t.slug)} className="block text-left px-3 py-2 rounded-xl text-xs text-slate-700 bg-slate-50 truncate">{t.name}</button>
              ))}
            </div>
          </div>
        )}
      </header>

      <AdSenseUnit config={config} slotId={config.adsense.headerSlotId} />

      {/* MAIN BODY */}
      <main className="flex-1">
        {route === '/' && (
          <div>
            <section className="relative overflow-hidden bg-gradient-to-b from-indigo-50/80 via-white to-white pt-10 sm:pt-14 pb-10 sm:pb-12 border-b border-slate-100">
              <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold mb-5 shadow-sm">
                  <Shield className="w-3.5 h-3.5 shrink-0" /> <span className="text-left">ApexToolkit Pro operates entirely within your browser memory.</span>
                </div>
                <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-slate-900 leading-tight">
                  Professional PDF, Land Conversion & Calculation Tools in{' '}
                  <span className="bg-gradient-to-r from-cyan-600 via-indigo-600 to-fuchsia-600 bg-clip-text text-transparent">
                    One High-Speed Hub
                  </span>
                </h1>
                <p className="mt-4 text-sm sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
                  Verified high-performance daily utilities for photos, PDFs, land areas (Bigha, Feet, Kadi), and financial calculators. Zero server uploads.
                </p>

                <div className="mt-8 max-w-2xl mx-auto relative">
                  <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                  <input
                    type="search"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search verified tools (e.g. image compressor, bigha to feet, gst)..."
                    className="w-full pl-12 pr-4 py-3.5 sm:py-4 rounded-2xl border border-slate-200/95 shadow-xl shadow-indigo-500/5 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm bg-white font-medium"
                  />
                </div>

                <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
                  {(['All', 'PDF Tools', 'Image Tools', 'Text & Calculators', 'Developer & Security', 'Generators', 'Daily Essentials'] as ToolCategory[]).map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-3 sm:px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                        selectedCategory === cat
                          ? 'bg-gradient-to-r from-indigo-600 to-fuchsia-600 text-white shadow-md shadow-indigo-500/20'
                          : 'bg-white border border-slate-200 text-slate-600 hover:border-indigo-300'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>
            </section>

            {!searchQuery && selectedCategory === 'All' && (
              <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 sm:pt-12 pb-6">
                <div className="flex items-center gap-2 mb-6">
                  <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center font-bold shrink-0">
                    <Sparkles className="w-5 h-5 text-amber-500" />
                  </div>
                  <div>
                    <h2 className="text-lg sm:text-xl font-black text-slate-900">🔥 Viral Hype Spotlight: Compressor & Land Converter</h2>
                    <p className="text-xs text-slate-500">Our highest-demand daily utilities engineered for instant browser processing</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                  <div
                    onClick={() => navigate('/image-compressor')}
                    className="group bg-gradient-to-br from-amber-500/10 via-orange-500/5 to-white border-2 border-orange-300 rounded-3xl p-6 shadow-lg hover:shadow-xl transition cursor-pointer relative overflow-hidden"
                  >
                    <div className="absolute top-4 right-4 px-2.5 py-1 bg-orange-600 text-white text-[10px] font-black uppercase tracking-wider rounded-full">#1 Hype</div>
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500 to-red-600 text-white flex items-center justify-center shadow-md mb-4 group-hover:scale-105 transition">
                      <Flame className="w-7 h-7" />
                    </div>
                    <h3 className="text-lg font-black text-slate-900 group-hover:text-orange-600 transition">Image Compressor (KB / MB)</h3>
                    <p className="text-xs text-slate-600 mt-2 leading-relaxed">Compress JPG & PNG to exact limits (20KB, 50KB) for exam forms and government portals.</p>
                    <div className="mt-4 flex items-center gap-1 text-xs font-bold text-orange-600">
                      <span>Launch Compressor</span> <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition" />
                    </div>
                  </div>

                  <div
                    onClick={() => navigate('/unit-converter')}
                    className="group bg-gradient-to-br from-indigo-500/10 via-blue-500/5 to-white border-2 border-indigo-300 rounded-3xl p-6 shadow-lg hover:shadow-xl transition cursor-pointer relative overflow-hidden"
                  >
                    <div className="absolute top-4 right-4 px-2.5 py-1 bg-indigo-600 text-white text-[10px] font-black uppercase tracking-wider rounded-full">Land & Math</div>
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-600 to-blue-600 text-white flex items-center justify-center shadow-md mb-4 group-hover:scale-105 transition">
                      <Scale className="w-7 h-7" />
                    </div>
                    <h3 className="text-lg font-black text-slate-900 group-hover:text-indigo-600 transition">Universal Unit & Land Converter</h3>
                    <p className="text-xs text-slate-600 mt-2 leading-relaxed">Convert Bigha to Feet, Feet to Bigha, Meters to CM, Kadi to Feet, Acres, and more instantly.</p>
                    <div className="mt-4 flex items-center gap-1 text-xs font-bold text-indigo-600">
                      <span>Convert Units Now</span> <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition" />
                    </div>
                  </div>

                  <div
                    onClick={() => navigate('/jpg-to-png')}
                    className="group bg-gradient-to-br from-cyan-500/10 via-blue-500/5 to-white border-2 border-cyan-300 rounded-3xl p-6 shadow-lg hover:shadow-xl transition cursor-pointer relative overflow-hidden"
                  >
                    <div className="absolute top-4 right-4 px-2.5 py-1 bg-cyan-600 text-white text-[10px] font-black uppercase tracking-wider rounded-full">Essential</div>
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 text-white flex items-center justify-center shadow-md mb-4 group-hover:scale-105 transition">
                      <ImageIcon className="w-7 h-7" />
                    </div>
                    <h3 className="text-lg font-black text-slate-900 group-hover:text-cyan-600 transition">JPG to PNG Converter</h3>
                    <p className="text-xs text-slate-600 mt-2 leading-relaxed">Convert JPG images to lossless PNG format instantly in your browser.</p>
                    <div className="mt-4 flex items-center gap-1 text-xs font-bold text-cyan-600">
                      <span>Convert Now</span> <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition" />
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 mb-6">
                  <div className="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold shrink-0">
                    <Sparkles className="w-5 h-5 text-indigo-500" />
                  </div>
                  <div>
                    <h2 className="text-lg sm:text-xl font-black text-slate-900">⚡ Featured Daily Utilities</h2>
                    <p className="text-xs text-slate-500">Most popular verified utilities used for daily office & web work</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                  {featuredTools.map((tool) => (
                    <div
                      key={tool.id}
                      onClick={() => navigate(tool.slug)}
                      className="group rounded-2xl border p-6 shadow-md hover:shadow-xl transition-all duration-200 flex flex-col justify-between cursor-pointer bg-gradient-to-b from-white to-slate-50/80 border-indigo-100 hover:border-indigo-500 relative overflow-hidden"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-4">
                          <div className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-md bg-gradient-to-br from-indigo-600 to-fuchsia-600 text-white shrink-0">
                            <ToolIcon id={tool.id} className="w-6 h-6" />
                          </div>
                          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold border bg-indigo-50 text-indigo-700 border-indigo-100">
                            {tool.badge || 'Popular'}
                          </span>
                        </div>
                        <h3 className="text-base font-bold text-slate-900 group-hover:text-indigo-600 transition">
                          {tool.name}
                        </h3>
                        <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">{tool.shortDesc}</p>
                      </div>
                      <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-indigo-600">
                        <span>Launch Tool</span>
                        <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-lg sm:text-xl font-black text-slate-900">
                    {selectedCategory === 'All' ? 'All Verified Pro Utilities' : selectedCategory}
                  </h2>
                  <p className="text-xs text-slate-500">Showing {filteredTools.length} verified working tools</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {filteredTools.map((tool) => (
                  <div
                    key={tool.id}
                    onClick={() => navigate(tool.slug)}
                    className="group rounded-2xl border p-6 shadow-sm hover:shadow-xl transition-all duration-200 flex flex-col justify-between cursor-pointer bg-white border-slate-200/90 hover:border-indigo-500"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-md bg-slate-100 text-slate-700 group-hover:bg-gradient-to-br group-hover:from-indigo-600 group-hover:to-fuchsia-600 group-hover:text-white transition-all shrink-0">
                          <ToolIcon id={tool.id} className="w-6 h-6" />
                        </div>
                        <span className="text-[11px] font-semibold text-slate-400">{tool.category}</span>
                      </div>
                      <h3 className="text-base font-bold text-slate-900 group-hover:text-indigo-600 transition">
                        {tool.name}
                      </h3>
                      <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">{tool.shortDesc}</p>
                    </div>
                    <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-indigo-600">
                      <span>Launch Tool</span>
                      <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        )}

        {currentTool && (
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
            <div>
              <button
                type="button"
                onClick={() => navigate('/')}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-800 mb-4"
              >
                <ArrowLeft className="w-4 h-4" /> Back to All Tools
              </button>
              <div className="flex items-start sm:items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl text-white flex items-center justify-center shadow-md shrink-0 bg-gradient-to-br from-indigo-600 to-fuchsia-600">
                  <ToolIcon id={currentTool.id} className="w-6 h-6" />
                </div>
                <div>
                  <h1 className="text-xl sm:text-3xl font-black text-slate-900">{currentTool.name}</h1>
                  <p className="text-xs sm:text-sm text-slate-600 mt-0.5">{currentTool.shortDesc}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-3xl border border-slate-200 shadow-xl shadow-indigo-500/5 p-4 sm:p-8">
              {renderActiveToolComponent(currentTool)}
            </div>

            <AdSenseUnit config={config} slotId={config.adsense.inArticleSlotId} />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pt-4">
              <div className="lg:col-span-7 space-y-6">
                <div className="bg-slate-50 rounded-2xl p-6 border space-y-3">
                  <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-indigo-600 shrink-0" /> {currentTool.guideTitle}
                  </h2>
                  {currentTool.guideParagraphs.map((p, i) => (
                    <p key={i} className="text-xs sm:text-sm text-slate-600 leading-relaxed">{p}</p>
                  ))}
                </div>
              </div>
              <div className="lg:col-span-5 space-y-6">
                <div className="bg-indigo-50/60 rounded-2xl p-6 border border-indigo-100">
                  <h2 className="font-bold text-slate-900 text-base mb-4">How to Use</h2>
                  <ol className="space-y-3">
                    {currentTool.howItWorks.map((step, i) => (
                      <li key={i} className="flex items-start gap-3 text-xs text-slate-700 leading-relaxed">
                        <span className="w-6 h-6 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center shrink-0 text-[11px]">{i + 1}</span>
                        <span>{step}</span>
                      </li>
                    ))}
                  </ol>
                </div>
              </div>
            </div>
          </div>
        )}

        {route === '/about' && (
          <div className="max-w-3xl mx-auto px-4 py-12 space-y-6">
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900">About ApexToolkit Pro</h1>
            <div className="bg-slate-50 p-6 sm:p-8 rounded-3xl border space-y-4">
              <p className="text-slate-700 leading-relaxed font-medium text-sm sm:text-base">
                ApexToolkit Pro was engineered and founded by <strong className="text-indigo-600">Shoury Verma</strong> from <strong className="text-indigo-600">Awagarh, District Etah</strong>.
              </p>
              <p className="text-slate-600 leading-relaxed text-xs sm:text-sm">
                Growing up in Awagarh and witnessing the daily digital hurdles faced by students, farmers, professionals, and citizens—such as compressing exam photos to strict KB limits, converting regional land units like Bigha and Kadi, or merging important PDFs—Shoury set out to build a platform that brings enterprise-grade speed and privacy to everyone.
              </p>
              <p className="text-slate-600 leading-relaxed text-xs sm:text-sm">
                ApexToolkit Pro operates 100% locally in your browser memory. Your private documents, land records, scanned signatures, and family photos never touch a remote server, ensuring absolute privacy and zero upload waiting times.
              </p>
            </div>
          </div>
        )}

        {route === '/faq' && (
          <div className="max-w-3xl mx-auto px-4 py-12 space-y-6">
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900">Frequently Asked Questions</h1>
            <div className="space-y-4">
              <div className="bg-slate-50 p-6 rounded-3xl border space-y-2">
                <h3 className="font-bold text-slate-900 text-sm sm:text-base">Are my files secure and private?</h3>
                <p className="text-xs sm:text-sm text-slate-600">Yes! Every file conversion, image compression, and PDF merge happens 100% inside your device browser memory. Files are never uploaded to any external server.</p>
              </div>
              <div className="bg-slate-50 p-6 rounded-3xl border space-y-2">
                <h3 className="font-bold text-slate-900 text-sm sm:text-base">Who created ApexToolkit Pro?</h3>
                <p className="text-xs sm:text-sm text-slate-600">ApexToolkit Pro was founded and developed by Shoury Verma from Awagarh, District Etah.</p>
              </div>
              <div className="bg-slate-50 p-6 rounded-3xl border space-y-2">
                <h3 className="font-bold text-slate-900 text-sm sm:text-base">Is this tool free to use?</h3>
                <p className="text-xs sm:text-sm text-slate-600">100% free with no registration required for core tools.</p>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* AUTH MODAL */}
      {showAuthModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl space-y-6 relative">
            <button
              type="button"
              onClick={() => setShowAuthModal(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-700"
            >
              <X className="w-6 h-6" />
            </button>
            <div className="text-center space-y-2">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-lg">
                <UserIcon className="w-7 h-7" />
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-slate-900">Sign in to ApexToolkit Pro</h3>
              <p className="text-xs text-slate-500">Save your document processing history across devices</p>
            </div>

            <div className="space-y-3 pt-2">
              <button
                type="button"
                onClick={handleGoogleLogin}
                className="w-full py-3.5 rounded-2xl border border-slate-300 font-bold text-xs text-slate-700 bg-white hover:bg-slate-50 flex items-center justify-center gap-3 shadow-sm transition"
              >
                <Globe className="w-4 h-4 text-blue-600" /> Continue with Google
              </button>
              <button
                type="button"
                onClick={handleAnonymousLogin}
                className="w-full py-3.5 rounded-2xl bg-indigo-600 text-white font-bold text-xs shadow-md hover:bg-indigo-700 transition"
              >
                Continue as Guest / Anonymous
              </button>
            </div>
          </div>
        </div>
      )}

      {/* HISTORY DRAWER */}
      {showHistoryDrawer && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex justify-end">
          <div className="bg-white w-full max-w-md h-full shadow-2xl flex flex-col p-6 overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b">
              <div className="flex items-center gap-2">
                <History className="w-5 h-5 text-indigo-600" />
                <h3 className="font-black text-lg text-slate-900">Your Document History</h3>
              </div>
              <button type="button" onClick={() => setShowHistoryDrawer(false)} className="p-2 text-slate-500 hover:bg-slate-100 rounded-xl">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 py-4 space-y-3">
              {historyItems.length === 0 ? (
                <div className="text-center py-16 text-slate-400 space-y-2">
                  <Clock className="w-10 h-10 mx-auto opacity-50" />
                  <p className="text-xs">No document history yet. Use any tool while signed in to record history.</p>
                </div>
              ) : (
                historyItems.map((item) => (
                  <div key={item.id} className="p-4 rounded-2xl bg-slate-50 border space-y-1">
                    <div className="flex justify-between items-start">
                      <span className="font-bold text-xs text-indigo-600">{item.toolName}</span>
                      <span className="text-[10px] text-slate-400">
                        {item.timestamp?.toDate ? item.timestamp.toDate().toLocaleTimeString() : 'Just now'}
                      </span>
                    </div>
                    <p className="text-xs font-semibold text-slate-800 truncate">{item.fileName || 'Processed Document'}</p>
                    {item.originalSize && (
                      <p className="text-[11px] text-slate-500">
                        {formatBytes(item.originalSize)} → {formatBytes(item.resultSize || 0)}
                      </p>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* FOOTER */}
      <footer className="bg-slate-950 text-slate-400 pt-14 pb-10 border-t border-slate-800 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 pb-10 border-b border-slate-800">
            <div className="space-y-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-500 to-fuchsia-600 flex items-center justify-center text-white">
                  <Sparkles className="w-4 h-4" />
                </div>
                <span className="font-black text-white text-base">ApexToolkit Pro</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Professional client-side PDF, image, land conversion, and calculation utilities. Zero server uploads.
              </p>
            </div>
            <div>
              <h4 className="font-bold text-white text-xs uppercase tracking-wider mb-3">Popular Hype Tools</h4>
              <ul className="space-y-2 text-xs">
                <li><button type="button" onClick={() => navigate('/image-compressor')} className="hover:text-white text-orange-400 font-bold">🔥 Image Compressor (KB/MB)</button></li>
                <li><button type="button" onClick={() => navigate('/unit-converter')} className="hover:text-white text-indigo-400 font-bold">📐 Unit & Land Converter</button></li>
                <li><button type="button" onClick={() => navigate('/jpg-to-png')} className="hover:text-white text-cyan-400 font-bold">🖼️ JPG to PNG Converter</button></li>
                <li><button type="button" onClick={() => navigate('/pdf-splitter')} className="hover:text-white text-purple-400 font-bold">✂️ PDF Splitter</button></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-white text-xs uppercase tracking-wider mb-3">Company</h4>
              <ul className="space-y-2 text-xs">
                <li><button type="button" onClick={() => navigate('/about')} className="hover:text-white">About Us (Shoury Verma)</button></li>
                <li><button type="button" onClick={() => navigate('/faq')} className="hover:text-white">FAQ</button></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-white text-xs uppercase tracking-wider mb-3">Resources</h4>
              <ul className="space-y-2 text-xs">
                <li><button type="button" onClick={() => navigate('/')} className="hover:text-white">All Verified Utilities</button></li>
              </ul>
            </div>
          </div>
          <div className="pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-2">
            <p>© {new Date().getFullYear()} ApexToolkit Pro. Founded by Shoury Verma (Awagarh, Etah).</p>
            <p>100% Client-Side Processing • Optimized for Cloudflare Pages</p>
          </div>
        </div>
      </footer>
    </div>
  );
}