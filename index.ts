const express = require('express');
const routes = require('./src/routes');
const app = express();
const port = process.env.PORT || 9000;

routes(app);

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
