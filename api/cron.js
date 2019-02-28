const Parser = require('rss-parser');
const _ = require('lodash');
const parser = new Parser();

const matches = (keywords, announcements) => {
    const regex = new RegExp(keywords.join('|'));

};

exports.exploreAnnouncements = async (event, context) => {
    console.log('Event', event);
    const { keywords } = event;

    try {
        const feed = await parser.parseURL('https://aws.amazon.com/new/feed/');
        feed.items.forEach(announcement => {
            const title = _.lowerCase(announcement.title);
            console.log('Title: ', title);
            console.log('Regex Result: ', regex.exec(title));
        });
        return true;

    } catch (e) {
        console.error('Caca', e);
        return false;
    }
};