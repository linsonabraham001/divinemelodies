"""Embed fonts into the logo SVG and render PNG variants with headless Chrome.

Usage: python design/build_logo.py  (edit design/logo-src.svg first)
"""
import base64
import pathlib
import subprocess
import tempfile

HERE = pathlib.Path(__file__).parent
REPO = HERE.parent
FONTS = HERE / "fonts"
TMP = pathlib.Path(tempfile.mkdtemp())
CHROME = r"C:\Program Files\Google\Chrome\Application\chrome.exe"


def font_face(family, path):
    data = base64.b64encode((FONTS / path).read_bytes()).decode()
    return (f"      @font-face {{ font-family: '{family}'; font-weight: 400 900; "
            f"src: url(data:font/woff2;base64,{data}) format('woff2'); }}")


src = (HERE / "logo-src.svg").read_text(encoding="utf-8")
fonts = "\n".join([font_face("Cinzel", "cinzel.woff2"),
                   font_face("Cinzel Decorative", "cinzeldec.woff2")])
svg = src.replace("/*FONTS*/", fonts)
out_svg = REPO / "images" / "dm-logo.svg"
out_svg.write_text(svg, encoding="utf-8")


def render(name, w, h, body_css, inner):
    html = TMP / f"render-{name}.html"
    html.write_text(f"""<!doctype html><html><head><style>
html,body{{margin:0;width:{w}px;height:{h}px;overflow:hidden;background:transparent}}
{body_css}</style></head><body>{inner}</body></html>""", encoding="utf-8")
    out = REPO / "images" / name
    subprocess.run([CHROME, "--headless=new", "--disable-gpu", "--hide-scrollbars",
                    "--default-background-color=00000000",
                    f"--window-size={w},{h}", f"--screenshot={out}",
                    html.as_uri()], check=True, capture_output=True)
    print("wrote", out)


logo_uri = out_svg.as_uri()
for size, name in [(1024, "dm-logo.png"), (512, "dm-logo-512.png"),
                   (180, "apple-touch-icon.png"), (64, "favicon-64.png")]:
    render(name, size, size, "img{width:100%;height:100%;display:block}",
           f'<img src="{logo_uri}">')

# Social share card
render("og-image.png", 1200, 630, """
body{background:radial-gradient(ellipse at 30% 20%,#2a2f7a 0%,#0b0f2e 60%,#05071a 100%);
display:flex;align-items:center;gap:56px;padding:0 80px;box-sizing:border-box;font-family:Georgia,serif}
@font-face{font-family:Cinzel;src:url(CINZEL_URI)}
img{width:420px;height:420px;filter:drop-shadow(0 20px 40px rgba(0,0,0,.5))}
h1{font-family:Cinzel,Georgia,serif;color:#f7efd9;font-size:72px;letter-spacing:6px;margin:0;line-height:1.05}
p{color:#e9c979;font-size:30px;margin:18px 0 0;font-style:italic}
small{display:block;color:#b9bfe6;font-size:22px;letter-spacing:8px;margin-top:28px;font-family:Cinzel,Georgia,serif}
""".replace("CINZEL_URI", (FONTS / "cinzel.woff2").as_uri()),
       f'<img src="{logo_uri}"><div><h1>DIVINE<br>MELODIES</h1>'
       '<p>Singing for the Glory of God</p><small>DALLAS · FORT WORTH</small></div>')
