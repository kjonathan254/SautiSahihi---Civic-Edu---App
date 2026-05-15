// /lib/civicKnowledge.ts
// SCTH Civic Knowledge Base — MVP v1.0
// Sources: Constitution of Kenya 2010, Elections Act No. 24 of 2011, 
// IEBC Act 2011, Political Parties Act 2011
// Last verified: 2026-05-15

export interface CivicChunk {
  id: string;
  source: string;
  section: string;
  title: string;
  keywords: string[];
  content: string;
}

export const civicKnowledge: CivicChunk[] = [
  // ============================================================
  // CONSTITUTION OF KENYA 2010
  // ============================================================

  {
    id: "constitution-article-1",
    source: "Constitution of Kenya 2010",
    section: "Article 1",
    title: "Sovereignty of the people",
    keywords: [
      "sovereignty",
      "power belongs to people",
      "who has power in Kenya",
      "people's power",
      "mwananchi",
      "citizen power"
    ],
    content: `
(1) All sovereign power belongs to the people of Kenya and shall be exercised only in accordance with this Constitution.

(2) The people may exercise their sovereign power either directly or through their democratically elected representatives.

(3) Sovereign power under this Constitution is delegated to the following State organs, which shall perform their functions in accordance with this Constitution—

(a) Parliament and the legislative assemblies in the county governments;
(b) the national executive and the executive structures in the county governments; and
(c) the Judiciary and independent tribunals.

(4) The sovereign power of the people is exercised at the national and county level.
`
  },

  {
    id: "constitution-article-10",
    source: "Constitution of Kenya 2010",
    section: "Article 10",
    title: "National values and principles of governance",
    keywords: [
      "national values",
      "principles of governance",
      "patriotism",
      "rule of law",
      "unity",
      "integrity",
      "transparency",
      "accountability",
      "human dignity"
    ],
    content: `
(1) The national values and principles of governance in this Article bind all State organs, State officers, public officers and all persons whenever any of them—

(a) applies or interprets this Constitution;
(b) enacts, applies or interprets any law; or
(c) makes or implements public policy decisions.

(2) The national values and principles of governance include—

(a) patriotism, national unity, sharing and devolution of power, the rule of law, democracy and participation of the people;

(b) human dignity, equity, social justice, inclusiveness, equality, human rights, non-discrimination and protection of the marginalised;

(c) good governance, integrity, transparency and accountability; and

(d) sustainable development.
`
  },

  {
    id: "constitution-article-38",
    source: "Constitution of Kenya 2010",
    section: "Article 38",
    title: "Political rights",
    keywords: [
      "political rights",
      "form political party",
      "vote",
      "campaign",
      "election rights",
      "right to vote",
      "candidate",
      "secret ballot"
    ],
    content: `
(1) Every citizen is free to make political choices, which includes the right—

(a) to form, or participate in forming, a political party;
(b) to participate in the activities of, or recruit members for, a political party; or
(c) to campaign for a political party or cause.

(2) Every citizen has the right to free, fair and regular elections based on universal suffrage and the free expression of the will of the electors for—

(a) any elective public body or office established under this Constitution; or
(b) any office of any political party of which the citizen is a member.

(3) Every adult citizen has the right, without unreasonable restrictions—

(a) to be registered as a voter;
(b) to vote by secret ballot in any election or referendum; and
(c) to be a candidate for public office, or office within a political party of which the citizen is a member and, if elected, to hold office.
`
  },

  {
    id: "constitution-article-81",
    source: "Constitution of Kenya 2010",
    section: "Article 81",
    title: "General principles for the electoral system",
    keywords: [
      "electoral system",
      "election principles",
      "free and fair elections",
      "secret ballot",
      "gender rule",
      "two-thirds gender",
      "universal suffrage",
      "persons with disabilities"
    ],
    content: `
The electoral system shall comply with the following principles—

(a) freedom of citizens to exercise their political rights under Article 38;

(b) not more than two-thirds of the members of elective public bodies shall be of the same gender;

(c) fair representation of persons with disabilities;

(d) universal suffrage based on the aspiration for fair representation and equality of vote; and

(e) free and fair elections, which are—

(i) by secret ballot;
(ii) free from violence, intimidation, improper influence or corruption;
(iii) conducted by an independent body;
(iv) transparent; and
(v) administered in an impartial, neutral, efficient, accurate and accountable manner.
`
  },

  {
    id: "constitution-article-82",
    source: "Constitution of Kenya 2010",
    section: "Article 82",
    title: "Legislation on elections",
    keywords: [
      "delimitation",
      "boundary review",
      "constituency boundaries",
      "ward boundaries",
      "voter registration",
      "continuous registration",
      "diaspora voting"
    ],
    content: `
(1) Parliament shall enact legislation to provide for—

(a) the delimitation by the Independent Electoral and Boundaries Commission of electoral units for election of members of the National Assembly and county assemblies;

(b) the nomination of candidates;

(c) the continuous registration of citizens as voters;

(d) the conduct of elections and referenda and the regulation and efficient supervision of elections and referenda, including the nomination of candidates for elections; and

(e) the progressive registration of citizens residing outside Kenya, and the progressive realisation of their right to vote.

(2) Legislation required by clause (1)(d) shall ensure that voting at every election is—

(a) simple;
(b) transparent; and
(c) takes into account the special needs of—

(i) persons with disabilities; and
(ii) other persons or groups with special needs.
`
  },

  {
    id: "constitution-article-83",
    source: "Constitution of Kenya 2010",
    section: "Article 83",
    title: "Qualifications for registration as a voter",
    keywords: [
      "voter registration",
      "who can vote",
      "register voter",
      "voting age",
      "citizen voting",
      "adult citizen",
      "unsound mind",
      "election offence"
    ],
    content: `
(1) A person qualifies for registration as a voter at elections or referenda if the person—

(a) is an adult citizen;
(b) is not declared to be of unsound mind; and
(c) has not been convicted of an election offence during the preceding five years.

(2) A citizen who qualifies for registration as a voter shall be registered at only one registration centre.

(3) Administrative arrangements for the registration of voters and the conduct of elections shall be designed to facilitate, and shall not deny, an eligible citizen the right to vote or stand for election.
`
  },

  {
    id: "constitution-article-84",
    source: "Constitution of Kenya 2010",
    section: "Article 84",
    title: "Candidates for election and political parties to comply with code of conduct",
    keywords: [
      "candidate",
      "code of conduct",
      "election rules",
      "political party rules",
      "campaign rules",
      "independent candidate"
    ],
    content: `
In every election, all candidates and all political parties shall comply with the code of conduct prescribed by the Independent Electoral and Boundaries Commission.
`
  },

  {
    id: "constitution-article-85",
    source: "Constitution of Kenya 2010",
    section: "Article 85",
    title: "Eligibility to stand as an independent candidate",
    keywords: [
      "independent candidate",
      "stand alone",
      "no party candidate",
      "election without party",
      "independent"
    ],
    content: `
Any person is eligible to stand as an independent candidate for election if the person—

(a) is not a member of a registered political party and has not been a member for at least three months immediately before the date of the election; and

(b) satisfies the requirements of—

(i) Article 99(1)(c)(i) or (ii), in the case of a candidate for election to the National Assembly or the Senate, respectively; or

(ii) Article 193(1)(c)(ii), in the case of a candidate for election to a county assembly.
`
  },

  {
    id: "constitution-article-86",
    source: "Constitution of Kenya 2010",
    section: "Article 86",
    title: "Voting system requirements",
    keywords: [
      "voting system",
      "how to vote",
      "counting votes",
      "election results",
      "polling station",
      "electronic voting",
      "biometric"
    ],
    content: `
At every election, the Independent Electoral and Boundaries Commission shall ensure that—

(a) whatever voting method is used, the system is simple, accurate, verifiable, secure, accountable and transparent;

(b) the votes cast are counted, tabulated and the results announced promptly by the presiding officer at each polling station;

(c) the results from the polling stations are openly and accurately collated and promptly announced by the returning officer; and

(d) appropriate structures and mechanisms to eliminate electoral malpractice are put in place, including the safekeeping of election materials.
`
  },

  {
    id: "constitution-article-88",
    source: "Constitution of Kenya 2010",
    section: "Article 88",
    title: "Independent Electoral and Boundaries Commission",
    keywords: [
      "IEBC",
      "commission",
      "election management",
      "voter education",
      "delimitation",
      "electoral disputes",
      "election body"
    ],
    content: `
(1) There is established the Independent Electoral and Boundaries Commission.

(2) A person is not eligible for appointment as a member of the Commission if the person—

(a) has, at any time within the preceding five years, held office, or stood for election as—

(i) a member of Parliament or of a county assembly; or
(ii) a member of the governing body of a political party; or

(b) has, at any time within the preceding two years, held office in the Independent Electoral and Boundaries Commission established under the former Constitution; or

(c) has contested for election as a presidential, parliamentary or county seat at the preceding two elections immediately before the date of appointment; or

(d) has been dismissed or removed from a public office for contravening the provisions of Articles 75, 76, 77 or 78 of this Constitution.

(3) A chairperson, a vice-chairperson and six other members of the Commission shall be appointed by the President, with the approval of the National Assembly.

(4) The Commission is responsible for conducting or supervising referenda and elections to any elective body or office established by this Constitution, including the nomination of candidates as provided by this Constitution and legislation.

(5) The Commission shall exercise its powers and perform its functions in accordance with this Constitution and national legislation.
`
  },

  {
    id: "constitution-article-91",
    source: "Constitution of Kenya 2010",
    section: "Article 91",
    title: "Basic requirements for political parties",
    keywords: [
      "political parties",
      "party rules",
      "party membership",
      "party constitution",
      "democratic party",
      "accountable party"
    ],
    content: `
(1) Every political party shall—

(a) have a national character as prescribed by an Act of Parliament;
(b) have a democratically elected governing body;
(c) promote and uphold national unity;
(d) abide by the democratic principles of good governance, promote and practise democracy through regular, fair and free elections within the party;
(e) respect the right of all persons to participate in the political process, including minorities and marginalised groups;
(f) respect and promote human rights and fundamental freedoms, and gender equality and equity;
(g) promote the objects and principles of this Constitution and the rule of law; and
(h) subscribe to and observe the code of conduct for political parties.

(2) A political party shall not—

(a) be founded on a religious, linguistic, racial, ethnic, gender or regional basis or seek to engage in advocacy of hatred on any such basis;
(b) engage in or encourage violence by, or intimidation of, its members, supporters, opponents or any other person;
(c) establish or maintain a paramilitary force, militia or similar organisation;
(d) engage in bribery or other forms of corruption; or
(e) except as is provided under this Chapter or by an Act of Parliament, accept or use public resources.
`
  },

  // ============================================================
  // ELECTIONS ACT NO. 24 OF 2011
  // ============================================================

  {
    id: "elections-act-voter-registration",
    source: "Elections Act No. 24 of 2011",
    section: "Section 5",
    title: "Registration of voters",
    keywords: [
      "register to vote",
      "voter registration",
      "ID card",
      "passport",
      "national ID",
      "how to register",
      "registration centre",
      "continuous registration"
    ],
    content: `
(1) Registration of voters and revision of the register of voters under this Act shall be carried out at all times except—

(a) in the case of a general election or an election under Article 138(5) of the Constitution, between the date of commencement of the sixty day period immediately before the election and the date of such election;

(b) in the case of a by-election, between the date of the declaration of the vacancy of the seat concerned and the date of such by-election; or

(c) in any other case, between the date of the declaration of the vacancy of the seat concerned and the date of such election.

(2) Notwithstanding subsection (1), where an election petition is filed in respect of an electoral area, between the date of the filing of the petition and the date of the by-election, where a court determines that a by-election is to be held, a voter shall not be allowed to transfer his or her vote to the affected electoral area.

(3) Any citizen of Kenya who has attained the age of eighteen years as evidenced by either a national identity card or a Kenyan passport and whose name is not in the register of voters shall be registered as a voter upon application, in the prescribed manner, to the Commission.

(4) All applicants for registration under this section shall be registered in the appropriate register by the registration officer or any other officer authorised by the Commission.

(5) The registration officer or any other authorised officer referred to in subsection (3) shall, at such times as the Commission may direct, transmit the information relating to the registration of the voter to the Commission for inclusion in the Register of Voters.
`
  },

  {
    id: "elections-act-transfer-voters",
    source: "Elections Act No. 24 of 2011",
    section: "Section 6",
    title: "Transfer of voters",
    keywords: [
      "transfer voter",
      "change polling station",
      "move constituency",
      "new ward",
      "transfer registration",
      " relocate vote"
    ],
    content: `
(1) A voter who wishes to transfer his or her registration from one electoral area to another shall notify the Commission in the prescribed manner not less than ninety days preceding an election.

(2) Upon receipt of the notification under subsection (1), the Commission shall transfer the voter's registration particulars to the register of the preferred constituency not later than sixty days preceding the election.

(3) A voter shall not be entitled to transfer his or her registration from one electoral area to another after the expiry of the period specified in subsection (1).
`
  },

  {
    id: "elections-act-identification",
    source: "Elections Act No. 24 of 2011",
    section: "Section 44 & Schedule Forms",
    title: "Identification requirements for voting",
    keywords: [
      "what ID to vote",
      "vote without ID",
      "identification card",
      "passport to vote",
      "voter card",
      "required documents",
      "proof of identity"
    ],
    content: `
To vote in any election or referendum, a voter must produce:

(a) a national identity card; or
(b) a valid Kenyan passport.

Note: You must produce your identity card or Kenyan passport in order to vote. You are not entitled to vote unless your name appears in the register of voters.

For citizens residing outside Kenya:
A Kenya citizen residing outside Kenya shall apply for registration as a voter upon production of a valid Kenyan Passport.

Provided that citizens residing in countries within the East African Community may present an Identity Card.

A Kenya citizen residing outside Kenya shall only participate in a presidential election or a referendum.
`
  },

  {
    id: "elections-act-candidate-nomination",
    source: "Elections Act No. 24 of 2011",
    section: "Section 25-30",
    title: "Nomination of candidates",
    keywords: [
      "nominate candidate",
      "run for office",
      "election nomination",
      "party nomination",
      "independent candidate",
      "nomination papers",
      "requirements to run"
    ],
    content: `
(1) A person shall not be nominated as a candidate for an election under this Act unless that person—

(a) is registered as a voter;
(b) satisfies any educational, moral and ethical requirements prescribed by this Constitution or any Act of Parliament; and
(c) is nominated by a political party, or is an independent candidate who complies with the provisions of Article 85 of the Constitution.

(2) A person shall be qualified to be nominated as a candidate for election as President, Deputy President, Governor or Deputy Governor if the person—

(a) is a citizen by birth;
(b) is qualified to stand for election as a member of Parliament;
(c) is nominated by a political party or is an independent candidate; and
(d) meets the requirements of Chapter Six of the Constitution (Leadership and Integrity).

(3) A person shall not be qualified to be nominated as a candidate for any election if the person—

(a) is a State officer or other public officer, other than a Member of Parliament;
(b) has, within the preceding five years, held office as a member of the Independent Electoral and Boundaries Commission;
(c) has not been a citizen of Kenya for at least ten years immediately preceding the date of election;
(d) is a member of a county assembly;
(e) is of unsound mind;
(f) is an undischarged bankrupt;
(g) is serving a sentence of imprisonment of at least six months at the date of registration as a candidate or at the date of election;
(h) has been found to have abused or misused a State or public office or contravened the provisions of Chapter Six of the Constitution; or
(i) has been dismissed or removed from public office for contravening the provisions of Articles 75, 76, 77 or 78 of the Constitution.
`
  },

  {
    id: "elections-act-election-offences",
    source: "Elections Act No. 24 of 2011",
    section: "Section 107",
    title: "Election offences",
    keywords: [
      "election offence",
      "illegal voting",
      "vote twice",
      "bribery election",
      "intimidation",
      "election crime",
      "penalty",
      "fraud"
    ],
    content: `
(1) A person who commits an election offence is liable on conviction to a fine not exceeding one million shillings or to imprisonment for a term not exceeding six years or to both.

(2) Without prejudice to the generality of subsection (1), a person commits an election offence if that person—

(a) registers as a voter in more than one constituency or registration centre;
(b) applies for a ballot paper in the name of another person;
(c) votes more than once in any election;
(d) votes in an election in which the person is not entitled to vote;
(e) induces or compels another person to vote or refrain from voting;
(f) by abduction, duress or any fraudulent device or contrivance—

(i) impedes, prevents or otherwise interferes with the free exercise of the electoral rights of any person;
(ii) compels, induces or prevails upon any person either to vote or refrain from voting; or

(g) being a person having official duty in connection with an election, fails to perform that duty in accordance with this Act or any other written law;

(h) without lawful authority, prints or procures the printing of any ballot paper or the form of any ballot paper;

(i) forges or counterfeits any ballot paper or the official mark on any ballot paper;

(j) sells or offers for sale any ballot paper or the official mark;

(k) purchases or offers to purchase any ballot paper or the official mark;

(l) not being a person entitled under this Act to be in possession of any ballot paper or the official mark, has any ballot paper or the official mark in his or her possession;

(m) puts into any ballot box any paper other than the ballot paper which the person is authorised by law to put in;

(o) without authority, destroys, takes, opens or otherwise interferes with any ballot box or packet of ballot papers in use or intended for use for the purposes of an election;

(o) without authority, destroys, takes, opens or otherwise interferes with any document or equipment in use or intended for use for the purposes of an election;

(p) fraudulently puts into any ballot box a ballot paper which the person is not authorised by law to put in;

(q) fraudulently takes out of a polling station any ballot paper;

(r) without authority, supplies any ballot paper to any person;

(s) fraudulently puts into any ballot box a ballot paper which has been tampered with;

(t) at any election, knowingly personates any person, whether living or dead, or votes in the place of any person;

(u) signs any nomination paper or election petition knowing it to be false;

(v) publishes any false statement of the illness, death or withdrawal of a candidate at an election for the purpose of promoting or procuring the election of another candidate;

(w) being a candidate or an agent of a candidate, in any manner induces or procures any person to refrain from registering as a voter or from voting at an election;

(x) before or during an election, directly or indirectly, by himself or herself or any other person on his or her behalf, in order to induce any other person to vote or refrain from voting for any candidate—

(i) makes a gift or loan to, or promise of a gift or loan, or any office, place or employment to, any person;
(ii) procures or promises to procure any office, place or employment for any person;
(iii) gives or provides, or causes to be given or provided, or pays or promises to pay the whole or part of any money or other valuable consideration to any person for the purpose of procuring the return of any person as a member of Parliament or a member of a county assembly or for the purpose of procuring the vote of any person at an election;
(iv) makes any gift, loan, promise, offer or procurement to or for any person in order to induce that person to procure, or endeavour to procure, the return of any person as a member of Parliament or a member of a county assembly or the vote of any person at an election;
(v) gives or procures, or promises or offers to give or procure, or endeavour to procure, any money, gift, loan or valuable consideration to or for any person on behalf of any candidate; or
(vi) pays the whole or part of any money or other valuable consideration to any person for the purpose of procuring the vote of any person at an election.
`
  },

  // ============================================================
  // IEBC ACT 2011
  // ============================================================

  {
    id: "iebc-act-functions",
    source: "IEBC Act No. 9 of 2011",
    section: "Section 4",
    title: "Functions of the Commission",
    keywords: [
      "IEBC functions",
      "what does IEBC do",
      "election commission duties",
      "voter education",
      "delimitation",
      "election disputes",
      "register voters"
    ],
    content: `
The functions of the Commission are to—

(a) conduct or supervise referenda and elections to any elective body or office established by this Constitution, including the nomination of candidates as provided by this Constitution and legislation;

(b) ensure that the electoral system complies with the principles in Article 81 of the Constitution and legislation;

(c) ensure continuous registration of citizens as voters;

(d) revise the register of voters;

(e) delimit constituencies and wards;

(f) regulate the process by which political parties nominate candidates for elections;

(g) settle electoral disputes, including disputes relating to or arising from nominations but excluding election petitions and disputes subsequent to the declaration of election results;

(h) register candidates for election;

(i) conduct voter education;

(j) facilitate the observation, monitoring and evaluation of elections;

(k) regulate the amount of money that may be spent by or on behalf of a candidate or party in respect of any election;

(l) develop and enforce a code of conduct for candidates and parties contesting elections;

(m) monitor compliance with the legislation required by Article 82(1)(b) of the Constitution relating to nomination of candidates by parties; and

(n) perform any other function prescribed by national legislation.
`
  },

  {
    id: "iebc-act-voter-education",
    source: "IEBC Act No. 9 of 2011",
    section: "Section 4(i) & Elections Act Regulations",
    title: "Voter education mandate",
    keywords: [
      "voter education",
      "civic education",
      "learn about voting",
      "election information",
      "IEBC education",
      "accredited voter education"
    ],
    content: `
The Commission is mandated to conduct voter education.

In execution of this mandate, the Commission shall:

(a) establish mechanisms for the provision of continuous voter education;

(b) cause to be prepared voter education curriculum as spelt out in Section 40 of the Elections Act, 2011;

(c) accredit non-state agencies and organisations to provide voter education, provided they meet the following criteria:
   - possess valid registration certificates;
   - have an operational bank account;
   - have civic education as an objective in their instrument of registration;
   - have a presence in at least one constituency in Kenya;
   - possess at least three years demonstrable experience in voter or civic education;
   - demonstrate necessary institutional and resource capacity;
   - meet integrity and accountability standards; and
   - meet tax compliance requirements.

(d) monitor and assess voter education exercises carried out by accredited organisations.
`
  },

  // ============================================================
  // POLITICAL PARTIES ACT 2011
  // ============================================================

  {
    id: "political-parties-registration",
    source: "Political Parties Act 2011",
    section: "Section 7",
    title: "Registration of political parties",
    keywords: [
      "register political party",
      "form party",
      "new party",
      "party requirements",
      "party membership",
      "party constitution"
    ],
    content: `
(1) A political party may be registered if it complies with the requirements of Article 91 of the Constitution and this Act.

(2) An application for registration of a political party shall be made to the Registrar in the prescribed form and shall be accompanied by—

(a) a copy of the constitution of the political party;
(b) a statement of the ideology of the political party;
(c) a proposed code of conduct for the members and officials of the political party;
(d) a copy of the policies and plans of the political party;
(e) the location and address of the head office and of every branch office of the political party;
(f) the names, addresses and identification particulars of the officials of the political party;
(g) the membership list of the political party containing not fewer than one thousand registered voters in at least twenty-four counties, which membership shall reflect regional and ethnic diversity, gender balance and representation of special interest groups including persons with disabilities, youth, ethnic minorities and marginalised communities;
(h) the particulars of any contribution, donation or pledge of a contribution or donation, whether in cash or in kind, made by the founding members of the political party; and
(i) estimates of the expenditure of the political party in accordance with the laws relating to public finance management.

(3) A political party shall not be registered under a name which, in the opinion of the Registrar—

(a) is obscene or offensive;
(b) is the name of another registered political party;
(c) is identical to the name of another registered political party or so nearly resembles that name as to be likely to deceive the members of the public;
(d) contains the words "Chama cha", "Party of" or "Union of" or any other words which, in the opinion of the Registrar, suggest that the political party is a branch of another political party; or
(e) contains any symbol, colour or emblem which is the same as that of another registered political party or so nearly resembles that symbol, colour or emblem as to be likely to deceive the members of the public.
`
  },

  {
    id: "political-parties-members-rights",
    source: "Political Parties Act 2011",
    section: "Section 14-17",
    title: "Rights and obligations of party members",
    keywords: [
      "party member rights",
      "leave party",
      "party membership",
      "member obligations",
      "dual membership",
      "party records"
    ],
    content: `
Rights of members:
(a) Every member of a political party has the right to participate in the affairs of the political party.
(b) A member has the right to access information concerning the political party.
(c) A member has the right to vote in party elections and be voted for.
(d) A member has the right to resign from a political party at any time.

Obligations of members:
(a) A person shall not be a member of more than one political party at the same time.
(b) It is an offence to register a person as a member of a political party without their consent.
(c) A political party must at all times keep an updated and accurate membership list available at the party head office and all county offices.

Party records:
A political party shall maintain in each of its county offices:
- a register of its members in the prescribed form;
- a copy of the constitution of the political party;
- a copy of the policies and plans of the political party;
- particulars of any contributions or donations;
- estimates of expenditure; and
- particulars of any property belonging to the political party.
`
  },

  {
    id: "political-parties-coalition",
    source: "Political Parties Act 2011",
    section: "Section 10",
    title: "Coalition agreements",
    keywords: [
      "coalition",
      "party coalition",
      "political alliance",
      "coalition agreement",
      "pre-election pact",
      "partnership"
    ],
    content: `
(1) Two or more political parties may form a coalition before or after an election.

(2) A coalition agreement shall be in writing and shall be deposited with the Registrar within twenty-one days of its execution.

(3) A coalition agreement shall specify—

(a) the name of the coalition;
(b) the period for which the coalition is formed;
(c) the objectives of the coalition;
(d) the basis of participation in the coalition;
(e) the leadership structure of the coalition;
(f) the policy and programme of the coalition;
(g) the procedure for nomination of candidates;
(h) the procedure for sharing of electoral seats and positions in the coalition;
(i) the procedure for amending the coalition agreement;
(j) the procedure for dispute resolution within the coalition;
(k) the procedure for the dissolution of the coalition; and
(l) any other matter that the political parties forming the coalition may consider necessary.

(4) A coalition agreement may be amended or terminated in accordance with the procedure set out in the agreement.
`
  }
];
