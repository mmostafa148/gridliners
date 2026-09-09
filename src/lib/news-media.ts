/**
 * Media-centre cover imagery: what it is, where it came from, what replaces it.
 *
 * **Every frame here is CC0 or Public Domain**, sourced through the Wikimedia
 * Commons API and downloaded into `public/media/news/` - never hot-linked. Each
 * was re-cut to 1400x875 and re-encoded at q74. The source metadata below is
 * the record the code reads.
 *
 * **All of it is temporary.** These frames illustrate the subject a post is
 * about; none of them is a photograph of this programme, its jury or its
 * winners, and every one is replaced when the client supplies real editorial
 * photography.
 *
 * Generated from the sourcing run rather than hand-written. A TypeScript module
 * rather than a JSON import so the build, the tests and any Node probe all read
 * it the same way.
 */
export interface NewsCover {
  file: string;
  width: number;
  height: number;
  category: string;
  licence: string;
  source: string;
  creator: string;
  query: string;
  temporary: true;
}

export const NEWS_COVERS: NewsCover[] = [
  { file: "/media/news/judging-1.jpg", width: 1400, height: 875, category: "judging", licence: "Public domain", source: "https://commons.wikimedia.org/wiki/File%3ATrial%20by%20Jury%20-%20Chaos%20in%20the%20Courtroom.png", creator: "David Henry Friston", query: "jury panel discussion", temporary: true },
  { file: "/media/news/judging-2.jpg", width: 1400, height: 875, category: "judging", licence: "Public domain", source: "https://commons.wikimedia.org/wiki/File%3AHenri%20Gervex%20-%20A%20Session%20of%20the%20Painting%20Jury%20-%20Google%20Art%20Project.jpg", creator: "Henri Gervex", query: "jury panel discussion", temporary: true },
  { file: "/media/news/judging-3.jpg", width: 1400, height: 875, category: "judging", licence: "Public domain", source: "https://commons.wikimedia.org/wiki/File%3A2015%20Law%20Enforcement%20Explorers%20Conference%20panel%20of%20speakers.jpg", creator: "Shane T. McCoy", query: "conference panel speakers", temporary: true },
  { file: "/media/news/craft-1.jpg", width: 1400, height: 875, category: "craft", licence: "Public domain", source: "https://commons.wikimedia.org/wiki/File%3APrinting%20press.jpg", creator: "John Farey", query: "printing press", temporary: true },
  { file: "/media/news/judging-4.jpg", width: 1400, height: 875, category: "judging", licence: "Public domain", source: "https://commons.wikimedia.org/wiki/File%3AFederal%20grand%20jury%20handbook.pdf", creator: "not stated", query: "jury panel discussion", temporary: true },
  { file: "/media/news/craft-2.jpg", width: 1400, height: 875, category: "craft", licence: "Public domain", source: "https://commons.wikimedia.org/wiki/File%3AA%20Specimen%20by%20William%20Caslon.jpg", creator: "William Caslon", query: "typography specimen", temporary: true },
  { file: "/media/news/craft-3.jpg", width: 1400, height: 875, category: "craft", licence: "Public domain", source: "https://commons.wikimedia.org/wiki/File%3AATF%201923%20Garamond%20specimen%20description.jpg", creator: "American Type Founders", query: "typography specimen", temporary: true },
  { file: "/media/news/craft-4.jpg", width: 1400, height: 875, category: "craft", licence: "Public domain", source: "https://commons.wikimedia.org/wiki/File%3ALibrary%20of%20Congress%20book%20bindery%20LCCN2011647039.jpg", creator: "Miscellaneous Items in High Demand, PPOC, Library of Congress", query: "paper craft workshop", temporary: true },
  { file: "/media/news/programme-1.jpg", width: 1400, height: 875, category: "programme", licence: "CC0", source: "https://commons.wikimedia.org/wiki/File%3ADoris%20Pack%20receiving%20award%20from%20AAB%2C%202022.jpg", creator: "Makeitrightks", query: "award ceremony", temporary: true },
  { file: "/media/news/region-1.jpg", width: 1400, height: 875, category: "region", licence: "Public domain", source: "https://commons.wikimedia.org/wiki/File%3ADubai%20skyline%20in%20the%20evening.jpg", creator: "Lehtm25", query: "Dubai skyline", temporary: true },
  { file: "/media/news/region-2.jpg", width: 1400, height: 875, category: "region", licence: "CC0", source: "https://commons.wikimedia.org/wiki/File%3ADubai%20skyline%20unsplash.jpg", creator: "Robert Bock", query: "Dubai skyline", temporary: true },
  { file: "/media/news/region-3.jpg", width: 1400, height: 875, category: "region", licence: "Public domain", source: "https://commons.wikimedia.org/wiki/File%3ABeirut%20Museum.jpg", creator: "Elie plus (talk)", query: "Beirut architecture", temporary: true },
  { file: "/media/news/studio-1.jpg", width: 1400, height: 875, category: "studio", licence: "CC0", source: "https://commons.wikimedia.org/wiki/File%3ADesign%20for%20a%20church%20interior%20MET%20DP207591.jpg", creator: "Louis Comfort Tiffany / Tiffany Studios / Tiffany Studios / Tiffany Studios", query: "design studio interior", temporary: true },
  { file: "/media/news/studio-2.jpg", width: 1400, height: 875, category: "studio", licence: "CC0", source: "https://commons.wikimedia.org/wiki/File%3ADesign%20for%20a%20church%20interior%20MET%20DP206037.jpg", creator: "Louis Comfort Tiffany / Tiffany Studios / Tiffany Studios / Tiffany Studios", query: "design studio interior", temporary: true },
  { file: "/media/news/studio-3.jpg", width: 1400, height: 875, category: "studio", licence: "CC0", source: "https://commons.wikimedia.org/wiki/File%3AB%2BStudio%20interior%20design%20%26%20graphic.jpg", creator: "Mustafa Alhussaini", query: "design studio interior", temporary: true },
  { file: "/media/news/studio-4.jpg", width: 1400, height: 875, category: "studio", licence: "CC0", source: "https://commons.wikimedia.org/wiki/File%3AArchitecte%20Luzia%20Hartsuyker-Curjel%20achter%20de%20tekentafel%2C%20Bestanddeelnr%20934-0259.jpg", creator: "Rob Bogaerts for Anefo", query: "drafting table", temporary: true },
  { file: "/media/news/education-1.jpg", width: 1400, height: 875, category: "education", licence: "Public domain", source: "https://commons.wikimedia.org/wiki/File%3AMathematics%20lecture%20at%20the%20Helsinki%20University%20of%20Technology.jpg", creator: "Tungsten", query: "lecture hall students", temporary: true },
  { file: "/media/news/education-2.jpg", width: 1400, height: 875, category: "education", licence: "Public domain", source: "https://commons.wikimedia.org/wiki/File%3AA%20lecture%20at%20the%20ITM.jpg", creator: "George Serdechny", query: "lecture hall students", temporary: true },
  { file: "/media/news/education-3.jpg", width: 1400, height: 875, category: "education", licence: "Public domain", source: "https://commons.wikimedia.org/wiki/File%3ASTUDENTS%20OUTSIDE%20A%20LECTURE%20HALL%20AT%20THE%20HEBREW%20UNIVERSITY%20IN%20JERUSALEM.%20%D7%A1%D7%98%D7%95%D7%93%D7%A0%D7%98%D7%99%D7%9D%20%D7%9E%D7%A9%D7%95%D7%97%D7%97%D7%99%D7%9D%20%D7%91%D7%90%D7%95%D7%A0%D7%99%D7%91%D7%A8%D7%A1%D7%99%D7%98%D7%94%20%D7%94%D7%A2%D7%91%D7%A8%D7%99%D7%AA%20%D7%91%D7%94%D7%A8%20%D7%94%D7%A6%D7%95%D7%A4%D7%99%D7%9D%2C%20%D7%99%D7%A8%D7%95%D7%A9%D7%9C%D7%99%D7%9D.D10-093.jpg", creator: "Zoltan Kluger", query: "lecture hall students", temporary: true },
  { file: "/media/news/education-4.jpg", width: 1400, height: 875, category: "education", licence: "Public domain", source: "https://commons.wikimedia.org/wiki/File%3AStudio%20of%20the%20Minneapolis%20Art%20School%20-%20DPLA%20-%20446acd077b134ba7911ffaa5e042fc95.jpg", creator: "unknown", query: "art school studio", temporary: true },
  { file: "/media/news/programme-2.jpg", width: 1400, height: 875, category: "programme", licence: "CC0", source: "https://commons.wikimedia.org/wiki/File%3AClay%20target%20shooting%20competition%20Ukraine%20winner%20with%20trophy%202025.jpg", creator: "23IVAN", query: "trophy award", temporary: true },
  { file: "/media/news/region-4.jpg", width: 1400, height: 875, category: "region", licence: "Public domain", source: "https://commons.wikimedia.org/wiki/File%3AL'Architecture%20d'Aujourd'hui%20December%201954.jpg", creator: "L'Architecture d'Aujourd'hui", query: "Casablanca architecture", temporary: true },
  { file: "/media/news/programme-3.jpg", width: 1400, height: 875, category: "programme", licence: "CC0 / Public domain (as sourced for 1.1-1.7)", source: "repo:/media/ceremony-stage.jpg", creator: "Gridliners media library", query: "reused from the approved screens", temporary: true },
  { file: "/media/news/programme-4.jpg", width: 1400, height: 875, category: "programme", licence: "CC0 / Public domain (as sourced for 1.1-1.7)", source: "repo:/media/audience-hall.jpg", creator: "Gridliners media library", query: "reused from the approved screens", temporary: true },
  { file: "/media/news/programme-5.jpg", width: 1400, height: 875, category: "programme", licence: "CC0 / Public domain (as sourced for 1.1-1.7)", source: "repo:/media/award-moment.jpg", creator: "Gridliners media library", query: "reused from the approved screens", temporary: true },
  { file: "/media/news/programme-6.jpg", width: 1400, height: 875, category: "programme", licence: "CC0 / Public domain (as sourced for 1.1-1.7)", source: "repo:/media/community-panel.jpg", creator: "Gridliners media library", query: "reused from the approved screens", temporary: true },
  { file: "/media/news/region-5.jpg", width: 1400, height: 875, category: "region", licence: "CC0 / Public domain (as sourced for 1.1-1.7)", source: "repo:/media/city-dubai.jpg", creator: "Gridliners media library", query: "reused from the approved screens", temporary: true },
];
