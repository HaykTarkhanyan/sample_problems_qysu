"""Taylor's formula (Musoyan, part 1, 4.6, formulas (6.2)-(6.4), theorem 6.1, Lagrange's remainder, the basic
expansions of 4.6.5).

1) Why the coefficients are f^(k)(x0)/k! (for a polynomial they are P^(k)(0)/k!, formula (6.2)).
2) sin x and its Taylor polynomials P_1, P_3, ..., P_11 at 0: the strip where |sin x - P_n(x)| < 0.1 widens.
3) Peano's remainder r_n(x) = o((x - x0)^n), theorem 6.1 (via lemma 6.1).
4) Lagrange's remainder used to compute e: e = sum 1/k! + e^c/(n+1)!, 0 < c < 1, so the error is < 3/(n+1)!;
   every number in the table is computed here.
5) ln(1 + x): the polynomials stop helping for x > 1, more terms make it worse there.
Silent long-form video for the mathematical analysis course (scenes/_analysis.py).

Check (from animations/, ~3 min at -ql):
    uv run python tools/render_check.py scenes/taylor_formula.py TaylorFormula
Final (720p30):
    uv run python tools/render_check.py scenes/taylor_formula.py TaylorFormula --quality m
"""
import math

import numpy as np
from manim import (
    DOWN, LEFT, RIGHT, UP, Axes, Create, DashedLine, Dot, FadeIn, FadeOut, FadeTransform, Line, Rectangle,
    Transform, VGroup,
)

from _analysis import (
    BLUE, INK, MUTED, ORANGE, RED, AnalysisScene, card, reading_time, tex, title,
)

SOURCE = "Վ. Մուսոյան, Մաթեմատիկական անալիզ, մաս 1, կետ 4.6"
SIN_DEGREES = (1, 3, 5, 7, 9, 11)
TOL = 0.1


def sin_taylor(x, n):
    """Taylor polynomial of sin at 0 of degree n (odd)."""
    x = np.asarray(x, dtype=float)
    out = np.zeros_like(x)
    for k in range(1, n + 1, 2):
        out += (-1) ** ((k - 1) // 2) * x ** k / math.factorial(k)
    return out


def good_radius(n, step=1e-3):
    """Largest grid R with |sin x - P_n(x)| < TOL on [-R, R] (both odd): the last accepted point, not the first
    one that fails."""
    x = 0.0
    while abs(math.sin(x + step) - float(sin_taylor(x + step, n))) < TOL and x < 7:
        x += step
    return x


def window_range(poly, lo, hi, ymax, step=1e-3):
    """The largest interval around 0, inside [lo, hi], on which |poly| <= ymax. The polynomial is drawn only there
    (clipping would draw flat pieces that are not part of it)."""
    right = 0.0
    while right + step <= hi and abs(float(poly(right + step))) <= ymax:
        right += step
    left = 0.0
    while left - step >= lo and abs(float(poly(left - step))) <= ymax:
        left -= step
    return left, right


def sin_poly_tex(n):
    terms = ["x"]
    for k in range(3, n + 1, 2):
        sign = "-" if ((k - 1) // 2) % 2 else "+"
        terms.append(rf"{sign}\frac{{x^{{{k}}}}}{{{k}!}}")
    if len(terms) > 4:
        terms = terms[:2] + [r"+\dots"] + terms[-1:]
    return rf"P_{{{n}}}(x)=" + "".join(terms)


def log_taylor(x, n):
    x = np.asarray(x, dtype=float)
    return sum((-1) ** (k - 1) * x ** k / k for k in range(1, n + 1))


E_ROWS = [(n, sum(1 / math.factorial(k) for k in range(n + 1))) for n in range(1, 7)]


def fmt(v, digits):
    return f"{v:.{digits}f}".replace(".", "{,}")


class TaylorFormula(AnalysisScene):
    def construct(self):
        head = title("Թեյլորի բանաձևը")
        self.intro(head, card("Թեյլորի բանաձև (6.4)",
                              ("$f(x)=f(x_0)+\\dfrac{f'(x_0)}{1!}(x-x_0)+\\dots+\\dfrac{f^{(n)}(x_0)}{n!}(x-x_0)^n+r_n(x)$"),
                              ("Աջ մասի բազմանդամը", "$P_n(x)$", "-ն է՝ Թեյլորի բազմանդամը,", "$r_n(x)$", "-ը՝ մնացորդային անդամը։"),
                              source=SOURCE))
        self.say(("Ինչո՞ւ այս գործակիցները։", "$P(x)=a_0+a_1x+\\dots+a_nx^n$", "բազմանդամի համար"),
                 ("$P^{(k)}(0)=a_k\\cdot k!$", "(6.2)։", "$P_n$", "-ն ընտրված է այնպես, որ", "$x_0$", "-ում",
                  "$P_n^{(k)}(x_0)=f^{(k)}(x_0)$", ",", "$k\\le n$", "։"))

        # ---- sin x and its Taylor polynomials
        self.unsay()
        ax = Axes(x_range=[-7, 7, 2], y_range=[-2.3, 2.3, 1], x_length=10.0, y_length=3.9, tips=False,
                  axis_config={"color": MUTED, "include_ticks": False})
        ax.next_to(head, DOWN, buff=0.95).set_x(-0.9)
        g = ax.plot(np.sin, x_range=[-7, 7], color=BLUE, stroke_width=4)
        f_lab = tex(r"\sin x", 32, BLUE).next_to(ax.c2p(7, math.sin(7)), RIGHT, buff=0.12)
        self.play(Create(ax), Create(g), FadeIn(f_lab), run_time=1.5)

        def poly_graph(n):
            lo, hi = window_range(lambda x: sin_taylor(x, n), -7, 7, 2.3)
            return ax.plot(lambda x: float(sin_taylor(x, n)), x_range=[lo, hi, 0.01], color=ORANGE, stroke_width=3,
                           use_smoothing=False)

        def strip(n):
            r = good_radius(n)
            return Rectangle(width=ax.c2p(r, 0)[0] - ax.c2p(-r, 0)[0], height=ax.c2p(0, 2.3)[1] - ax.c2p(0, -2.3)[1],
                             stroke_width=0, fill_color=ORANGE, fill_opacity=0.10).move_to(ax.c2p(0, 0))

        n0 = SIN_DEGREES[0]
        pg, st = poly_graph(n0), strip(n0)
        ptex = tex(sin_poly_tex(n0), 32, ORANGE).next_to(head, DOWN, buff=0.15)
        self.play(FadeIn(st), Create(pg), FadeIn(ptex), run_time=1.2)
        self.say(("$x_0=0$", "։", "$\\sin x$", "-ի ածանցյալները 0-ում՝", "$0,1,0,-1,0,1,\\dots$", "։ Թույլ գունավորված է այն մասը,"),
                 ("որտեղ", "$|\\sin x-P_n(x)|<0{,}1$", "։"))
        for n in SIN_DEGREES[1:]:
            new_pg, new_st = poly_graph(n), strip(n)
            new_tex = tex(sin_poly_tex(n), 32, ORANGE).move_to(ptex)
            self.play(Transform(pg, new_pg), Transform(st, new_st), FadeTransform(ptex, new_tex, stretch=False),
                      run_time=1.4)
            ptex = new_tex
            self.wait(max(2.0, reading_time(new_tex)))
        self.say(("Աստիճանը մեծացնելիս բազմանդամը", "$\\sin x$", "-ին մոտ է ավելի ու ավելի լայն միջակայքում,"),
                 ("բայց", "$x_0$", "-ից հեռու այն միշտ հեռանում է։"))

        # ---- Peano's remainder, with the book's proof (lemma 6.1); the plot goes so the 3-row captions do not
        # sit on the curves
        self.fade_all(keep=[head])
        self.cap = None
        self.say(("Թեորեմ 6.1 (Պեանո)։ Եթե", "$x_0$", "-ում կան մինչև", "$n$", "-րդ կարգի ածանցյալներ, ապա"),
                 ("$r_n(x)=o\\big((x-x_0)^n\\big)$", ", այսինքն՝", "$\\dfrac{r_n(x)}{(x-x_0)^n}\\to0$", ", երբ",
                  "$x\\to x_0$", "։"))
        self.say(("Լեմմա 6.1։ Եթե", "$r(x_0)=r'(x_0)=\\dots=r^{(n)}(x_0)=0$", ", ապա", "$r(x)=o\\big((x-x_0)^n\\big)$", "։"),
                 ("$r_n=f-P_n$", "-ը բավարարում է այս պայմաններին, քանի որ", "$P_n^{(k)}(x_0)=f^{(k)}(x_0)$", "։"))
        self.say(("Ինդուկցիա։", "$n=1$", "՝", "$\\dfrac{r(x)}{x-x_0}=\\dfrac{r(x)-r(x_0)}{x-x_0}\\to r'(x_0)=0$", "։"),
                 ("Քայլ՝ Լագրանժով", "$\\dfrac{r(x)}{(x-x_0)^{n+1}}=\\dfrac{r'(c)}{(c-x_0)^{n}}\\cdot\\left(\\dfrac{c-x_0}{x-x_0}\\right)^{n}$",
                  ", առաջին արտադրիչը", "$\\to0$", ","),
                 ("երկրորդը", "$(0,1)$", "-ում է, քանի որ", "$c$", "-ն", "$x_0$", "-ի և", "$x$", "-ի միջև է։"), extra=0.5)

        # ---- the hypotheses matter: |x| and x|x| at 0
        self.fade_all(keep=[head])
        self.cap = None
        pans = []
        for cx in (-3.4, 3.4):
            a_ = Axes(x_range=[-1.1, 1.1, 1], y_range=[-1.1, 1.1, 1], x_length=4.4, y_length=3.2, tips=False,
                      axis_config={"color": MUTED, "include_ticks": False})
            a_.next_to(head, DOWN, buff=0.7).set_x(cx)
            pans.append(a_)
        p1, p2 = pans
        abs_g = p1.plot(lambda t: abs(t), x_range=[-1, 1], color=RED, stroke_width=4, use_smoothing=False)
        xabs_g = p2.plot(lambda t: t * abs(t), x_range=[-1, 1], color=BLUE, stroke_width=4)
        tl = VGroup(tex(r"f(x)=|x|", 30, RED).next_to(p1, DOWN, buff=0.2),
                    tex(r"f(x)=x|x|", 30, BLUE).next_to(p2, DOWN, buff=0.2))
        self.play(Create(p1), Create(p2), Create(abs_g), Create(xabs_g), FadeIn(tl), run_time=1.5)
        self.say(("$|x|$", "-ի համար", "$f'(0)$", "չկա, և", "$|x|=a+bx+o(x)$", "տեսքի ներկայացում չկա՝", "$\\frac{|x|}{x}$",
                  "-ը 0-ում սահման չունի։"),
                 ("$x|x|$", "-ի համար", "$f'(0)=0$", ",", "$x|x|=o(x)$", "՝ առաջին կարգի բանաձևը կա, բայց", "$f''(0)$",
                  "չկա, ուստի", "$n=2$", "-ով՝ ոչ։"), extra=0.5)
        self.say(("Պեանոյի տեսքի համար պետք է", "$f^{(n)}(x_0)$", "-ն, Լագրանժի տեսքի համար՝", "$f^{(n+1)}$",
                  "-ն ամբողջ շրջակայքում։"))

        # ---- Lagrange's remainder and the number e
        self.fade_all(keep=[head])
        self.cap = None
        lag = card("Մնացորդային անդամը Լագրանժի տեսքով",
                   ("Եթե", "$x_0$", "-ի շրջակայքում կա", "$f^{(n+1)}$", ", ապա"),
                   ("$r_n(x)=\\dfrac{f^{(n+1)}(c)}{(n+1)!}(x-x_0)^{n+1}$", ",", "$c$", "-ն", "$x_0$", "-ի և", "$x$",
                    "-ի միջև է։"))
        lag.next_to(head, DOWN, buff=0.9)
        self.show_card(lag)
        self.play(lag.animate.scale(0.75).next_to(head, DOWN, buff=0.3), run_time=0.8)
        self.say(("Ապացույց (գիրք)։", "$\\varphi(z)=f(x)-\\sum\\limits_{k=0}^{n}\\dfrac{f^{(k)}(z)}{k!}(x-z)^k$", ",",
                  "$\\varphi'(z)=-\\dfrac{f^{(n+1)}(z)}{n!}(x-z)^n$", ","),
                 ("$\\varphi(x_0)=r_n(x)$", ",", "$\\varphi(x)=0$", "։ Կոշիի բանաձևը", "$\\varphi$", "-ի և",
                  "$\\psi(z)=(x-z)^{n+1}$", "-ի համար տալիս է Լագրանժի տեսքը։"))
        self.say(("Օրինակ՝", "$e^x$", ",", "$x_0=0$", ",", "$x=1$", "։", "$e=1+1+\\frac1{2!}+\\dots+\\frac1{n!}+r_n$", ","),
                 ("$r_n=\\dfrac{e^c}{(n+1)!}<\\dfrac{3}{(n+1)!}$", ", քանի որ", "$0<c<1$", "և", "$e<3$", "։"))
        head_row = VGroup(tex("n", 30, MUTED), tex(r"P_n(1)", 30, MUTED), tex(r"e-P_n(1)", 30, MUTED),
                          tex(r"\frac{3}{(n+1)!}", 30, MUTED))
        rows = [head_row]
        for n, s in E_ROWS:
            rows.append(VGroup(tex(str(n), 30, INK), tex(fmt(s, 6), 30, ORANGE), tex(fmt(math.e - s, 6), 30, RED),
                               tex(fmt(3 / math.factorial(n + 1), 6), 30, INK)))
        col_x = [-3.6, -1.4, 1.2, 3.8]
        top_y = 0.95
        table = VGroup()
        for i, r in enumerate(rows):
            for j, cell in enumerate(r):
                cell.move_to([col_x[j], top_y - 0.5 * i, 0])
            table.add(r)
        rule = Line([-4.6, top_y - 0.27, 0], [4.8, top_y - 0.27, 0], color=MUTED, stroke_width=1.5)
        self.play(FadeOut(lag), FadeIn(head_row), Create(rule), run_time=0.6)   # the card would overlap the header
        for r in rows[1:]:
            self.play(FadeIn(r), run_time=0.5)
        self.say(("Սխալը միշտ փոքր է գնահատականից։", "$n=6$", "-ի դեպքում արդեն", "$e\\approx2{,}718$", "՝"),
                 ("երեք ճիշտ նիշով։ Լագրանժի տեսքը թույլ է տալիս գնահատել սխալը։"), extra=0.5)

        # ---- ln(1 + x): far from x0 more terms can make it worse
        self.fade_all(keep=[head])
        self.cap = None
        ax2 = Axes(x_range=[-1, 2.6, 1], y_range=[-2.2, 2.2, 1], x_length=9.0, y_length=4.3, tips=False,
                   axis_config={"color": MUTED, "include_ticks": False})
        ax2.next_to(head, DOWN, buff=0.45).set_x(-1.2)
        gl = ax2.plot(lambda x: math.log(1 + x), x_range=[-0.88, 2.6], color=BLUE, stroke_width=4)
        one = VGroup(DashedLine(ax2.c2p(1, -2.2), ax2.c2p(1, 2.2), color=MUTED, stroke_width=1.5, dash_length=0.08),
                     tex("1", 28, MUTED).next_to(ax2.c2p(1, 0), DOWN + RIGHT, buff=0.08))
        l_lab = tex(r"\ln(1+x)", 32, BLUE).move_to([4.7, 1.5, 0])
        self.play(Create(ax2), Create(gl), FadeIn(one), FadeIn(l_lab), run_time=1.5)

        def lpoly(n):
            lo, hi = window_range(lambda x: log_taylor(x, n), -0.88, 2.6, 2.2)
            return ax2.plot(lambda x: float(log_taylor(x, n)), x_range=[lo, hi, 0.005], color=ORANGE, stroke_width=3,
                            use_smoothing=False)

        self.say(("$\\ln(1+x)=x-\\frac{x^2}{2}+\\dots+(-1)^{n-1}\\frac{x^n}{n}+r_n(x)$", "։ Նարնջագույնը՝ Թեյլորի",
                  "բազմանդամը,"),
                 ("այնքան, որքան տեղավորվում է նկարում։"))
        lp = lpoly(1)
        n_tex = tex("n=1", 32, ORANGE).move_to([4.7, 0.5, 0])
        self.play(Create(lp), FadeIn(n_tex), run_time=1.0)
        self.wait(1.5)
        for n in (2, 3, 5, 8, 12):
            new_tex = tex(f"n={n}", 32, ORANGE).move_to(n_tex)
            self.play(Transform(lp, lpoly(n)), FadeTransform(n_tex, new_tex, stretch=False), run_time=1.1)
            n_tex = new_tex
            self.wait(1.6)
        self.say(("$-1<x\\le1$", "-ում բազմանդամները մոտենում են", "$\\ln(1+x)$", "-ին։", "$x>1$", "դեպքում",
                  "$\\frac{x^n}{n}\\not\\to0$", ", ուստի Թեյլորի շարքը"),
                 ("տարամետ է՝ առաջին մի քանի բազմանդամը դեռ կարող է մոտենալ, բայց մի", "$n$", "-ից սկսած դրանք հեռանում են։"))
        self.say(("Թեյլորի բանաձևը ճիշտ է ամեն", "$n$", "-ի համար, բայց", "$r_n(x)$", "-ը կարող է մեծ լինել։"),
                 ("Երբ է", "$r_n(x)\\to0$", "-ն,", "$n\\to\\infty$", "դեպքում՝ Թեյլորի շարքերի հարցն է (9.5)։"),
                 extra=0.5)

        self.outro(head, card("Թեյլորի բանաձև",
                              ("$f(x)=\\sum\\limits_{k=0}^{n}\\dfrac{f^{(k)}(x_0)}{k!}(x-x_0)^k+r_n(x)$"),
                              ("Պեանո՝", "$r_n(x)=o\\big((x-x_0)^n\\big)$", ",", "$x\\to x_0$", "։"),
                              ("Լագրանժ՝", "$r_n(x)=\\dfrac{f^{(n+1)}(c)}{(n+1)!}(x-x_0)^{n+1}$", "։")))
