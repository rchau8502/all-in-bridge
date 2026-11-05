# Tutorial bidding and play audit — 2026-11-04

Scope: all 34 tutorial lessons, including 23 scripted auctions and 13 lessons
with play, plus the five standalone classroom demonstrations. The play audit
evaluates every one of the 500 authored cards, including automated opponents.
Nine of those lessons play complete hands; four demonstrate selected tricks.

## Corrections

| Lesson | Correction |
| --- | --- |
| Count and Plan | AK4 opposite QJ produces three club tricks with unblocking, not two. Recount the initial five winners, preserve entries and finish the complete hand. |
| Establish the Long Suit | Provide two real club stoppers; defense attacks clubs normally. Preserve the six diamonds and a return entry instead of relying on a helpful diamond switch. |
| Trump Power | Ruff the opposing diamond, then discard a loser on partner's winning club instead of wasting another trump. |
| Count Your Losers | Do not mechanically draw all trumps before using the heart entry. Establish the fourth diamond to discard the club loser. Eleven tricks, not ten. A losing budget is a maximum. |
| Make Losers Vanish | Replace the fragile deal with a complete line demonstrating both club-winner discards and a short-hand diamond ruff. Retain the separate explanation of a ruffing finesse. |
| Defense I | Correct the continuation and the choice of cards retained under partner's winners. |
| Defense II | Adjust two card placements so fourth-hand-low and a useful honor cover work against sensible declarer play; update the five defensive tricks. |
| Defense III | Dummy actually finesses the heart queen. Adjust the hand and defense so the defeat does not rely on wasting the ace. |
| Raise and Play | Preserve dummy's last trump for the third spade. The corrected result is 2H+1, 140, rather than 2H exactly, 110. |
| Go for Game | Use a legitimate interior-sequence lead from KJT6. Dummy covers the jack with the queen; hand retains its ace. |
| Reverses | Eight points opposite a 17+ reverse is constructive. Direct 3D support is GF here, not a weak non-forcing preference. Weak braking routes require an explicit agreement. |
| Fourth-Suit Forcing | Replace the duplicate 2/1 auction with an actual 1H–1S–2C–2D fourth-suit inquiry and three-card support response. |
| Controls and Keycards | Identify the jump to 3S explicitly as an agreed shortness splinter, distinct from cheapest control bidding; it does not deny the diamond control. |
| Classroom examples | Replace the supposed 26-HCP deal, which actually had 36, with a real 26-HCP nine-winner deal. Align the bilingual ruffing question and nine-card fit title; qualify the absolute finesse slogan. |

Every lesson retains its focus and bilingual review. The only detailed automatic
card analysis remains the opening card. All complete hands, scoring, rewind,
and eligible claims are replayed by the tests.

## Independent verification and its limits

`tools/audit_lesson_play.py` uses the external DDS 2.9.0 native solver, **not**
the app's approximate `shared/dds.ts`. It requests the exact achievable trick
count for every legal card at every authored position. Equivalent ranks are
expanded before comparison. The generated `shared/lesson-play-audit-data.ts`
binds those results to the exact hands, contracts and card sequence; tests fail
if any input changes without a fresh audit.

All 487 plays after the opening leads preserve the best double-dummy trick
count at their positions. Eleven opening leads also match that benchmark.
The two recorded exceptions are the natural side-suit lead in Trump Power
and the interior-sequence lead in Go for Game. Leads are selected without
seeing dummy or hidden hands; a different clairvoyant lead does not itself
make a normal opening lead a beginner error.

Double-dummy analysis is a check for lost tricks, not a replacement for
single-dummy judgment or percentage play. Bidding was reviewed for the agreed
system, point ranges, shape, forcing obligations and fit; a reasonable game
bid need not make on every possible layout. In particular, the course uses
2/1 GF with semi-forcing 1NT and its stated partnership treatments, rather
than silently substituting SAYC.

The claim check also accepts the simple ending where both partnership hands
contain only one established suit with sufficient top cards; the authored
tail must still win every remaining trick. This covers the two spade tricks
at the end of the long-suit lesson without treating a blocked mixed-suit
hand as claimable.

References: [ACBL two-over-one teacher lesson](https://cdn.acbl.org/assets/documents/teachers/Teacher-Manuals/More-Commonly-Used-Conventions-Lesson-8.pdf),
[ACBL: when to cover an honor](https://web2.acbl.org/documentLibrary/learn/CG_Lessons/When_to_Cover_an_Honor_with_an_Honor_2023-11-14.pdf),
[DDS source](https://github.com/dds-bridge/dds),
[author's DDS binaries](https://privat.bahnhof.se/wb758135/bridge/dll.html).

To refresh the independent audit, compile the shared TypeScript, export
`getLessons('en')` as JSON, set `DDS_LIBRARY_PATH` to the downloaded native
library, and run `python tools/audit_lesson_play.py lessons.json` from the
repository root. Normal tests and the deployed app do not load this library.
