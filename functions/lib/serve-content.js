"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const admin = require("firebase-admin");
const template_1 = require("./template");
const page_1 = require("./page");
let database = null;
function initDatabase() {
    if (database === null) {
        const firebaseConfig = JSON.parse(process.env.FIREBASE_CONFIG);
        firebaseConfig.databaseAuthVariableOverride = {
            uid: 'update-service'
        };
        const app = admin.initializeApp(firebaseConfig, 'serve-content');
        database = app.database();
    }
    return database;
}
async function newsIndex(req, res) {
    const db = initDatabase();
    const language = req.params.language || 'fr';
    const snapshot = await db
        .ref(`content/news`)
        .orderByChild('language')
        .equalTo(language)
        .once('value');
    let newsList = snapshot.val() || {};
    newsList = Object.keys(newsList)
        .map(k => newsList[k])
        .sort((a, b) => {
        try {
            return a.createdAt.localeCompare(b.createdAt);
        }
        catch (e) {
            return 0;
        }
    })
        .reverse();
    const newsListHTML = template_1.default('news-list', language, {
        newsList
    });
    const result = page_1.default('toutes-nos-actualites', language, [
        [newsListHTML, /NEWS_LIST/]
    ]);
    res.set('Cache-Control', 'public, max-age=1800, s-maxage=1800');
    res.send(result);
}
async function newsPage(req, res) {
    const db = initDatabase();
    const language = req.params.language || 'fr';
    const newsId = req.params.id;
    const snapshot = await db
        .ref(`content/news`)
        .orderByChild('language')
        .equalTo(language)
        .once('value');
    const allNews = snapshot.val();
    const news = allNews[newsId];
    const newsList = Object.keys(allNews)
        .map(k => allNews[k])
        .sort((a, b) => {
        try {
            return a.createdAt.localeCompare(b.createdAt);
        }
        catch (e) {
            return 0;
        }
    })
        .reverse();
    const newsPosition = newsList.indexOf(news);
    const previousNews = newsList[newsPosition - 1];
    const nextNews = newsList[newsPosition + 1];
    const newsHTML = template_1.default('news-page', language, {
        news,
        previousNews,
        nextNews
    });
    const sharingMetas = template_1.default('news-sharing-metas', language, {
        news
    });
    const result = page_1.default('actualite', language, [
        [sharingMetas, /SHARING_METAS/g],
        [newsHTML, /NEWS_CONTENT/],
        [news.title, /NEWS_TITLE/g]
    ]);
    res.set('Cache-Control', 'public, max-age=1800, s-maxage=1800');
    res.send(result);
}
async function jobsIndex(req, res) {
    const db = initDatabase();
    const language = req.params.language || 'fr';
    const snapshot = await db
        .ref(`content/jobOffers`)
        .orderByChild('language')
        .equalTo(language)
        .once('value');
    let jobsList = snapshot.val() || {};
    jobsList = Object.keys(jobsList)
        .map(k => jobsList[k])
        .sort((a, b) => {
        try {
            return a.createdAt.localeCompare(b.createdAt);
        }
        catch (e) {
            return 0;
        }
    })
        .reverse();
    const jobsListHTML = template_1.default('jobs-list', language, {
        jobsList
    });
    const result = page_1.default('offres-emploi', language, [
        [jobsListHTML, /JOBS_LIST/]
    ]);
    res.set('Cache-Control', 'public, max-age=1800, s-maxage=1800');
    res.send(result);
}
async function jobPage(req, res) {
    const db = initDatabase();
    const language = req.params.language || 'fr';
    const jobId = req.params.id;
    const snapshot = await db.ref(`content/jobOffers/${jobId}`).once('value');
    const job = snapshot.val();
    const jobHTML = template_1.default('job-page', language, {
        job
    });
    const sharingMetas = template_1.default('job-sharing-metas', language, {
        job
    });
    const result = page_1.default('offre-emploi', language, [
        [sharingMetas, /SHARING_METAS/g],
        [jobHTML, /JOB_CONTENT/],
        [job.title, /JOB_TITLE/g]
    ]);
    res.set('Cache-Control', 'public, max-age=1800, s-maxage=1800');
    res.send(result);
}
exports.default = {
    newsIndex,
    newsPage,
    jobsIndex,
    jobPage
};
//# sourceMappingURL=serve-content.js.map