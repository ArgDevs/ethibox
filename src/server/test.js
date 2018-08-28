import express from 'express';
import bcrypt from 'bcrypt';
import { Package, Application, User, Settings } from './models';
import { reset } from './utils';

const app = express();

app.post('/packages', async (req, res) => {
    const { packages } = req.body;
    await Package.bulkCreate(packages);
    return res.send('ok');
});

app.post('/applications', async (req, res) => {
    const { applications } = req.body;
    applications.forEach((a) => {
        const application = Application.build(a);
        application.setUser(a.user, { save: false });
        application.setPackage(a.pkg, { save: false });
        application.save();
    });
    return res.send('ok');
});

app.post('/settings', async (req, res) => {
    const { settings } = req.body;
    await Settings.bulkCreate(settings);
    return res.send('ok');
});

app.post('/users', async (req, res) => {
    const { users } = req.body;
    users.map((user) => {
        const hashPassword = bcrypt.hashSync(user.password, 10);
        user.password = hashPassword;
        return user;
    });
    await User.bulkCreate(users);
    return res.send('ok');
});

app.get('/reset', async (req, res) => {
    await reset();
    return res.send('ok');
});

app.delete('/applications/:releaseName', async (req, res) => {
    const { releaseName } = req.params;
    Application.destroy({ where: { releaseName } });
    return res.send('ok');
});

app.put('/applications/:releaseName', async (req, res) => {
    const { releaseName } = req.params;
    const { state } = req.body;
    Application.update({ state }, { where: { releaseName } });
    return res.send('ok');
});

app.get('/users', async (req, res) => {
    const users = await User.findAll();
    return res.json(users);
});

app.get('/packages', async (req, res) => {
    const packages = await Package.findAll();
    return res.json(packages);
});

app.get('/apps.json', async (req, res) => {
    const appsFile = [
        {
            name: 'wordpress',
            icon: 'https://charts.ethibox.fr/charts/wordpress/icon.png',
            category: 'Blog',
            stackFileUrl: 'https://charts.ethibox.fr/packages/wordpress-0.1.0.tgz',
            orchestrator: 'kubernetes',
        },
        {
            name: 'etherpad',
            icon: 'https://charts.ethibox.fr/charts/etherpad/icon.png',
            category: 'Editor',
            stackFileUrl: 'https://charts.ethibox.fr/packages/etherpad-0.1.0.tgz',
            orchestrator: 'kubernetes',
        },
    ];

    return res.json(appsFile);
});

export default app;
