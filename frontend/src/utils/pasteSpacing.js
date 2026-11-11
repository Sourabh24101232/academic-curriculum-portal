/**
 * pasteSpacing.js
 * Restores natural word and punctuation spacing when text copied from PDFs
 * arrives without spaces on clipboard paste, while leaving normally spaced text untouched.
 */

const TWO_LETTER_WORDS = new Set([
  'in', 'of', 'to', 'is', 'it', 'on', 'at', 'by', 'or', 'as', 'an', 'be',
  'we', 'he', 'my', 'no', 'so', 'up', 'go', 'do', 'if', 'me', 'us', 'am',
  'oh', 'ok', 'vs', 'ad', 'id', 'os', 'db', 'ai', 'ml', 'dl', 'cv', 'ip',
  'er', 'io', 'll', 'lr'
]);

const BAND0_WORDS = (
  'the and that for with this will are from their have has had not but all ' +
  'can get know use make learn study work understand into onto upon also more ' +
  'most such these those how what which who where when why each every both ' +
  'some other any only same very well then there here they them our your ' +
  'course courses student students data structure structures system systems ' +
  'design analysis'
).split(' ');

const REGULAR_VERBS = (
  'acquire analyze analyse apply assess build calculate classify cluster ' +
  'combine compare compute connect construct control convert cover create ' +
  'debug derive describe design detect develop differentiate discuss ' +
  'demonstrate emphasize enable encrypt enhance ensure equip establish ' +
  'estimate evaluate examine execute expand experiment explain explore expose ' +
  'extend facilitate familiarize focus formulate gain generate handle ' +
  'identify illustrate implement improve include index integrate interact ' +
  'interpret introduce investigate learn maintain manage map measure model ' +
  'normalize operate optimize organize parse perform plan predict prepare ' +
  'present prevent process produce program protect prove provide query ' +
  'recognize recover reduce refer represent require resolve retrieve review ' +
  'route schedule search secure select separate simulate solve sort specify ' +
  'store structure study summarize support synthesize test train transform ' +
  'translate transmit traverse update use utilize validate verify visualize work'
).split(/\s+/);

const COUNT_NOUNS = (
  'achievement algorithm alignment application architecture area arrangement ' +
  'aspect assessment assignment basic block bound branch channel circuit ' +
  'client component computation concept condition connection constraint ' +
  'controller counter course cycle database decision degree deployment ' +
  'description detail developer development device diagram difference ' +
  'dimension directory distribution domain edge element environment equation ' +
  'error example exercise experiment expression factor failure fault ' +
  'feature field file filter flow form format foundation framework ' +
  'function fundamental gate goal grammar graph group handler hazard heap ' +
  'heuristic hierarchy idea image implementation implication input ' +
  'instruction integer integral interface interrupt involvement issue item ' +
  'kernel key language layer layout level limitation line link list loop ' +
  'machine management measurement mechanism method metric model module ' +
  'multiplexer name network node notation note number object objective ' +
  'operation operator option outcome output overview package pair parameter ' +
  'parser part path pattern phase placement platform point pointer policy ' +
  'port position problem procedure processor program project property ' +
  'protocol prototype purpose queue range rate ratio record recurrence ' +
  'reference register relation relationship representation requirement ' +
  'resource result review role route rule sample scale schedule scheme ' +
  'scope section segment semiconductor sensor sequence server service ' +
  'session set signal simulation site skill solution source space ' +
  'specification stack stage standard state statement statistical step ' +
  'storage stream structure student study subject subset summary switch ' +
  'symbol system table target task technique technology term terminal test ' +
  'theorem thread tool topic transaction transfer transformation transistor ' +
  'transition tree trend trial trigger type unit update user utility ' +
  'value variable variant vector version view voltage volume way weight word'
).split(/\s+/);

const BAND1_WORDS = (
  'about above across after again against although always among another any ' +
  'around analytical analytics algebraic algorithmic analog applied ' +
  'appropriate approximate artificial asymptotic asynchronous atomic audio ' +
  'automated automatic autonomous available average balanced basic because ' +
  'become becomes becoming been before began begin begins beginning begun ' +
  'behavior behavioral behind below beneath beside between beyond binary ' +
  'boolean broad business busy capabilities capability careful carefully ' +
  'case cases central certain challenge challenges chapter chapters choose ' +
  'chooses choosing chose chosen class classes classic classical clear clearly ' +
  'cloud coding cognitive combinational combinatorial combinatorics commercial ' +
  'common commonly comparative competitive complete completely complex ' +
  'complexity comprehensive computational computer computers computing ' +
  'conceptual concise concurrency concurrent conditional consistent constant ' +
  'contemporary content contents context continue continuous conventional ' +
  'cooperative coordinate core correct correctly critical cryptographic ' +
  'current currently curriculum custom cyber daily deal deals dealing deep ' +
  'deeply definite deterministic different differential differentiation digital ' +
  'dimensional direct directly discrete distributed diverse does doing done ' +
  'down draw draws drawn drive drives driven during dynamic dynamical early ' +
  'economic educational effective effectively efficiency efficient electrical ' +
  'electronic electronics elementary embedded empirical end engineering ' +
  'enough enterprise entire entity entities environment environments equal ' +
  'equivalent essential essentially etc ethical ethics even ever every ' +
  'everything exact exactly except existing explicit explicitly exponential ' +
  'external fact facts far fast feasible feedback few finite first fixed ' +
  'flexible floating formal formally forward foundational four frame frames ' +
  'free from full fully functional further future gave general generalized ' +
  'generally generic geometric get gets getting give gives given giving ' +
  'global goes going gone good got gradual gradually graphical greedy ' +
  'hands hard hardware hash hashing held help helps helpful high higher ' +
  'highly homogeneous horizontal however human hybrid ideal identical idle ' +
  'immediate immediately impact implicit important importantly inclusive ' +
  'incomplete increase increasing independent independently indexes indices ' +
  'indirect industrial industry infinite information initial initially inner ' +
  'inside instead instructional intelligent interactive interdisciplinary ' +
  'intermediate internal international internet inverse iterative join joint ' +
  'just keep keeps keeping kept kinematics know knows knowing knew known ' +
  'knowledge large largely last late latent layered lead leads leading led ' +
  'least leave legal less let lexical libraries library life like likely ' +
  'limit linear linked little live local logic logical long longer look looks ' +
  'loss lossless lossy low lower made main mainly make makes making manual ' +
  'many marginal massive match matches mathematical mathematics matrices ' +
  'matrix maximum may mean meaning means meant mechanical media median ' +
  'medical meet meets meeting memories memory memoryless mental mention ' +
  'methodologies methodology micro minimal minimum minor mixed mobile modal ' +
  'modelling modern modular molecular monotonic more most much multi ' +
  'multicore multimedia multiple multivariate must mutual natural naturally ' +
  'near necessary need needs negative nested neural never new next noise ' +
  'noisy non nonlinear normal normalization normalized null numerical ' +
  'observable obtain obtained offline often once one online only open ' +
  'operational optical optimal optimization optional oral ordered ordering ' +
  'ordinary organization organizational oriented orthogonal other others ' +
  'our out outer outside over overall overflow overhead overlap overlapping ' +
  'own parallel parametric partial particle pass passive past per percent ' +
  'perhaps period periodic permanent personal physical piecewise pipelined ' +
  'place places planar plastic poor popular portable possible possibly ' +
  'potential potentially power powerful practical practice practices precise ' +
  'precisely preliminary prerequisite prerequisites previous primarily primary ' +
  'prime principal principle principles prior private probabilistic ' +
  'probabilities probability procedural processes processing product ' +
  'production professional programmable programming progressive proper ' +
  'properly properties property proportional protection public pure purely ' +
  'put puts putting qualitative quality quantities quantity quantum quick ' +
  'quickly quite radial random randomized rapid rapidly rather rational raw ' +
  'reactive read reads reading ready real realistic really reason reasoning ' +
  'receive recent recently recognize record records reliable reliability ' +
  'relevant remain remember remote repetitive representational required ' +
  'research residual resistant resolution resolve respect respective ' +
  'respectively respond response responsive rest restrict restricted retain ' +
  'reverse right rigid robust rotational round running ran safe safety said ' +
  'same saw say scalable scheduling science sciences scientific searches ' +
  'searching second secondary secret secure security see seem seems seen ' +
  'selection semantic semantics send sense sensitive sequential serial series ' +
  'serve several shape share shared sharp shift short should show shows ' +
  'showed shown side significant significantly silent similar similarity ' +
  'simple simply since single singular six situation size sizes small smart ' +
  'smooth so social socket sockets soft software solar solid somehow someone ' +
  'something sometimes soon sorting sound sparse spatial speak speaks ' +
  'speaking special specific specifically spectral spectrum speed speeds ' +
  'spend spends spending spent stand stands standard standards static ' +
  'steady step steps still stochastic stood strict strictly strong strongly ' +
  'structural structured studying style sub subset substantial successive ' +
  'such sufficient sufficiently supervised supplementary suppose sure ' +
  'surface symbolic symmetric synchronous syntactic syntax systematic ' +
  'tabular take takes taking taken took taught teach teaches teaching team ' +
  'technical technological technologies technology tell tells telling told ' +
  'temporal ten than thank thanks theoretical theories theory thermal thin ' +
  'think thinks thinking thought three through throughout tight time timing ' +
  'today together tolerant top topological topology total totally toward ' +
  'towards trade traditional training transient transitional translational ' +
  'transparent traversal triangular true try turbulent turn twin two typical ' +
  'typically ultimate unary unbiased unbounded uncertain underlying ' +
  'understands understanding understood uniform union unique unit units ' +
  'universal unknown unless unlimited unordered unsigned unstable ' +
  'unstructured unsupervised until up upper upward urban urgent usable ' +
  'usage useful usual usually utilities utility valid validation valuable ' +
  'various verification version versions vertical viable virtual visible ' +
  'vision visual visualization volatile volumetric wait want wanted was ' +
  'ways weak wearable web well went were what whatever when whenever where ' +
  'whereas wherever whether which while who whom whose why wide widely ' +
  'width will willing win winning wins wise with within without won works ' +
  'world worst would write writes writing written wrote year years yet you ' +
  'young your zero'
).split(/\s+/);

const DOMAIN_WORDS = (
  'abstract abstraction abstractions acyclic adjacency accuracy acid ' +
  'asymmetric authentication authorization automata automaton avl ' +
  'backtracking backpropagation bandwidth bayes bayesian bellman bfs ' +
  'bijective bijection blockchain bloom blooms bode bplustree btech btree ' +
  'btrees cache caching cad cam cartesian cfg clausal closure cmos ' +
  'competency competent congestion conquer contextfree convex cpu ' +
  'cryptanalysis cryptography cs cuda cybersecurity dag dbms deadlock ' +
  'deadlocks decrypt decryption degenerate demodulation devops dfs dijkstra ' +
  'diode diodes eigenvalue eigenvalues eigenvector eigenvectors ' +
  'electromagnetics electromagnetic encapsulation entropy faraday fft ' +
  'firewall firmware flip flops floyd ford fourier fpga fsm gauss gaussian ' +
  'gp gpu grammars halstead hamiltonian hdl heapify heuristics homomorphic ' +
  'huffman hypertext hypothesis inheritance inorder interrupt interrupts iot ' +
  'isomorphism java javascript jordan kadane karatsuba karnaugh kernels ' +
  'kirchhoff kmp knapsack kruskal kutta lambda laplace latency latex linux ' +
  'macos markov maxwell memoization mergesort microservices ' +
  'microarchitecture microcontroller microcontrollers microprocessor ' +
  'microprocessors middleware minterm minterms modulation mongodb mosfet ' +
  'mtech multicast multithreading mutex mysql nand newton nlp nonblocking ' +
  'nondeterministic nonpreemptive nonrelational nor norton nosql np ' +
  'npcomplete nphard nyquist oop opencl oracle os oscillator oscillators ' +
  'osi overfitting paging parity parsing pca perceptron phd photonics ' +
  'pipelining polymorphism polynomial postorder postgresql preorder prim ' +
  'prisma proficiency prolog pruning pseudocode pushdown python quicksort ' +
  'raphson rdbms recovery regex regularisation regularization relational ' +
  'risk robotics rtos runge scalability scheduler schema schemas semaphore ' +
  'semaphores servlet shortest simplex sorted spanning sql ssl starvation ' +
  'statics strassen subnetting switching symmetric synchronization ' +
  'syntaxdirected syscall syscalls taxonomy taylor tcp tdd tries turing udp ' +
  'undecidability unix url verilog vhdl virtualization vlsi vonneumann ' +
  'warshall websocket wifi xor yacc'
).split(/\s+/);

const PROTECTED_CASING_WORDS = new Set([
  'btech', 'mtech', 'phd', 'mysql', 'postgresql', 'nosql', 'graphql',
  'javascript', 'typescript', 'macos', 'ios', 'iot', 'latex', 'dbms',
  'rdbms', 'vlsi', 'cmos', 'fpga', 'vhdl', 'verilog', 'rtos', 'devops',
  'tcp', 'udp', 'http', 'https', 'html', 'css', 'sql', 'wifi', 'iiitbh',
  'opencl', 'mongodb', 'mapreduce', 'websocket'
]);

const KNOWN_TLDS_OR_ABBRS = new Set([
  'com', 'org', 'edu', 'net', 'gov', 'in', 'ac', 'io', 'ai', 'js', 'ts',
  'py', 'cpp', 'pdf', 'txt', 'csv', 'xlsx', 'eg', 'ie', 'etc'
]);

const WORD_COST = new Map();
const registerWord = (w, cost) => {
  if (!w || w.length < 2) return;
  const existing = WORD_COST.get(w);
  if (existing === undefined || cost < existing) {
    WORD_COST.set(w, cost);
  }
};

WORD_COST.set('a', 3.5);
WORD_COST.set('i', 3.6);

for (const w of TWO_LETTER_WORDS) {
  registerWord(w, 1.5);
}

for (const w of BAND0_WORDS) {
  registerWord(w, w.length <= 2 ? 1.5 : 0.85);
}

for (const verb of REGULAR_VERBS) {
  registerWord(verb, 1.65);
  registerWord(verb.endsWith('s') || verb.endsWith('x') || verb.endsWith('ch') || verb.endsWith('sh')
    ? `${verb}es`
    : verb.endsWith('y') && !/[aeiou]y$/.test(verb)
      ? `${verb.slice(0, -1)}ies`
      : `${verb}s`, 1.8);
  const base = verb.endsWith('e') && !verb.endsWith('ee') ? verb.slice(0, -1) : verb;
  registerWord(`${base}ed`, 1.8);
  registerWord(`${base}ing`, 1.75);
}

for (const noun of COUNT_NOUNS) {
  registerWord(noun, 1.65);
  const plural = noun.endsWith('s') || noun.endsWith('x') || noun.endsWith('ch') || noun.endsWith('sh')
    ? `${noun}es`
    : noun.endsWith('y') && !/[aeiou]y$/.test(noun)
      ? `${noun.slice(0, -1)}ies`
      : `${noun}s`;
  registerWord(plural, 1.75);
}

for (const w of BAND1_WORDS) {
  registerWord(w, w.length <= 2 ? 1.55 : 1.75);
}

for (const w of DOMAIN_WORDS) {
  registerWord(w, w.length <= 2 ? 1.85 : 2.05);
}

const WORD_PENALTY = 1.6;
const UNKNOWN_BASE = 11.0;
const UNKNOWN_CHAR_COST = 1.4;
const SINGLE_CHAR_UNKNOWN_EXTRA = 8.0;
const MAX_WORD_LEN = 24;

/**
 * Checks whether plain text already contains natural word spacing.
 */
const hasHealthyWordSpacing = (text) => {
  if (!text || typeof text !== 'string') return false;
  const letters = (text.match(/[A-Za-z]/g) || []).length;
  if (letters < 12) return true;
  const spaces = (text.match(/ /g) || []).length;
  return spaces / letters >= 0.06;
};

/**
 * Splits CamelCase only on fallback unknown subwords that were not recognized directly.
 */
const splitFallbackCamelCase = (span) => {
  if (PROTECTED_CASING_WORDS.has(span.toLowerCase())) {
    return [span];
  }
  return span
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/([A-Z]{2,})([A-Z][a-z])/g, '$1 $2')
    .split(' ')
    .filter(Boolean);
};

/**
 * Splits a concatenated alphabetic run into dictionary words using Viterbi DP,
 * keeping unrecognized subwords intact rather than shattering them character-by-character.
 */
const segmentAlphabeticToken = (token) => {
  const lower = token.toLowerCase();
  const n = lower.length;
  if (n <= 3 || WORD_COST.has(lower)) {
    return [token];
  }

  const dp = new Array(n + 1).fill(Infinity);
  const back = new Array(n + 1).fill(0);
  const isKnownSpan = new Array(n + 1).fill(false);
  dp[0] = 0;

  for (let i = 1; i <= n; i++) {
    const startMin = Math.max(0, i - MAX_WORD_LEN);

    // 1. Dictionary word ending at i
    for (let j = i - 1; j >= startMin; j--) {
      if (dp[j] === Infinity) continue;
      const sub = lower.slice(j, i);
      const wordCost = WORD_COST.get(sub);
      if (wordCost !== undefined) {
        // Only split out standalone 'i' when uppercase 'I' in original text
        if (sub === 'i' && token[j] !== 'I') continue;
        const cand = dp[j] + wordCost + WORD_PENALTY;
        if (cand < dp[i]) {
          dp[i] = cand;
          back[i] = j;
          isKnownSpan[i] = true;
        }
      }
    }

    // 2. Fallback unknown span (minimum 2 chars unless forced, strongly discouraging 1-char orphans)
    for (let j = i - 2; j >= startMin; j--) {
      if (dp[j] === Infinity) continue;
      const sub = lower.slice(j, i);
      if (WORD_COST.has(sub)) continue;
      const cand = dp[j] + UNKNOWN_BASE + sub.length * UNKNOWN_CHAR_COST;
      if (cand < dp[i]) {
        dp[i] = cand;
        back[i] = j;
        isKnownSpan[i] = false;
      }
    }

    if (dp[i - 1] !== Infinity) {
      const cand1 =
        dp[i - 1] + UNKNOWN_BASE + UNKNOWN_CHAR_COST + SINGLE_CHAR_UNKNOWN_EXTRA;
      if (cand1 < dp[i]) {
        dp[i] = cand1;
        back[i] = i - 1;
        isKnownSpan[i] = false;
      }
    }
  }

  const spans = [];
  let cursor = n;
  while (cursor > 0) {
    const prev = back[cursor];
    const slice = token.slice(prev, cursor);
    spans.push({ text: slice, known: isKnownSpan[cursor] });
    cursor = prev;
  }
  spans.reverse();

  const merged = [];
  for (const item of spans) {
    if (!item.known) {
      merged.push(...splitFallbackCamelCase(item.text));
    } else {
      merged.push(item.text);
    }
  }
  return merged;
};

/**
 * Safely extracts plain text from clipboard HTML without inserting it into the live DOM.
 */
export const extractPlainTextFromHtml = (rawHtml) => {
  if (!rawHtml || typeof rawHtml !== 'string') return '';

  let doc = null;
  if (typeof Document !== 'undefined' && typeof Document.parseHTML === 'function') {
    doc = Document.parseHTML(rawHtml);
  } else if (typeof DOMParser !== 'undefined') {
    doc = new DOMParser().parseFromString(rawHtml, 'text/html');
  }

  if (!doc || !doc.body) return '';

  const SKIP_TAGS = new Set(['SCRIPT', 'STYLE', 'NOSCRIPT', 'TEMPLATE']);
  const BLOCK_TAGS = new Set([
    'ADDRESS', 'ARTICLE', 'ASIDE', 'BLOCKQUOTE', 'DD', 'DIV', 'DL', 'DT',
    'FIELDSET', 'FIGCAPTION', 'FIGURE', 'FOOTER', 'FORM', 'H1', 'H2', 'H3',
    'H4', 'H5', 'H6', 'HEADER', 'HR', 'LI', 'MAIN', 'NAV', 'OL', 'P',
    'PRE', 'SECTION', 'TABLE', 'TR', 'UL'
  ]);

  const chunks = [];
  const walk = (node) => {
    if (!node) return;
    if (node.nodeType === 3) {
      if (node.nodeValue) chunks.push(node.nodeValue);
      return;
    }
    if (node.nodeType !== 1) return;
    const tag = node.tagName;
    if (SKIP_TAGS.has(tag)) return;
    if (tag === 'BR') {
      chunks.push('\n');
      return;
    }
    const isBlock = BLOCK_TAGS.has(tag);
    if (isBlock && chunks.length > 0 && !chunks[chunks.length - 1].endsWith('\n')) {
      chunks.push('\n');
    }
    for (let child = node.firstChild; child; child = child.nextSibling) {
      walk(child);
    }
    if (isBlock && chunks.length > 0 && !chunks[chunks.length - 1].endsWith('\n')) {
      chunks.push('\n');
    }
  };

  walk(doc.body);
  return chunks.join('').replace(/\n{3,}/g, '\n\n').trim();
};

/**
 * Formats pasted text to restore proper spaces between concatenated words and around punctuation
 * while preserving normally spaced text, URLs, numbers, and bullet formatting.
 */
export const formatPastedObjectivesText = (rawPlainText, rawHtml = '') => {
  if (!rawPlainText && !rawHtml) return '';

  let text = typeof rawPlainText === 'string' ? rawPlainText : '';
  if (rawHtml && !hasHealthyWordSpacing(text)) {
    const htmlText = extractPlainTextFromHtml(rawHtml);
    if (htmlText && hasHealthyWordSpacing(htmlText)) {
      text = htmlText;
    }
  }

  // Normalize Unicode spacing, zero-width chars, and PDF hyphenated line wraps
  text = text
    .replace(/\r\n?/g, '\n')
    .replace(/[\u00A0\u1680\u2000-\u200A\u202F\u205F\u3000]/g, ' ')
    .replace(/[\u200B-\u200D\uFEFF\u2060\u00AD]/g, '')
    .replace(/([A-Za-z]{2,})-\n([a-z]{2,})/g, '$1$2');

  const overallUnspaced = !hasHealthyWordSpacing(text);

  const lines = text.split('\n');
  const formattedLines = lines.map((rawLine) => {
    let line = rawLine.replace(/[ \t]{2,}/g, ' ');
    if (!line.trim()) return '';

    const lineUnspaced = overallUnspaced || !hasHealthyWordSpacing(line);

    // 1. Segment concatenated alphabetic tokens while leaving URLs and emails untouched
    line = line.replace(
      /(https?:\/\/\S+|[\w.+-]+@[\w-]+\.[\w.-]+|[A-Za-z]+)/g,
      (token, _match, offset, source) => {
        if (
          token.startsWith('http://') ||
          token.startsWith('https://') ||
          token.includes('@')
        ) {
          return token;
        }

        const afterChar = offset + token.length < source.length
          ? source[offset + token.length]
          : '';
        if (afterChar === '.' && KNOWN_TLDS_OR_ABBRS.has(token.toLowerCase())) {
          return token;
        }

        const lower = token.toLowerCase();
        if (!lineUnspaced && token.length < 18) {
          return token;
        }
        if (WORD_COST.has(lower) || PROTECTED_CASING_WORDS.has(lower)) {
          return token;
        }

        return segmentAlphabeticToken(token).join(' ');
      }
    );

    // 2. Restore missing spaces after/around prose punctuation safely
    line = line
      .replace(/,([A-Za-z(])/g, ', $1')
      .replace(/;([^\s])/g, '; $1')
      .replace(/([A-Za-z)]):([A-Za-z0-9(])/g, '$1: $2')
      .replace(/([?!])([A-Za-z0-9(])/g, '$1 $2')
      .replace(/\b(e\.g\.|i\.e\.)([A-Za-z])/gi, '$1 $2')
      .replace(/([A-Za-z0-9)]{2,})\.([A-Z][a-z])/g, '$1. $2')
      .replace(/\)([A-Za-z0-9])/g, ') $1')
      .replace(/([A-Za-z]{2,})\(([A-Za-z])/g, '$1 ($2');

    if (lineUnspaced) {
      line = line.replace(/([a-z]{3,})\.([a-z]{2,})/g, (match, left, right) => {
        if (KNOWN_TLDS_OR_ABBRS.has(left) || KNOWN_TLDS_OR_ABBRS.has(right)) {
          return match;
        }
        return `${left}. ${right}`;
      });
    }

    return line.replace(/[ \t]{2,}/g, ' ').trim();
  });

  return formattedLines.join('\n');
};
