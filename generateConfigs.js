import fs from "fs";

let files = ["database.js", "imgur.js", "jwt.js"];

for (let fileName of files) {
    fs.writeFile(`./config/${fileName}`, "export default {};", (err) => {
        if (err) {
            console.log(err);
        }
        console.log(`Created file: ./config/${fileName}`);
    });
}
