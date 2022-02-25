const express = require('express');
const app = express();
const path = require('path');
const PORT = process.env.PORT || 3003;
const fs = require('fs')
// static resources should just be served as they are
app.use(express.static(
    path.resolve(__dirname, '..', 'build'),
    { maxAge: '30d' },
));

const indexPath  = path.resolve(__dirname, '..', 'build', 'index.html');
app.get('/*', (req, res, next) => {
    fs.readFile(indexPath, 'utf8', (err, htmlData) => {
        if (err) {
            console.error('Error during file reading', err);
            return res.status(404).end()
        }
        // TODO get post info

        // TODO inject meta tags
        htmlData = htmlData.replace(
            "<title>React App</title>",
            `<title>${'title'}</title>`
        )
            .replace('__META_OG_TITLE__', 'post.title')
            .replace('__META_OG_DESCRIPTION__', 'post.description')
            .replace('__META_DESCRIPTION__', 'post.description')
            .replace('__META_OG_IMAGE__', 'post.thumbnail')
        return res.send(htmlData);
    });
});

app.listen(PORT, (error) => {
    if (error) {
        return console.log('Error during app startup', error);
    }
    console.log("listening on " + PORT + "...");
});
