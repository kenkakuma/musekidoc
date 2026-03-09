#!/usr/bin/env python3
"""
Update Chinese bios for 17 artists in PostgreSQL via psql subprocess calls.
"""

import os
import subprocess
import sys

DB_URL = os.environ["DATABASE_URL"]

ARTISTS = [
    {
        "nameEn": "Chika Sakaguchi",
        "bio": "坂口知香以 CYILABO 为名进行创作，是日本陶艺家兼插画师，公众知名度在独立陶艺家中属于佼佼者。据其官方档案，她毕业于京都市立艺术大学陶艺专业，毕业后成立 Atelier CYILABO，自 2000 年代初起持续从事陶瓷器皿、立体插画、玻璃绘画及相关物件的创作。其创作媒介较纯粹的日用陶艺更为宽泛，但始终根植于日本陶艺传统，也为发掘数据库带来了更多女性艺术家的代表。",
    },
    {
        "nameEn": "Daisuke Anayama",
        "bio": "穴山大辅，1981 年生，现居爱知县濑户市，日本陶艺家。据公开资料，他担任 SUIYO 总监，以黑色陶器和手捏达摩造型见长，作品通过陶艺平台和画廊流通，被视为对日本传统陶艺语言的当代演绎，将风景、石头与记忆的意象融入创作之中。",
    },
    {
        "nameEn": "En Iwamura",
        "bio": "岩村远，1988 年生于京都，现居信乐，日本当代陶艺雕塑家。多家美术馆与画廊的资料一致将其创作定位于当代雕塑与陶艺话语之间，频繁援引日本「间」的概念、绳文线条，以及玩趣的面具状或仿生造型。他通过美术馆、画廊与驻留项目获得了广泛的国际曝光，同时深深扎根于日本陶土文化。",
    },
    {
        "nameEn": "Haruya Abe",
        "bio": "阿部春弥，1982 年生于长野县真田，日本陶艺家，凭借制作过程的视频记录在 Instagram 上拥有异于同辈的高度可见性。据其官方档案及媒体报道，他经历了系统的陶艺训练，师从备前陶艺家井手山本，并自 2004 年起在上田独立创作。其作品以精致的浮雕刻划、切削成型、清晰的轮廓线为特色，极具传播性的制作视频也是其社群关注度远超同辈的重要原因。",
    },
    {
        "nameEn": "Hitomi Hosono",
        "bio": "细野仁美是日本陶艺家，以密布植物浮雕纹饰的瓷器与炻器器皿广为人知。美术馆、画廊及官方资料一致描述其创作建立在对花卉、叶片与自然生长系统的细致观察之上，转化为高度劳动密集的雕刻与贴塑表面。她目前虽与伦敦深度关联，但其训练背景与创作主体仍是明确的日本作家，公众知名度使她成为值得纳入的重要发现对象。",
    },
    {
        "nameEn": "Kazuaki Shimura",
        "bio": "志村和晃，1980 年生，现居南房总市，先后在京都、石川和益子完成陶艺训练。其创作以温暖的日用器皿为核心，旨在提升日常生活的情感温度。工作室虽位于四个优先地区之外，但京都与益子的师承渊源加之庞大的社群关注度，使他成为发现数据库中务实而重要的补充。",
    },
    {
        "nameEn": "Kousuke Teramura",
        "bio": "寺村光辅，1978 年生于京都，现于益子工作，日本当代陶艺家。媒体、零售及档案资料一致描述其创作以实用器皿、沉静的自然色彩以及土胎与釉面之间的触感平衡为核心。他将京都的训练履历与益子成熟的创作基地相结合，有效填补了益子地区作家的代表性，Instagram 关注者数量亦超出门槛要求。",
    },
    {
        "nameEn": "Masahiko Yamamoto",
        "bio": "山本雅彦，1981 年生于奈良县高取町，现居曾尔村，日本陶艺家。近期展览及销售资料描述其创作以挖取、测试日本各地泥土为基础，将万物有灵论与民族志感性融入手捏器皿与雕塑造型之中。其履历呈现出清晰的奈良地方传承、正规陶艺训练，以及日益国际化的展览语境，超越了传统日用陶艺的范畴。",
    },
    {
        "nameEn": "Midori Uchida",
        "bio": "内田翠，1983 年生于神户，毕业于大阪艺术大学陶艺专业，并完成多治见市陶磁器意匠研究所课程后，在岐阜县建立工作室。画廊资料一致强调其炭化烧成、手捏无釉造型，以及通过窑变现象捕捉内在风景的创作理念。她在岐阜、东京、京都及艺博会等多处留有持续的展览记录，是与当代陶艺方向高度契合的女性陶艺家。",
    },
    {
        "nameEn": "Narumi Yashiro",
        "bio": "矢代成美是来自京都的日本陶艺家，目前的创作与哥本哈根工作室实践及国际画廊流通紧密相连。画廊与展览资料呈现了她在雕塑量感、微妙色域与触感器皿形态之间取得平衡的创作面貌，同时保持着明确的日本审美敏感——对表面与克制的高度关注。她虽因在海外定居而不利于地区配额，但当前的关注者规模与清晰的创作主体使她成为值得纳入的女性发现候选。",
    },
    {
        "nameEn": "Nozomu Shinohara",
        "bio": "篠原希，1972 年生于大阪，现居信乐，是一位专注于穴窑烧制的资深薪烧陶艺家。现有画廊与展览资料描述其创作以突破信乐黏土的既有边界为核心，借助火焰、草木灰与泥料熔融行为生成不规则造型、翡翠青（ビードロ）釉面与生动的焼締景象。他在信乐的长期深耕及传统工艺家的认定，使他成为地方窑文化与当代藏家需求之间的重要桥梁。",
    },
    {
        "nameEn": "Otani Tetsuya",
        "bio": "大谷哲也，1971 年生，现居信乐，是日用陶器领域最具代表性的作家之一。工作室、店铺与展览资料描述其创作以白色餐具、土锅等炊具及以信乐土为基础的朴素精炼器形为核心。此条目收录的依据是：作家自营账号 @otntty 的触达规模远高于此前录入数据库的工作室账号，且两者明确指向同一位陶艺家。",
    },
    {
        "nameEn": "Shintaro Abe",
        "bio": "阿部慎太朗，1979 年生，现居益子，是当代日本陶器与器皿领域最具辨识度的作家之一。店铺与展览资料一致强调他柔和的白色胎面、花瓣状或扇贝形轮廓、细腻的粉引质感，以及将日常实用性与古意美感融合的创作取向。他的加入切实提升了益子地区的代表性，Instagram 关注者数量亦轻松超过门槛要求。",
    },
    {
        "nameEn": "Suzuki Takashi",
        "bio": "铃木隆是现居小田原的日本陶艺家，也是工坊「橙」（Kōbō Daidai）的创始人。展览与商业资料一致强调其蜜柑灰釉、半透明的青瓷釉色，以及实用餐具造型。作品取材于当地柑橘类草木灰，频繁呈现于画廊式展览与专业陶艺零售渠道。",
    },
    {
        "nameEn": "Takahiro Koga",
        "bio": "古贺崇洋，1987 年生，是以钉状瓷器作品、甲胄造型酒器，以及「反侘寂 / NEO WABI-SABI」概念闻名的日本当代陶艺家。官方与机构资料将其置于茶文化、流行文化与当代工艺平台的对话之中，近期展览在日本国内外均保持持续可见度。",
    },
    {
        "nameEn": "Tetsuya Kobayashi",
        "bio": "小林徹也，1979 年生，现居爱知县濑户市，日本当代陶艺家，拥有活跃的 Instagram 曝光与画廊流通。据展览与商业资料，他在爱知完成陶艺训练后扎根濑户，以赤土铁质黏土、天然草木灰釉、粉引、锈釉及无釉焼締见长。他的加入有效强化了美浓-濑户地区的覆盖，关注者数量亦超出任务门槛。",
    },
    {
        "nameEn": "Yukico Yamada",
        "bio": "山田由起子是活跃于日本的陶艺家，与京都及丹波地区渊源深厚。其作品以粗犷的土感造型、手捏的不对称形态与对自然的静默观察为特色。画廊资料描述其创作汲取大阪农村根源与工作室周边风景的滋养，而国际展览与画廊代理则显示她在日本与欧洲均保持着活跃的流通。",
    },
]


def run_psql(sql: str) -> tuple[int, str, str]:
    """Execute a SQL statement via psql and return (returncode, stdout, stderr)."""
    result = subprocess.run(
        ["psql", DB_URL, "-c", sql],
        capture_output=True,
        text=True,
        timeout=30,
    )
    return result.returncode, result.stdout, result.stderr


def escape_sql_string(value: str) -> str:
    """Escape single quotes for SQL by doubling them."""
    return value.replace("'", "''")


def update_artist_bio(name_en: str, bio: str) -> bool:
    """Update a single artist's bio. Returns True on success."""
    safe_bio = escape_sql_string(bio)
    safe_name = escape_sql_string(name_en)
    sql = f"UPDATE \"Artist\" SET bio = '{safe_bio}' WHERE \"nameEn\" = '{safe_name}';"

    returncode, stdout, stderr = run_psql(sql)

    if returncode != 0:
        print(f"  [FAIL] {name_en}")
        print(f"         stderr: {stderr.strip()}")
        return False

    # psql prints "UPDATE N" where N is the number of rows affected
    stdout_stripped = stdout.strip()
    import re
    m = re.search(r"UPDATE (\d+)", stdout_stripped)
    if m:
        rows = int(m.group(1))
        if rows == 0:
            print(f"  [WARN] {name_en} -> no matching row found (UPDATE 0)")
            return False
        elif rows == 1:
            print(f"  [OK]   {name_en} -> bio updated (1 row)")
            return True
        else:
            print(f"  [OK]   {name_en} -> bio updated ({rows} rows — duplicate entries in DB)")
            return True
    else:
        print(f"  [?]    {name_en} -> unexpected response: {stdout_stripped!r}")
        return False


def verify_updates(name_en_list: list[str]) -> None:
    """Query nameZh and first 30 chars of bio for all artists."""
    names_sql = ", ".join(f"'{escape_sql_string(n)}'" for n in name_en_list)
    sql = (
        f'SELECT "nameZh", LEFT(bio, 30) AS bio_preview '
        f'FROM "Artist" WHERE "nameEn" IN ({names_sql}) '
        f'ORDER BY "nameEn";'
    )
    returncode, stdout, stderr = run_psql(sql)
    if returncode != 0:
        print(f"\nVerification query failed:\n{stderr.strip()}")
        return
    print("\n--- Verification: nameZh | bio (first 30 chars) ---")
    print(stdout)


def main() -> int:
    print(f"Starting bio update for {len(ARTISTS)} artists...\n")

    success_count = 0
    failed = []

    for artist in ARTISTS:
        ok = update_artist_bio(artist["nameEn"], artist["bio"])
        if ok:
            success_count += 1
        else:
            failed.append(artist["nameEn"])

    print(f"\nResult: {success_count}/{len(ARTISTS)} updated successfully.")
    if failed:
        print(f"Failed / no match: {failed}")

    verify_updates([a["nameEn"] for a in ARTISTS])

    return 0 if not failed else 1


if __name__ == "__main__":
    sys.exit(main())
