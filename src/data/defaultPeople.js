// Default squad data. Slot values are { n: 'Course Name', r: 'ROOMCODE' }.
// registered[day].theory = { slotCode: value }
// registered[day].lab    = { labCode:  value }
// Users can edit everything in the browser; edits are stored in localStorage.
// "Reset" restores this file's data.

export const DEFAULT_PEOPLE = [
  {
    id: 'vaishanth',
    name: 'Vaishanth',
    nickname: 'Playboy',
    emoji: '🐺',
    accent: '#e91e8c',
    registered: {
      MON: {
        theory: {
          A2: { n: 'BACSE202 - Data Structures', r: 'PRP472' },
          F2: { n: 'BAMAT207 - Prob & Stats', r: 'PRP275' },
          D2: { n: 'BASTS101 - Soft Skills', r: 'PRP575' },
          TB2: { n: 'BACSE203 - OOPS', r: 'PRP379' },
        },
        lab: {
          L5: { n: 'BACSE202 - DS Lab', r: 'PRP347' },
          L6: { n: 'BACSE202 - DS Lab', r: 'PRP347' },
        },
      },
      TUE: {
        theory: {
          B2: { n: 'BACSE203 - OOPS', r: 'PRP379' },
          E2: { n: 'BACSE324 - Computer Networks', r: 'PRP372' },
          TC2: { n: 'BAHUM107 - English', r: 'SJT118' },
          TAA2: { n: 'BAJAP101 - Japanese', r: 'PRP238A' },
        },
        lab: {
          L7: { n: 'BACSE102 - CS Fund Lab', r: 'PRP136' },
          L8: { n: 'BACSE102 - CS Fund Lab', r: 'PRP136' },
          L9: { n: 'BAMAT207 - Stats Lab', r: 'PRP446' },
          L10: { n: 'BAMAT207 - Stats Lab', r: 'PRP446' },
        },
      },
      WED: {
        theory: {
          C2: { n: 'BAHUM107 - English', r: 'SJT118' },
          A2: { n: 'BACSE202 - Data Structures', r: 'PRP472' },
          F2: { n: 'BAMAT207 - Prob & Stats', r: 'PRP275' },
          TD2: { n: 'BASTS101 - Soft Skills', r: 'PRP575' },
        },
        lab: {
          L15: { n: 'BAJAP101 - Japanese Lab', r: 'SJT517' },
          L16: { n: 'BAJAP101 - Japanese Lab', r: 'SJT517' },
        },
      },
      THU: {
        theory: {
          D2: { n: 'BASTS101 - Soft Skills', r: 'PRP575' },
          B2: { n: 'BACSE203 - OOPS', r: 'PRP379' },
          TE2: { n: 'BACSE324 - Computer Networks', r: 'PRP372' },
        },
        lab: {
          L19: { n: 'BACSE324 - CN Lab', r: 'SJT515' },
          L20: { n: 'BACSE324 - CN Lab', r: 'SJT515' },
          L21: { n: 'BACSE102 - CS Fund Lab', r: 'PRP136' },
          L22: { n: 'BACSE102 - CS Fund Lab', r: 'PRP136' },
        },
      },
      FRI: {
        theory: {
          E2: { n: 'BACSE324 - Computer Networks', r: 'PRP372' },
          C2: { n: 'BAHUM107 - English', r: 'SJT118' },
          TA2: { n: 'BACSE202 - Data Structures', r: 'PRP472' },
          TF2: { n: 'BAMAT207 - Prob & Stats', r: 'PRP275' },
        },
        lab: {
          L27: { n: 'BACSE203 - OOPS Lab', r: 'PRP136' },
          L28: { n: 'BACSE203 - OOPS Lab', r: 'PRP136' },
        },
      },
    },
  },
  {
    id: 'samarth',
    name: 'Samarth',
    nickname: 'Vanshu',
    emoji: '🐯',
    accent: '#1565c0',
    registered: {
      MON: {
        theory: {
          A1: { n: 'BACSE202 - Data Structures', r: 'PRP378' },
          F1: { n: 'BAMAT207 - Prob & Stats', r: 'PRP267' },
          D1: { n: 'BASTS101 - Soft Skills', r: 'PRP670' },
          TB1: { n: 'BACSE203 - OOPS', r: 'PRP576' },
        },
        lab: {
          L33: { n: 'BACSE102 - CS Fund Lab', r: 'PRP136' },
          L34: { n: 'BACSE102 - CS Fund Lab', r: 'PRP136' },
        },
      },
      TUE: {
        theory: {
          B1: { n: 'BACSE203 - OOPS', r: 'PRP576' },
          E1: { n: 'BACSE324 - Computer Networks', r: 'PRP465' },
        },
        lab: {
          L39: { n: 'BACSE324 - CN Lab', r: 'SJT515' },
          L40: { n: 'BACSE324 - CN Lab', r: 'SJT515' },
          L41: { n: 'BACSE202 - DS Lab', r: 'PRP136' },
          L42: { n: 'BACSE202 - DS Lab', r: 'PRP136' },
        },
      },
      WED: {
        theory: {
          A1: { n: 'BACSE202 - Data Structures', r: 'PRP378' },
          F1: { n: 'BAMAT207 - Prob & Stats', r: 'PRP267' },
        },
        lab: {
          L45: { n: 'BACSE102 - CS Fund Lab', r: 'PRP136' },
          L46: { n: 'BACSE102 - CS Fund Lab', r: 'PRP136' },
        },
      },
      THU: {
        theory: {
          D1: { n: 'BASTS101 - Soft Skills', r: 'PRP670' },
          B1: { n: 'BACSE203 - OOPS', r: 'PRP576' },
          TE1: { n: 'BACSE324 - Computer Networks', r: 'PRP465' },
        },
        lab: {
          L49: { n: 'BACSE203 - OOPS Lab', r: 'PRP352' },
          L50: { n: 'BACSE203 - OOPS Lab', r: 'PRP352' },
        },
      },
      FRI: {
        theory: {
          E1: { n: 'BACSE324 - Computer Networks', r: 'PRP465' },
          TA1: { n: 'BACSE202 - Data Structures', r: 'PRP378' },
          TF1: { n: 'BAMAT207 - Prob & Stats', r: 'PRP267' },
          TD1: { n: 'BASTS101 - Soft Skills', r: 'PRP670' },
        },
        lab: {
          L55: { n: 'BAMAT207 - Stats Lab', r: 'PRP446' },
          L56: { n: 'BAMAT207 - Stats Lab', r: 'PRP446' },
        },
      },
    },
  },
  {
    id: 'hardik',
    name: 'Hardik',
    nickname: 'Ganjedi',
    emoji: '🌿',
    accent: '#2e7d32',
    registered: {
      MON: {
        theory: {
          F1: { n: 'BACSE203 - OOPS', r: 'SJT825' },
          TB1: { n: 'BACSE202 - Data Structures', r: 'SJT125' },
          A2: { n: 'BACSE201 - Discrete Maths', r: 'PRP332' },
        },
        lab: {
          L35: { n: 'BACSE102 - CS Fund Lab', r: 'PRP347' },
          L36: { n: 'BACSE102 - CS Fund Lab', r: 'PRP347' },
        },
      },
      TUE: {
        theory: {
          B1: { n: 'BACSE202 - Data Structures', r: 'SJT125' },
          E1: { n: 'BASTS101 - Soft Skills', r: 'SJT215' },
          TC2: { n: 'BAHUM107 - English', r: 'SJT118' },
          TAA2: { n: 'BACSE201 - Discrete Maths', r: 'PRP332' },
        },
        lab: {
          L37: { n: 'BACSE203 - OOPS Lab', r: 'SJTG18' },
          L38: { n: 'BACSE203 - OOPS Lab', r: 'SJTG18' },
        },
      },
      WED: {
        theory: {
          F1: { n: 'BACSE203 - OOPS', r: 'SJT825' },
          C2: { n: 'BAHUM107 - English', r: 'SJT118' },
          A2: { n: 'BACSE201 - Discrete Maths', r: 'PRP332' },
        },
        lab: {
          L45: { n: 'BACSE102 - CS Fund Lab', r: 'PRP347' },
          L46: { n: 'BACSE102 - CS Fund Lab', r: 'PRP347' },
        },
      },
      THU: {
        theory: {
          B1: { n: 'BACSE202 - Data Structures', r: 'SJT125' },
          TE1: { n: 'BASTS101 - Soft Skills', r: 'SJT215' },
        },
        lab: {
          L51: { n: 'BACSE202 - DS Lab', r: 'SJT218' },
          L52: { n: 'BACSE202 - DS Lab', r: 'SJT218' },
        },
      },
      FRI: {
        theory: {
          E1: { n: 'BASTS101 - Soft Skills', r: 'SJT215' },
          TF1: { n: 'BACSE203 - OOPS', r: 'SJT825' },
          C2: { n: 'BAHUM107 - English', r: 'SJT118' },
          TA2: { n: 'BACSE201 - Discrete Maths', r: 'PRP332' },
        },
        lab: {},
      },
    },
  },
  {
    id: 'manan',
    name: 'Manan',
    nickname: 'Ghaziabaddie',
    emoji: '🦁',
    accent: '#e65100',
    registered: {
      MON: {
        theory: {
          A1: { n: 'BACSE201 - Discrete Maths', r: 'PRP333' },
          F1: { n: 'BAMAT207 - Prob & Stats', r: 'PRP568' },
          TB1: { n: 'BACSE202 - Data Structures', r: 'SJT125' },
          TG1: { n: 'BAHUM119 - Hist & Phil Sci', r: 'GDN122' },
        },
        lab: {
          L35: { n: 'BAMAT207 - Stats Lab', r: 'PRP119' },
          L36: { n: 'BAMAT207 - Stats Lab', r: 'PRP119' },
        },
      },
      TUE: {
        theory: {
          B1: { n: 'BACSE202 - Data Structures', r: 'SJT125' },
          G1: { n: 'BAHUM119 - Hist & Phil Sci', r: 'GDN122' },
          E1: { n: 'BASTS101 - Soft Skills', r: 'SJT224' },
          TAA1: { n: 'BACSE201 - Discrete Maths', r: 'PRP333' },
        },
        lab: {},
      },
      WED: {
        theory: {
          A1: { n: 'BACSE201 - Discrete Maths', r: 'PRP333' },
          F1: { n: 'BAMAT207 - Prob & Stats', r: 'PRP568' },
        },
        lab: {},
      },
      THU: {
        theory: {
          B1: { n: 'BACSE202 - Data Structures', r: 'SJT125' },
          G1: { n: 'BAHUM119 - Hist & Phil Sci', r: 'GDN122' },
          TE1: { n: 'BASTS101 - Soft Skills', r: 'SJT224' },
          TCC1: { n: 'BAESP101 - Spanish', r: 'SJT118' },
        },
        lab: {
          L49: { n: 'BACSE102 - CS Fund Lab', r: 'SJT122' },
          L50: { n: 'BACSE102 - CS Fund Lab', r: 'SJT122' },
          L51: { n: 'BACSE202 - DS Lab', r: 'SJT218' },
          L52: { n: 'BACSE202 - DS Lab', r: 'SJT218' },
        },
      },
      FRI: {
        theory: {
          E1: { n: 'BASTS101 - Soft Skills', r: 'SJT224' },
          TA1: { n: 'BACSE201 - Discrete Maths', r: 'PRP333' },
          TF1: { n: 'BAMAT207 - Prob & Stats', r: 'PRP568' },
        },
        lab: {
          L55: { n: 'BACSE102 - CS Fund Lab', r: 'SJT122' },
          L56: { n: 'BACSE102 - CS Fund Lab', r: 'SJT122' },
          L57: { n: 'BAESP101 - Spanish Lab', r: 'PRP555' },
          L58: { n: 'BAESP101 - Spanish Lab', r: 'PRP555' },
        },
      },
    },
  },
  {
    id: 'anish',
    name: 'Anish',
    nickname: 'Pontu',
    emoji: '🖤',
    accent: '#9e9e9e',
    registered: {
      MON: {
        theory: {
          A1: { n: 'BACSE201 - Discrete Maths', r: 'SJT126' },
          F1: { n: 'BACSE203 - OOPS', r: 'SJT824' },
          TB1: { n: 'BACSE202 - Data Structures', r: 'SJT125' },
          TG1: { n: 'BAMAT207 - Prob & Stats', r: 'SJT522' },
        },
        lab: {},
      },
      TUE: {
        theory: {
          B1: { n: 'BACSE202 - Data Structures', r: 'SJT125' },
          G1: { n: 'BAMAT207 - Prob & Stats', r: 'SJT522' },
          E1: { n: 'BASTS101 - Soft Skills', r: 'SJT221' },
          TC1: { n: 'BAHUM107 - English', r: 'PRP333' },
          TAA1: { n: 'BACSE201 - Discrete Maths', r: 'SJT126' },
        },
        lab: {},
      },
      WED: {
        theory: {
          C1: { n: 'BAHUM107 - English', r: 'PRP333' },
          A1: { n: 'BACSE201 - Discrete Maths', r: 'SJT126' },
          F1: { n: 'BACSE203 - OOPS', r: 'SJT824' },
        },
        lab: {
          L43: { n: 'BACSE102 - CS Fund Lab', r: 'SJT218' },
          L44: { n: 'BACSE102 - CS Fund Lab', r: 'SJT218' },
          L45: { n: 'BAMAT207 - Stats Lab', r: 'PRP446' },
          L46: { n: 'BAMAT207 - Stats Lab', r: 'PRP446' },
          L47: { n: 'BACSE203 - OOPS Lab', r: 'SJT216' },
          L48: { n: 'BACSE203 - OOPS Lab', r: 'SJT216' },
        },
      },
      THU: {
        theory: {
          B1: { n: 'BACSE202 - Data Structures', r: 'SJT125' },
          G1: { n: 'BAMAT207 - Prob & Stats', r: 'SJT522' },
          TE1: { n: 'BASTS101 - Soft Skills', r: 'SJT221' },
        },
        lab: {
          L51: { n: 'BACSE202 - DS Lab', r: 'SJT218' },
          L52: { n: 'BACSE202 - DS Lab', r: 'SJT218' },
        },
      },
      FRI: {
        theory: {
          E1: { n: 'BASTS101 - Soft Skills', r: 'SJT221' },
          C1: { n: 'BAHUM107 - English', r: 'PRP333' },
          TA1: { n: 'BACSE201 - Discrete Maths', r: 'SJT126' },
          TF1: { n: 'BACSE203 - OOPS', r: 'SJT824' },
        },
        lab: {
          L55: { n: 'BACSE102 - CS Fund Lab', r: 'SJT218' },
          L56: { n: 'BACSE102 - CS Fund Lab', r: 'SJT218' },
        },
      },
    },
  },
  {
    id: 'sree-hari',
    name: 'Sree Hari',
    nickname: 'Gambler',
    emoji: '🎰',
    accent: '#b71c1c',
    registered: {
      MON: {
        theory: {
          A1: { n: 'BAECE201 - Circuit Theory', r: 'PRP427' },
          F1: { n: 'BAECE350 - VLSI Design', r: 'PRP632' },
          D1: { n: 'BAECE204 - Signals & Systems', r: 'PRP429' },
          TB1: { n: 'BAECE203 - Elec Devices', r: 'PRP425' },
          TG1: { n: 'BAHUM111 - Economics', r: 'PRP568' },
        },
        lab: {
          L31: { n: 'BAECE350 - VLSI Lab', r: 'PRP405' },
          L32: { n: 'BAECE350 - VLSI Lab', r: 'PRP405' },
          L35: { n: 'BAECE204 - Signals Lab', r: 'TT729' },
          L36: { n: 'BAECE204 - Signals Lab', r: 'TT729' },
        },
      },
      TUE: {
        theory: {
          B1: { n: 'BAECE203 - Elec Devices', r: 'PRP425' },
          G1: { n: 'BAHUM111 - Economics', r: 'PRP568' },
          E1: { n: 'BASTS101 - Soft Skills', r: 'PRP251' },
          TC1: { n: 'BAECE202 - Electromagnetics', r: 'PRP424' },
          TAA1: { n: 'BAECE201 - Circuit Theory', r: 'PRP427' },
        },
        lab: {
          L39: { n: 'BAECE203 - Elec Devices Lab', r: 'TT246' },
          L40: { n: 'BAECE203 - Elec Devices Lab', r: 'TT246' },
        },
      },
      WED: {
        theory: {
          C1: { n: 'BAECE202 - Electromagnetics', r: 'PRP424' },
          A1: { n: 'BAECE201 - Circuit Theory', r: 'PRP427' },
          F1: { n: 'BAECE350 - VLSI Design', r: 'PRP632' },
        },
        lab: {},
      },
      THU: {
        theory: {
          D1: { n: 'BAECE204 - Signals & Systems', r: 'PRP429' },
          B1: { n: 'BAECE203 - Elec Devices', r: 'PRP425' },
          G1: { n: 'BAHUM111 - Economics', r: 'PRP568' },
          TE1: { n: 'BASTS101 - Soft Skills', r: 'PRP251' },
          TCC1: { n: 'BAECE202 - Electromagnetics', r: 'PRP424' },
        },
        lab: {},
      },
      FRI: {
        theory: {
          E1: { n: 'BASTS101 - Soft Skills', r: 'PRP251' },
          C1: { n: 'BAECE202 - Electromagnetics', r: 'PRP424' },
          TA1: { n: 'BAECE201 - Circuit Theory', r: 'PRP427' },
          TF1: { n: 'BAECE350 - VLSI Design', r: 'PRP632' },
          TD1: { n: 'BAECE204 - Signals & Systems', r: 'PRP429' },
        },
        lab: {},
      },
    },
  },
];
