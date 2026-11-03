"""Map roster law school names to the school's email domain. First matching rule wins."""
import re

RULES = [
    (r"new york univ|\bnyu\b", "nyu.edu"), (r"columbia", "columbia.edu"), (r"fordham", "fordham.edu"),
    (r"brooklyn law", "brooklaw.edu"), (r"georgetown", "georgetown.edu"), (r"harvard", "harvard.edu"),
    (r"cardozo|yeshiva", "yu.edu"), (r"new york law", "nyls.edu"), (r"hastings|college of the law, san francisco", "uchastings.edu"),
    (r"ucla|california los angeles", "ucla.edu"), (r"loyola law school|loyola.*los angeles|loyola marymount", "lls.edu"),
    (r"loyola univ.*chicago|loyola university chicago", "luc.edu"), (r"berkeley", "berkeley.edu"),
    (r"st\.? john'?s", "stjohns.edu"), (r"hofstra", "hofstra.edu"), (r"southwestern", "swlaw.edu"),
    (r"\busc\b|southern california", "usc.edu"), (r"cornell", "cornell.edu"), (r"albany law", "albanylaw.edu"),
    (r"san diego", "sandiego.edu"), (r"\bpace\b", "pace.edu"), (r"pennsylvania|univ of penn", "upenn.edu"),
    (r"santa clara", "scu.edu"), (r"california western", "cwsl.edu"), (r"george washington", "gwu.edu"),
    (r"davis", "ucdavis.edu"), (r"city university of new york|\bcuny\b", "cuny.edu"), (r"buffalo", "buffalo.edu"),
    (r"duke", "duke.edu"), (r"pepperdine", "pepperdine.edu"), (r"yale", "yale.edu"), (r"michigan state", "msu.edu"),
    (r"michigan", "umich.edu"), (r"irvine", "uci.edu"), (r"mcgeorge|pacific\b", "pacific.edu"), (r"seton hall", "shu.edu"),
    (r"touro", "touro.edu"), (r"virginia school|univ of virginia|university of virginia", "virginia.edu"),
    (r"syracuse", "syr.edu"), (r"northwestern california", ""), (r"lewis & clark", "lclark.edu"), (r"northwestern", "northwestern.edu"),
    (r"chapman", "chapman.edu"), (r"san francisco", "usfca.edu"), (r"las vegas|unlv", "unlv.edu"),
    (r"boston univ", "bu.edu"), (r"chicago-kent|chicago kent", "kentlaw.iit.edu"), (r"univ.* of chicago|university of chicago", "uchicago.edu"),
    (r"boston coll", "bc.edu"), (r"stanford", "stanford.edu"), (r"rutgers", "rutgers.edu"), (r"golden gate", "ggu.edu"),
    (r"washington univ.*st\.? louis|washington university st|^washington univ sol", "wustl.edu"), (r"western state", "wsulaw.edu"),
    (r"american u", "american.edu"), (r"emory", "emory.edu"), (r"vanderbilt", "vanderbilt.edu"), (r"univ.* of miami", "miami.edu"),
    (r"tulane", "tulane.edu"), (r"capital univ", "capital.edu"), (r"thomas jefferson", "tjsl.edu"), (r"univ.* of texas", "utexas.edu"),
    (r"villanova", "villanova.edu"), (r"la ?verne", "laverne.edu"), (r"ohio state", "osu.edu"), (r"northeastern", "northeastern.edu"),
    (r"north dakota", "und.edu"), (r"connecticut", "uconn.edu"), (r"akron", "uakron.edu"), (r"howard", "howard.edu"),
    (r"case western", "case.edu"), (r"suffolk", "suffolk.edu"), (r"west los angeles", "uwla.edu"), (r"notre dame", "nd.edu"),
    (r"cleveland state", "csuohio.edu"), (r"temple", "temple.edu"), (r"william & mary|william and mary", "wm.edu"),
    (r"cincinnati", "uc.edu"), (r"arizona state", "asu.edu"), (r"new england law|new england sol", "nesl.edu"),
    (r"northern kentucky", "nku.edu"), (r"penn\.? state", "psu.edu"), (r"vermont law", "vermontlaw.edu"),
    (r"washington and lee", "wlu.edu"), (r"minnesota", "umn.edu"), (r"dayton", "udayton.edu"), (r"toronto", "utoronto.ca"),
    (r"roger williams", "rwu.edu"), (r"univ.* of florida", "ufl.edu"), (r"toledo", "utoledo.edu"), (r"chapel hill", "unc.edu"),
    (r"quinnipiac", "quinnipiac.edu"), (r"univ.* of maryland", "umaryland.edu"), (r"widener", "widener.edu"),
    (r"illinois", "illinois.edu"), (r"pittsburgh", "pitt.edu"), (r"wake forest", "wfu.edu"), (r"mitchell hamline", "mitchellhamline.edu"),
    (r"univ.* of washington", "uw.edu"), (r"oregon", "uoregon.edu"), (r"indiana univ", "iu.edu"), (r"george mason", "gmu.edu"),
    (r"william s\.? richardson|hawai", "hawaii.edu"), (r"drexel", "drexel.edu"), (r"univ.* of arizona", "arizona.edu"),
    (r"western new england", "wne.edu"), (r"wisconsin", "wisc.edu"), (r"gonzaga", "gonzaga.edu"), (r"univ.* of iowa", "uiowa.edu"),
    (r"new hampshire", "unh.edu"), (r"\bsmu\b|southern methodist", "smu.edu"), (r"univ.* of georgia", "uga.edu"),
    (r"seattle univ", "seattleu.edu"), (r"brigham young", "byu.edu"), (r"florida international", "fiu.edu"),
    (r"houston", "uh.edu"), (r"nova southeastern", "nova.edu"), (r"st\.? louis univ", "slu.edu"), (r"osgoode", "yorku.ca"),
    (r"ohio northern", "onu.edu"), (r"south texas", "stcl.edu"), (r"charleston", "charlestonlaw.edu"), (r"detroit mercy", "udmercy.edu"),
    (r"catholic univ", "cua.edu"), (r"richmond", "richmond.edu"), (r"stetson", "stetson.edu"), (r"mcgill", "mcgill.ca"),
    (r"denver", "du.edu"), (r"colorado", "colorado.edu"), (r"louisiana state", "lsu.edu"), (r"duquesne", "duq.edu"),
    (r"florida a ?& ?m", "famu.edu"), (r"north carolina central", "nccu.edu"), (r"florida state", "fsu.edu"),
    (r"massachusetts", "umassd.edu"), (r"west virginia", "wvu.edu"), (r"south carolina", "sc.edu"), (r"barry univ", "barry.edu"),
    (r"baylor", "baylor.edu"), (r"depaul", "depaul.edu"), (r"baltimore", "ubalt.edu"), (r"alabama", "ua.edu"),
    (r"texas southern", "tsu.edu"), (r"utah", "utah.edu"), (r"kansas", "ku.edu"), (r"creighton", "creighton.edu"),
    (r"nebraska", "unl.edu"), (r"marquette", "marquette.edu"), (r"st\.? thomas", "stthomas.edu"), (r"hamline", "hamline.edu"),
    (r"idaho", "uidaho.edu"), (r"wyoming", "uwyo.edu"), (r"kentucky", "uky.edu"), (r"tennessee", "utk.edu"),
    (r"campbell", "campbell.edu"), (r"elon", "elon.edu"), (r"cooley", "cooley.edu"), (r"mercer", "mercer.edu"),
    (r"regent univ", "regent.edu"), (r"liberty univ", "liberty.edu"), (r"washburn", "washburn.edu"), (r"drake", "drake.edu"),
    (r"missouri", "missouri.edu"), (r"oklahoma", "ou.edu"), (r"arkansas", "uark.edu"), (r"new mexico", "unm.edu"),
    (r"montana", "umt.edu"), (r"maine", "maine.edu"), (r"delaware", "widener.edu"),
]
COMPILED = [(re.compile(p, re.I), d) for p, d in RULES]

def law_school_domain(name: str) -> str:
    name = (name or "").strip()
    if not name or re.search(r"not listed|foreign|see registration|law office|judge", name, re.I):
        return ""
    for rx, domain in COMPILED:
        if rx.search(name):
            return domain
    return ""
