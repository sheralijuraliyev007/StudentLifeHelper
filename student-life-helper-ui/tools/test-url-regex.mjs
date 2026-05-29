const urls = [
  "http://localhost:5178/api/main-page/RoomPosts/Add",
  "http://localhost:5178/api/main-page/RoomPosts/AddContent/20",
  "http://localhost:5178/api/main-page/RoomPosts/AddContentAsync/20",
  "http://localhost:5178/api/main-page/RoomPosts/AddContentAsync",
];
function alternate(url) {
  if (url.endsWith("/AddAsync")) return url.replace(/\/AddAsync$/, "/Add");
  if (/\/RoomPosts\/Add$/.test(url)) return url.replace(/\/Add$/, "/AddAsync");
  const ac = url.match(/^(.*\/RoomPosts\/)AddContent\/(\d+)$/);
  if (ac) return `${ac[1]}AddContentAsync/${ac[2]}`;
  return null;
}
for (const url of urls) {
  console.log(url, "->", alternate(url));
}
