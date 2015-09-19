import fs from "fs";
import path from "path";

let removeImages = (images) => {
    for (let image of images) {
        fs.unlink(image, (err) => {
            if (err) {
                console.log(err); //TODO add better error handling
            }
        });
    }
};

let createImages = (fileReq) => {
    let images = [];
    for (let file of fileReq) {
        images.push(`${ path.dirname(require.main.filename) }/uploads/${ file.filename }`);
    }
    return images;
};

export { removeImages, createImages};