const Profile = require('./classes/profile');
const Ranked = require('./classes/ranked');

async function get_profile_data (username, region) {
    const profile = new Profile();
    const ranked = new Ranked();
    await profile.get_profile(username, region);
    await ranked.set_profile(profile);
    await ranked.get_ranked();
    return ranked;
}