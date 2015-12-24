import fs from "fs";

fs.writeFile(`./config/database.js`, "export default { url: \"\" };", (err) => {
    if (err) {
        console.log(err);
    }
    console.log(`Created file: ./config/database.js`);
});

fs.writeFile(`./config/imgur.js`, "export default { clientId: \"\" };", (err) => {
    if (err) {
        console.log(err);
    }
    console.log(`Created file: ./config/imgur.js`);
});

fs.writeFile(`./config/jwt.js`, "export default { secret: \"secret\", tokenExp: \"24h\" };", (err) => {
    if (err) {
        console.log(err);
    }
    console.log(`Created file: ./config/jwt.js`);
});
